import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import { upstreamSystemIds } from "../register-system.mjs";

const root = new URL("../../", import.meta.url);
const json = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));

test("source manifest owns a distinct local identity and custom-system allowlist", async () => {
  const manifest = await json("module.json");
  const pkg = await json("package.json");
  assert.equal(manifest.id, "forkhammer-lib");
  assert.equal(manifest.title, "Forkhammer Lib");
  assert.equal(pkg.name, manifest.id);
  assert.equal(manifest.library, true);
  assert.equal(pkg.license, "Apache-2.0");
  assert.equal(pkg.private, true);
  assert.match(manifest.version, /^\d+\.\d+\.\d+\.\d+$/);
  const [major, minor, patch, revision] = manifest.version.split(".");
  assert.equal(pkg.version, `${major}.${minor}.${patch}-forkhammer.${revision}`);
  assert.equal(manifest.manifest, "https://github.com/jeremyglebe/forkhammer-lib/releases/latest/download/module.json");
  assert.equal(manifest.download, `https://github.com/jeremyglebe/forkhammer-lib/releases/download/v${manifest.version}/forkhammer-lib.zip`);
  const systems = manifest.relationships.systems.map((system) => system.id);
  assert.ok(systems.includes("fvtt-template") && systems.includes("rifts"));
  assert.equal(new Set(systems).size, systems.length);
  assert.ok(systems.every((id) => !upstreamSystemIds.includes(id)));
  assert.deepEqual(manifest.scripts, ["forkhammer-lib.js"]);
  assert.deepEqual(manifest.styles, [{ src: "forkhammer.css", layer: "system" }]);
});

test("built package contains its declared assets and preserved licensing", async () => {
  const manifest = await json("dist/module.json");
  assert.deepEqual(manifest, await json("module.json"));
  for (const path of [...manifest.scripts, ...manifest.styles.map((style) => style.src), ...manifest.languages.map((language) => language.path), "LICENSE", "NOTICE", "THIRD-PARTY-LICENSES.txt"])
    await access(new URL(`dist/${path}`, root));
  assert.equal(await readFile(new URL("dist/LICENSE", root), "utf8"), await readFile(new URL("LICENSE", root), "utf8"));
  assert.match(await readFile(new URL("dist/NOTICE", root), "utf8"), /15076301ab1ed4325d237ed0a034d167426c9405/);
});

test("built runtime retains complete Vue and Pinia license texts and dependency versions", async () => {
  const notices = await readFile(new URL("dist/THIRD-PARTY-LICENSES.txt", root), "utf8");
  for (const name of ["@vue/shared", "@vue/reactivity", "@vue/runtime-core", "@vue/runtime-dom", "pinia"]) {
    const metadata = await json(`node_modules/${name}/package.json`);
    const license = (await readFile(new URL(`node_modules/${name}/LICENSE`, root), "utf8")).trim();
    assert.ok(notices.includes(`${name}@${metadata.version}`), `Missing runtime attribution: ${name}`);
    assert.ok(notices.includes(license), `Missing complete license: ${name}`);
  }
  assert.ok(!notices.includes("rollup@") && !notices.includes("happy-dom@"), "Build/test tools are not runtime dependencies.");
});

test("built runtime exposes the fork API without upstream package/global or element collisions", async () => {
  const source = await readFile(new URL("dist/forkhammer-lib.js", root), "utf8");
  const publicAssignment = source.match(/globalThis\.forkhammer\s*=\s*([\w$]+)/);
  assert.ok(publicAssignment, "The bundle must assign its public forkhammer API.");
  const apiName = publicAssignment[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.ok(/Hooks\.callAll\(["']forkhammerReady["']/.test(source), "The bundle must emit its readiness hook.");
  assert.ok(source.indexOf("globalThis.forkhammer") < source.search(/Hooks\.callAll\(["']forkhammerReady["']/));
  for (const namespace of ["utility", "apps", "models", "documents"])
    assert.ok(new RegExp(`${apiName}\\.${namespace}\\s*=`).test(source), `The public API must expose ${namespace}.`);
  assert.match(source, /customElements\.define\(["']forkhammer-filter-state["']/);
  assert.match(source, /customElements\.define\(["']forkhammer-checkbox["']/);
  assert.doesNotMatch(source, /modules\/warhammer-lib|globalThis\.warhammer\s*=|\bwarhammer\s*=|["']module\.warhammer-lib["']/);
  assert.ok(!/lambda-url\.us-east-2\.on\.aws|foundry-c7-manifests|discord\.gg\/GrMcdeDHh8/.test(source), "Fork builds must not route reporting or support to upstream services.");
  assert.doesNotMatch(source, /customElements\.define\(["'](?:filter-state|warhammer-checkbox)["']/);
  const css = await readFile(new URL("dist/forkhammer.css", root), "utf8");
  assert.match(css, /\.forkhammer/);
  assert.doesNotMatch(css, /\.warhammer\b|modules\/warhammer-lib/);
});
