// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
import { VueMount } from "./vue-mount";

/**
 * Keep Foundry responsible for form events, actions, window chrome, and permissions.
 * @param {typeof foundry.applications.api.ApplicationV2} BaseApplication Native application class.
 * @returns {typeof foundry.applications.api.ApplicationV2} Vue-rendered application class.
 */
export function VueFormApplicationMixin(BaseApplication)
{
    return class VueFormApplication extends BaseApplication
    {
        static DEFAULT_OPTIONS = {
            tag: "form",
            classes: ["forkhammer"],
            window: { contentClasses: ["standard-form"] }
        };

        #vueMount = null;

        constructor(document, options = {})
        {
            super(options);
            this.document = document;
        }

        async _prepareContext(options)
        {
            const context = await super._prepareContext(options);
            context.rootId = this.id;
            return context;
        }

        async _renderHTML(context)
        {
            return context;
        }

        _replaceHTML(context, content)
        {
            this.#vueMount ??= new VueMount();
            this.#vueMount.render(this.constructor.VUE_COMPONENT, context, content);
        }

        _onClose(options)
        {
            this.#vueMount?.destroy();
            this.#vueMount = null;
            super._onClose(options);
        }
    };
}
