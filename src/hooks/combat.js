// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
import { CombatHelpers } from "../util/combat-helpers";

export default function() 
{
    Hooks.on("updateCombat", CombatHelpers.updateCombat.bind(CombatHelpers));
    Hooks.on("deleteCombat", CombatHelpers.deleteCombat.bind(CombatHelpers));

    // combatStart hook only runs on client starting combat, so need to use updateCombat
    Hooks.on("updateCombat", (combat, data, options) => 
    {
        if (data.round == 1 && data.turn == 0 && !options.direction)
        {   
            CombatHelpers.combatStart.bind(CombatHelpers)(combat);
        }
    });

    Hooks.on("renderCombatTracker", (app, html) => 
    {
        forkhammer.utility.replacePopoutTokens(html);
    });
}