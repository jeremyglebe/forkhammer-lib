// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
export default function () 
{
    Hooks.on("renderCompendiumDirectory", (app, html) => 
    {
        html = html instanceof HTMLElement ? html : html[0];
        forkhammer.apps.CompendiumBrowser.injectSidebarButton(html);
    });
}