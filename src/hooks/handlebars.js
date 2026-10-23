// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
import { systemConfig } from "../util/utility.js";

/**
 *
 */
export default function () 
{
    Hooks.on("ready", () => 
    {
        const avoidTestTemplate = systemConfig().avoidTestTemplate;
        foundry.applications.handlebars.loadTemplates({
            ...(avoidTestTemplate ? { avoidTestDetails: avoidTestTemplate } : {}),
            dialogModifiers: "modules/forkhammer-lib/templates/partials/dialog-modifiers.hbs",
            effectButtons: "modules/forkhammer-lib/templates/partials/effect-buttons.hbs",
            scriptButtons: "modules/forkhammer-lib/templates/partials/manual-scripts.hbs",
            independentButtons: "modules/forkhammer-lib/templates/partials/independent-effects.hbs",
            sheetTabs: "modules/forkhammer-lib/templates/partials/sheet-tabs.hbs",
            sheetButtons: "modules/forkhammer-lib/templates/partials/sheet-effect-buttons.hbs",
            sheetButtonsV1: "modules/forkhammer-lib/templates/partials/sheet-effect-buttonsV1.hbs",
            choiceDisplay : "modules/forkhammer-lib/templates/partials/choice-display.hbs",
            choiceDecision : "modules/forkhammer-lib/templates/partials/choice-decision.hbs",
            documentReference : "modules/forkhammer-lib/templates/partials/document-reference.hbs",
            nameList : "modules/forkhammer-lib/templates/partials/name-list.hbs",
            nameListInput : "modules/forkhammer-lib/templates/partials/name-list-input.hbs",
            nameListSelect : "modules/forkhammer-lib/templates/partials/name-list-select.hbs",
            nameListToggle : "modules/forkhammer-lib/templates/partials/name-list-toggle.hbs"
        });
    });
}
