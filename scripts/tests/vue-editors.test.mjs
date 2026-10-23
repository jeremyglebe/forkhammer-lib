import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { rollup } from "rollup";
import vue from "rollup-plugin-vue";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { window, effectDocument, formValues } from "./fixtures/foundry-editor-host.mjs";

test("faithful Vue script editors", async t =>
{
    const directory = await mkdtemp(resolve(".editor-test-"));
    const bundle = await rollup({
        input: "scripts/tests/fixtures/vue-editors-entry.js",
        external: ["vue", "pinia"],
        plugins: [vue({ compilerOptions: { isCustomElement: tag => tag === "code-mirror" } }), nodeResolve()]
    });
    const entry = join(directory, "editors.mjs");
    await bundle.write({ file: entry, format: "es" });
    await bundle.close();
    t.after(async () => { await rm(directory, { recursive: true, force: true }); await window.happyDOM.close(); });
    const { ScriptEditor, EffectScriptEditor } = await import(pathToFileURL(entry));

    await t.test("plain editor preserves native form layout, code text, submit callback and close", async () =>
    {
        const script = "if (args.value < 4) {\n  return '<tag> & \"quoted\"';\n}";
        let submitted;
        const app = new ScriptEditor(null, { script, resolve: value => { submitted = value; } });
        await app.render(true);
        assert.deepEqual(Array.from(app.content.children).map(node => node.dataset.applicationPart), ["editor", "footer"]);
        assert.equal(app.element.querySelector("code-mirror").value, script);
        assert.equal(formValues(app.element).object.script, script);
        assert.equal(app.element.querySelector("button").type, "submit");
        app.element.querySelector("code-mirror").value = "return 42;";
        assert.equal(submitted, undefined);
        await app.submit();
        assert.equal(submitted, "return 42;");
        assert.equal(app.element, null);
    });

    await t.test("plain document edits use the existing path update", async () =>
    {
        const document = effectDocument();
        const app = new ScriptEditor(document, { path: "system.scriptData.0.script" });
        await app.render(true);
        app.element.querySelector("code-mirror").value = "return 7;";
        await app.submit();
        assert.deepEqual(document.updates, [{ "system.scriptData.0.script": "return 7;" }]);
    });

    await t.test("conditional controls and script fields match every upstream trigger", async () =>
    {
        for (const [trigger, fields, flags] of [
            ["dialog", ["script", "hideScript", "activateScript", "submissionScript"], ["runIfDisabled", "targeter", "defending"]],
            ["manual", ["script", "hideScript"], ["runIfDisabled", "showDuplicates"]],
            ["immediate", ["script"], ["runIfDisabled", "deleteEffect"]],
            ["update", ["script"], ["runIfDisabled"]]
        ])
        {
            const document = effectDocument(trigger);
            const app = new EffectScriptEditor(document, { index: 0, position: { width: 640 } });
            await app.render(true);
            assert.equal(app.options.position.width, 640);
            assert.equal(app.element.querySelector("footer"), null);
            assert.deepEqual(Array.from(app.element.querySelectorAll("code-mirror")).map(el => el.name), fields);
            assert.deepEqual(Array.from(app.element.querySelectorAll('input[type="checkbox"]')).map(el => el.name), flags);
            assert.equal(app.element.querySelector("[name=runIfDisabled]").checked, true);
            assert.equal(app.element.querySelector("[name=trigger]").value, trigger);
            assert.equal(document.updates.length, 0);
            await app.render(true);
            assert.equal(document.updates.length, 0, "render must not dispatch an autosave");
            app.close();
        }
        const document = effectDocument();
        document.system.transferData.documentType = "Item";
        const app = new EffectScriptEditor(document, { index: 0 });
        await app.render(true);
        assert.equal(app.element.querySelector("[name=targeter]"), null);
        app.close();
    });

    await t.test("label, checkbox, and code changes autosave through the original submit handler", async () =>
    {
        const document = effectDocument();
        const app = new EffectScriptEditor(document, { index: 0 });
        await app.render(true);
        const checkbox = app.element.querySelector("[name=runIfDisabled]");
        checkbox.checked = false;
        checkbox.dispatchEvent(new window.Event("change", { bubbles: true }));
        await app.pending;
        assert.equal(document.system.scriptData[0].options.runIfDisabled, false);
        const label = app.element.querySelector("[name=label]");
        label.value = "Updated script";
        label.dispatchEvent(new window.Event("change", { bubbles: true }));
        await app.pending;
        app.element.querySelector("code-mirror[name=script]").value = "return 99;";
        await app.pending;
        assert.equal(document.system.scriptData[0].label, "Updated script");
        assert.equal(document.system.scriptData[0].script, "return 99;");
        assert.equal(document.updates.length, 3);
        app.close();
    });

    await t.test("trigger changes refresh conditional controls and every control has an accessible label", async () =>
    {
        const document = effectDocument("dialog");
        const app = new EffectScriptEditor(document, { index: 0 });
        await app.render(true);
        for (const field of app.element.querySelectorAll("input, select, code-mirror"))
        {
            assert.ok(field.getAttribute("aria-label"), `${field.name} has a rendered accessible name`);
            assert.ok(app.element.querySelector(`label[for="${field.id}"]`), `${field.name} has an associated visible label`);
        }
        const trigger = app.element.querySelector("[name=trigger]");
        trigger.value = "manual";
        trigger.dispatchEvent(new window.Event("change", { bubbles: true }));
        await app.pending;
        assert.equal(document.system.scriptData[0].trigger, "manual");
        assert.equal(app.element.querySelector("[name=defending]"), null);
        assert.ok(app.element.querySelector("[name=showDuplicates]"));
        assert.deepEqual(Array.from(app.element.querySelectorAll("code-mirror")).map(el => el.name), ["script", "hideScript"]);
        assert.equal(document.system.scriptData[0].options.activateScript, "return true;");
        assert.equal(document.updates.length, 1, "rerender must not produce another autosave");
        app.close();
    });

    await t.test("references lock, dereference, copy, and unlock without overwriting stored reference", async () =>
    {
        const document = effectDocument("manual");
        document.system.scriptData[0].script = "[Script.abcdefghijklmnop]";
        const app = new EffectScriptEditor(document, { index: 0 });
        await app.render(true);
        const editor = app.element.querySelector("code-mirror");
        assert.equal(editor.disabled, true);
        assert.equal(editor.name, null);
        assert.equal(editor.value, "return args.value + 2;");
        assert.equal(formValues(app.element).object.script, undefined);
        app.element.querySelector('[data-action="copyScript"]').click();
        await app.pending;
        assert.equal(game.clipboard.values.at(-1), "return args.value + 2;");
        const lock = app.element.querySelector('[data-action="toggleLock"]');
        lock.checked = false;
        await EffectScriptEditor._onToggleLock.call(app, new window.Event("click"), lock);
        assert.equal(app.element.querySelector("code-mirror[name=script]").disabled, false);
        assert.equal(app.element.querySelector("code-mirror[name=script]").value, "[Script.abcdefghijklmnop]");
        assert.equal(document.updates.length, 0);
        app.close();
    });

    await t.test("non-GM script controls remain disabled, and windows keep independent values", async () =>
    {
        game.user.isGM = false;
        const app = new EffectScriptEditor(effectDocument(), { index: 0 });
        await app.render(true);
        assert.ok(Array.from(app.element.querySelectorAll("code-mirror")).every(el => el.disabled));
        assert.equal(formValues(app.element).object.script, undefined);
        app.close();
        game.user.isGM = true;
        const left = new ScriptEditor(null, { script: "left" });
        const right = new ScriptEditor(null, { script: "right" });
        await left.render(true); await right.render(true);
        left.element.querySelector("code-mirror").value = "edited";
        assert.equal(right.element.querySelector("code-mirror").value, "right");
        left.close();
        assert.equal(right.element.querySelector("code-mirror").value, "right");
        right.close();
    });
});
