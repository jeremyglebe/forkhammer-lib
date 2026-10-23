# Forkhammer Lib

One shared local Foundry VTT framework for custom systems, forked from Moo Man's
[Warhammer Library](https://github.com/moo-man/WarhammerLibrary-FVTT) 3.5.1 at
`15076301ab1ed4325d237ed0a034d167426c9405`. The upstream Apache-2.0 license and
attributions are retained in `LICENSE` and `NOTICE`.

This is a separate module, `forkhammer-lib`, with public API `globalThis.forkhammer`.
It does not replace the installed `warhammer-lib`. Official Warhammer systems keep
using their original library. Forkhammer serves custom systems from this single
repository, rather than maintaining one fork per system. No remote publishing or
update endpoint is configured.

## Local build

```sh
npm ci
npm run build
npm test
```

`dist/` contains the local installable module: `module.json`, `forkhammer-lib.js`,
`forkhammer.css`, templates, translations, assets, and attribution files. The build
uses the explicit source manifest version, not an upstream Git tag. `npm run dev`
watches the same output. Build output, dependencies, Foundry runtime data, and local
configuration remain ignored.

The bundle includes Vue runtime packages and Pinia. The build writes their complete
copyright and license notices to `dist/THIRD-PARTY-LICENSES.txt`, alongside the
upstream Apache-2.0 `LICENSE` and fork `NOTICE`. It collects notices from every npm
package contributing runtime code and fails if a dependency's license text is absent.
Keep all three files with copied or distributed builds.

The Foundry version is `3.5.1.1`: upstream baseline 3.5.1 followed by fork revision 1.
The npm package uses the matching SemVer `3.5.1-forkhammer.1`. Numeric manifest parts
are intentional because Foundry's version comparison is not SemVer prerelease
comparison. Source changes belong here; do not edit installed copies in Foundry Data.

For a system generated from the configured template, install the built module with:

```sh
npm run forkhammer:install -- --from /absolute/path/to/forkhammer-lib/dist
```

Run that command in the consuming system repository. Its installer validates the
package identity, version, Foundry compatibility and supported system, then copies
the build into that project's configured local Foundry Data directory. This repository
itself does not select or modify a Foundry installation.

## Register a custom system

Foundry filters modules by the supported-system IDs in their manifests. Register each
actual system ID once in this shared fork, rebuild, then reinstall:

```sh
npm run register-system -- my-custom-system
npm run build
npm run register-system -- --list
```

The initial registrations are `fvtt-template` and `rifts`. Repeated registration is a
no-op. The tool rejects official upstream system IDs (`wfrp4e`, `whtow`, `impmal`,
`wrath-and-glory`, and `age-of-sigmar-soulbound`). Registering an ID permits loading;
it does not implement the system's required model or effect contracts.

Consumers declare a required library relationship in their own system manifest:

```json
{
  "relationships": {
    "requires": [
      {
        "id": "forkhammer-lib",
        "type": "module",
        "compatibility": { "minimum": "3.5.1.1", "verified": "3.5.1.1" }
      }
    ]
  }
}
```

There are deliberately no invented manifest/download URLs. Local installation and
system registration are explicit until a real distribution destination is chosen.

## Runtime contract

The namespaces remain `forkhammer.utility`, `forkhammer.apps`, `forkhammer.models`,
and `forkhammer.documents`. Public class names such as `WarhammerActor`,
`WarhammerActiveEffect`, and `BaseWarhammerActorModel` are retained to minimize
unnecessary divergence from the upstream engine.

The classic library bundle loads before a system's modules. It assigns the complete
public API, then calls `Hooks.callAll("forkhammerReady", forkhammer)`. A consumer should
use the already available API or subscribe to that hook if it is not available yet:

```js
function connectLibrary(library) {
  // Define the system's document/model subclasses here; register them at Foundry init.
}
if (globalThis.forkhammer) connectLibrary(globalThis.forkhammer);
else Hooks.once("forkhammerReady", connectLibrary);
```

Consumers provide `game[game.system.id].config`, their Actor/Item/ActiveEffect model
and document specializations, and applicable trigger calls. Use a copy of
`forkhammer.apps.defaultWarhammerConfig`, plus system fields such as `conditions`,
`effectScripts`, `logFormat`, and resistance configuration. The original checklist is
preserved in `docs/Upstream-Integration.md`; substitute the Forkhammer package/API
names and use the consuming system's own mechanics and interface architecture.

The framework supplies effect transfer, scripts, lifecycle triggers, references,
choices, and reusable interfaces. It does not impose WFRP's dice or success levels.
A system can retain native Foundry Rolls and its own pure resolution functions.
Test-linked effects and library chat actions additionally need a compatible source-test
or message adapter; basic passive effects do not require the full test hierarchy.

The fork scopes its package paths, settings, content provenance flags, CSS class
names, custom elements, and browser API separately from upstream. Existing query
handlers remain under the active system ID. Upstream class names, localization keys,
and the effect engine are retained. Both libraries register broad host hooks and
some prototype overrides, so this is an installed-package separation, not a promise
that both libraries should be activated in the same world.

The optional bug reporter has no default external destination. A consuming system
must explicitly supply both `bugReporterConfig.repoEndpoint` and
`bugReporterConfig.submitEndpoint` to expose it. Assignees default to an empty list;
optional module version lookups use `bugReporterConfig.moduleManifestEndpoints`
keyed by module ID. Upstream submission services, support links, and publishing
workflows are not configured for this fork.

## Maintenance

Keep the fetch-only `upstream` remote and upstream history. No `origin`, remote
creation, push, release publication, or deployment is implied. Review upstream
changes explicitly and rebuild the fork before updating consumers. Preserve Apache
licensing and third-party notices when distributing derived builds. Tests cover
manifest isolation, built asset/API identity, local registration and the Vue editor's
integration contracts; they do not substitute for an actual consuming-system runtime
check.
