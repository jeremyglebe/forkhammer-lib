// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
import { VueFormApplicationMixin } from "./vue/form-application";
import ScriptEditor from "./vue/ScriptEditor.vue";

export default class WarhammerScriptEditor extends VueFormApplicationMixin(foundry.applications.api.ApplicationV2)
{    
    static DEFAULT_OPTIONS = {
        tag : "form",
        classes: ["script-editor"],
        window: {
            resizable : true,
            title : "WH.ScriptEditor",
        },
        position : {
            height: 600,
            width: 500
        },
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        },
        actions : {
            contentLink : this._onClickContentLink
        }
    };

    static VUE_COMPONENT = ScriptEditor;

    static async wait(script, options={})
    {
        return new Promise(resolve => 
        {
            options.resolve = resolve;
            options.script = script;
            new this(null, options).render(true);
        });
    }

    async _prepareContext() 
    {
        let context = await super._prepareContext();
        context.script = this._getScript();
        context.buttons = [{ type: "submit", label: "Submit", icon: "fa-solid fa-save" }];
        context.labels = {
            editor: game.i18n.localize("WH.ScriptEditor"),
            submit: game.i18n.localize("Submit")
        };
        return context;
    }

    _getScript()
    {
        return this.document ? foundry.utils.getProperty(this.document, this.options.path) : this.options.script;
    }

    static async submit(ev, form, formData)
    {
        let script = formData.object.script; 
        if (this.options.resolve)
        {
            return this.options.resolve(script);
        }
        else 
        {
            return this.document.update({[this.options.path] : script});
        }
    }


}
