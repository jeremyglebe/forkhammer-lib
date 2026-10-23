import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

// Include the complete notices for packages that contribute code to the runtime bundle.
// Build tools are not redistributed; dependency updates refresh the names, versions and texts.
export function bundledLicenses() {
  return {
    name: "bundled-runtime-licenses",
    generateBundle(_options, output) {
      const packages = new Map();
      for (const chunk of Object.values(output)) {
        if (chunk.type !== "chunk") continue;
        for (const [id, module] of Object.entries(chunk.modules)) {
          if (!module.renderedLength) continue;
          const file = id.split("?")[0];
          if (!isAbsolute(file) || !/[\\/]node_modules[\\/]/.test(file)) continue;
          let directory = dirname(file);
          let attributed = false;
          while (dirname(directory) !== directory && /[\\/]node_modules[\\/]/.test(directory)) {
            const metadataPath = join(directory, "package.json");
            if (existsSync(metadataPath)) {
              const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
              if (metadata.name && metadata.version) {
                const licensePath = ["LICENSE", "LICENSE.md", "LICENSE.txt", "license", "license.md", "license.txt"]
                  .map(name => join(directory, name)).find(existsSync);
                if (!licensePath) this.error(`Bundled dependency ${metadata.name} needs its full license notice.`);
                const license = readFileSync(licensePath, "utf8").trim();
                if (!license) this.error(`Bundled dependency ${metadata.name} has an empty license notice.`);
                this.addWatchFile(metadataPath);
                this.addWatchFile(licensePath);
                packages.set(`${metadata.name}@${metadata.version}`, license);
                attributed = true;
                break;
              }
            }
            directory = dirname(directory);
          }
          if (!attributed) this.error(`Cannot identify the bundled dependency owning ${file}.`);
        }
      }
      const sections = [...packages.entries()].sort(([a], [b]) => a.localeCompare(b))
        .map(([name, license]) => `${name}\n${"=".repeat(name.length)}\n\n${license}`);
      this.emitFile({
        type: "asset",
        fileName: "THIRD-PARTY-LICENSES.txt",
        source: `Forkhammer Lib bundled runtime dependencies\n\n` +
          `These notices supplement the upstream Apache-2.0 LICENSE and NOTICE.\n` +
          `They are generated from the packages whose code is included in this build.\n\n` +
          sections.join("\n\n------------------------------------------------------------\n\n") + "\n"
      });
    }
  };
}
