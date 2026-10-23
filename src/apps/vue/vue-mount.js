// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
import { createApp } from "vue";
import { createPinia, disposePinia } from "pinia";

/** A window-local Vue/Pinia lifetime without an extra layout wrapper. */
export class VueMount
{
    app = null;
    pinia = createPinia();

    render(component, context, content)
    {
        const active = content.ownerDocument.activeElement?.closest("[name]");
        const focusName = active && content.contains(active) ? active.name : null;
        const cursor = active?.cursor;
        const scroll = Array.from(content.querySelectorAll("[data-application-part]"))
            .map(element => [element.dataset.applicationPart, element.scrollTop, element.scrollLeft]);

        // A fresh tree sets custom-element values while detached. Updating a live code-mirror
        // value dispatches change and would submit an effect merely because it re-rendered.
        this.app?.unmount();
        this.app = createApp(component, { context });
        this.app.use(this.pinia);
        this.app.mount(content);

        for (const [part, top, left] of scroll)
        {
            const element = Array.from(content.querySelectorAll("[data-application-part]"))
                .find(candidate => candidate.dataset.applicationPart === part);
            element?.scrollTo(left, top);
        }
        if (focusName)
        {
            const element = Array.from(content.querySelectorAll("[name]"))
                .find(candidate => candidate.name === focusName);
            element?.focus();
            if (Number.isFinite(cursor))
            {
                element?.scrollTo({ top: cursor });
            }
        }
    }

    destroy()
    {
        this.app?.unmount();
        this.app = null;
        disposePinia(this.pinia);
    }
}
