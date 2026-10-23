// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
export default function() 
{

    Hooks.on("renderApplication", (app, html, data) => 
    {
        forkhammer.utility.log(`Rendering ${app.constructor.name}`, {args : data});
    });

}