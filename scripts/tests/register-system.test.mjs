import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { registerSystem, registerSystemFile, upstreamSystemIds } from "../register-system.mjs";

const manifest = () => ({
  id: "forkhammer-lib", version: "3.5.1.1", library: true,
  relationships: { systems: [{ id: "rifts", type: "system" }], requires: [{ id: "other-library", type: "module" }] },
});

test("registering a custom system preserves metadata and existing relationships", () => {
  const original = manifest();
  const result = registerSystem(original, "my-custom-system");
  assert.deepEqual(result.relationships.systems, [
    { id: "my-custom-system", type: "system" }, { id: "rifts", type: "system" },
  ]);
  assert.deepEqual(result.relationships.requires, original.relationships.requires);
  assert.equal(result.version, original.version);
  assert.equal(result.library, true);
  assert.equal(original.relationships.systems.length, 1);
  assert.equal(registerSystem(result, "my-custom-system"), result);
});

test("upstream systems and unsafe or missing IDs are rejected", () => {
  for (const id of [...upstreamSystemIds, "", "../system", "Rifts", "my system", null, undefined])
    assert.throws(() => registerSystem(manifest(), id));
  assert.throws(() => registerSystem({ id: "warhammer-lib" }, "rifts"));
});

test("registration writes one valid manifest and repeated registration is a no-op", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "forkhammer-system-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "module.json");
  await writeFile(path, `${JSON.stringify(manifest())}\n`);
  assert.equal(await registerSystemFile(path, "fvtt-template"), true);
  const first = await readFile(path, "utf8");
  assert.equal(JSON.parse(first).relationships.systems.length, 2);
  assert.equal(await registerSystemFile(path, "fvtt-template"), false);
  assert.equal(await readFile(path, "utf8"), first);
  await assert.rejects(registerSystemFile(path, "wfrp4e"));
  assert.equal(await readFile(path, "utf8"), first);
});
