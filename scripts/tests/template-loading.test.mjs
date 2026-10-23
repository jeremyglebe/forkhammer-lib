import assert from "node:assert/strict";
import { test } from "node:test";
import registerHandlebars from "../../src/hooks/handlebars.js";

test("ready loads core partials and only requests a configured avoidance template", t => {
  const previous = { Hooks: globalThis.Hooks, foundry: globalThis.foundry, game: globalThis.game };
  t.after(() => Object.assign(globalThis, previous));
  let ready;
  let requested;
  globalThis.Hooks = { on: (name, handler) => {
    assert.equal(name, "ready");
    ready = handler;
  } };
  globalThis.foundry = { applications: { handlebars: { loadTemplates: paths => {
    requested = paths;
    assert.ok(Object.values(paths).every(path => typeof path === "string" && path.length > 0));
  } } } };
  globalThis.game = { system: { id: "custom-system" }, "custom-system": { config: {} } };
  registerHandlebars();

  for (const value of [undefined, null, "", "systems/custom-system/avoid-test.hbs"]) {
    game[game.system.id].config.avoidTestTemplate = value;
    ready();
    assert.equal(requested.dialogModifiers, "modules/forkhammer-lib/templates/partials/dialog-modifiers.hbs");
    if (value) assert.equal(requested.avoidTestDetails, value);
    else assert.equal(Object.hasOwn(requested, "avoidTestDetails"), false);
  }
});
