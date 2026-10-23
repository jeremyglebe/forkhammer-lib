import { Window } from "happy-dom";

export const window = new Window();
Object.defineProperty(globalThis, "localStorage", { value: window.localStorage, configurable: true });
for (const key of ["window", "document", "Element", "HTMLElement", "SVGElement", "Node", "Event", "KeyboardEvent", "CustomEvent", "customElements"])
{
    globalThis[key] = key === "window" ? window : window[key];
}

class CodeMirrorFixture extends window.HTMLElement
{
    _value = "";
    get name() { return this.getAttribute("name"); }
    set name(value) { if (value == null) { this.removeAttribute("name"); } else { this.setAttribute("name", value); } }
    get value() { return this._value; }
    set value(value)
    {
        this._value = value;
        // Match Foundry's public setter: a programmatic assignment can submit a connected form.
        this.dispatchEvent(new window.Event("input", { bubbles: true }));
        this.dispatchEvent(new window.Event("change", { bubbles: true }));
    }
    get disabled() { return this.hasAttribute("disabled"); }
    set disabled(value) { this.toggleAttribute("disabled", value); }
}
window.customElements.define("code-mirror", CodeMirrorFixture);

function merge(target, source)
{
    for (const [key, value] of Object.entries(source))
    {
        if (Array.isArray(value)) { target[key] = [...(target[key] ?? []), ...value]; }
        else if (value && typeof value === "object") { target[key] = merge(target[key] ?? {}, value); }
        else { target[key] = value; }
    }
    return target;
}

export function formValues(form)
{
    const object = {};
    for (const field of form.querySelectorAll("[name]"))
    {
        if (field.disabled) { continue; }
        object[field.name] = field.type === "checkbox" ? field.checked : field.value;
    }
    return { object };
}

class ApplicationV2Fixture
{
    static DEFAULT_OPTIONS = {};
    constructor(options = {})
    {
        this.options = {};
        const chain = [];
        for (let cls = this.constructor; cls; cls = Object.getPrototypeOf(cls))
        {
            if (Object.hasOwn(cls, "DEFAULT_OPTIONS")) { chain.unshift(cls.DEFAULT_OPTIONS); }
        }
        for (const defaults of chain) { merge(this.options, defaults); }
        merge(this.options, options);
        this.id = "editor-fixture";
        this.pending = Promise.resolve();
    }
    async _prepareContext() { return {}; }
    async render()
    {
        if (!this.element)
        {
            this.element = document.createElement("form");
            this.element.className = this.options.classes.join(" ");
            this.content = document.createElement("div");
            this.content.className = "window-content standard-form";
            this.element.append(this.content);
            document.body.append(this.element);
            this.element.addEventListener("change", event =>
            {
                if (this.options.form.submitOnChange) { this.pending = this.submit(event); }
            });
            this.element.addEventListener("submit", event => { event.preventDefault(); this.pending = this.submit(event); });
            this.element.addEventListener("click", event =>
            {
                const target = event.target.closest("[data-action]");
                const handler = this.options.actions[target?.dataset.action];
                if (handler) { this.pending = Promise.resolve(handler.call(this, event, target)); }
            });
        }
        const context = await this._prepareContext();
        this._replaceHTML(await this._renderHTML(context), this.content);
        return this;
    }
    async submit(event = new window.Event("submit"))
    {
        await this.options.form.handler.call(this, event, this.element, formValues(this.element));
        if (this.options.form.closeOnSubmit) { this.close(); }
    }
    close() { this._onClose({}); this.element.remove(); this.element = null; }
    _onClose() {}
}

const getProperty = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
const setProperty = (object, path, value) =>
{
    const keys = path.split(".");
    const key = keys.pop();
    for (const part of keys) { object = object[part] ??= {}; }
    object[key] = value;
};
globalThis.foundry = {
    applications: { api: { ApplicationV2: ApplicationV2Fixture } },
    utils: {
        getProperty, setProperty, deepClone: structuredClone,
        hasProperty: (object, path) => getProperty(object, path) !== undefined,
        isEmpty: value => value === "" || value == null
    }
};
globalThis.game = {
    system: { id: "fixture" }, user: { isGM: true },
    i18n: { localize: key => key },
    fixture: { config: {
        scriptTriggers: { dialog: "Dialog", manual: "Manual", immediate: "Immediate", update: "Update" },
        effectScripts: { abcdefghijklmnop: "return args.value + 2;" }
    } },
    clipboard: { values: [], copyPlainText(value) { this.values.push(value); } }
};
globalThis.ui = { notifications: { info() {} } };

export function effectDocument(trigger = "dialog")
{
    return {
        updates: [],
        system: {
            transferData: { documentType: "Actor" },
            schema: { fields: { scriptData: { element: { fields: {} } } } },
            scriptData: [{ label: "Example script", trigger, script: "return args.value;", options: {
                runIfDisabled: true, targeter: true, defending: false, deleteEffect: false,
                showDuplicates: true, hideScript: "return false;", activateScript: "return true;",
                submissionScript: "args.value += 1;"
            } }]
        },
        async update(changes)
        {
            this.updates.push(structuredClone(changes));
            for (const [path, value] of Object.entries(changes)) { setProperty(this, path, value); }
        }
    };
}
