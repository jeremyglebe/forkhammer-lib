import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const upstreamSystemIds = Object.freeze([
  "wfrp4e", "whtow", "impmal", "wrath-and-glory", "age-of-sigmar-soulbound",
]);

export function registerSystem(manifest, id) {
  if (manifest.id !== "forkhammer-lib") throw new Error("Expected the Forkhammer Lib manifest.");
  if (typeof id !== "string" || !/^[a-z0-9][a-z0-9_-]*$/.test(id))
    throw new Error("Use the actual lowercase Foundry system ID, containing letters, digits, hyphens, or underscores.");
  if (upstreamSystemIds.includes(id))
    throw new Error(`${id} is an upstream Warhammer system; keep using its official Warhammer Library.`);
  const systems = manifest.relationships?.systems ?? [];
  if (systems.some((system) => system.id === id)) return manifest;
  return {
    ...manifest,
    relationships: {
      ...manifest.relationships,
      systems: [...systems, { id, type: "system" }].sort((a, b) => a.id.localeCompare(b.id)),
    },
  };
}

export async function registerSystemFile(manifestPath, id) {
  const original = JSON.parse(await readFile(manifestPath, "utf8"));
  const updated = registerSystem(original, id);
  if (updated === original) return false;
  const temporary = `${manifestPath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(updated, null, 2)}\n`, { flag: "wx" });
  try {
    await rename(temporary, manifestPath);
  } finally {
    await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error; });
  }
  return true;
}

async function main(args) {
  const manifestPath = fileURLToPath(new URL("../module.json", import.meta.url));
  if (args.length === 1 && args[0] === "--list") {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    process.stdout.write(`${manifest.relationships.systems.map((system) => system.id).join("\n")}\n`);
    return;
  }
  if (args.length !== 1 || args[0] === "--help") {
    process.stdout.write("Usage: npm run register-system -- <actual-system-id>\n       npm run register-system -- --list\n");
    if (args[0] !== "--help") process.exitCode = 1;
    return;
  }
  const changed = await registerSystemFile(manifestPath, args[0]);
  process.stdout.write(changed
    ? `Registered ${args[0]}. Run npm run build, then reinstall the local module.\n`
    : `${args[0]} is already registered; the manifest was unchanged.\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
