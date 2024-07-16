
// Import
import {Config} from './class/config.js';
import {Boxes} from './class/boxes.js';
import {Framework} from './class/framework.js';
import {Hooks} from './class/hooks.js';
import {Methods} from './class/methods.js';
import {App} from './class/app.js';

// Executive
function execute ( ) {
    try {
        new App (
            new Framework (
                new Config (),
                new Boxes ()
            ),
            new Hooks (),
            new Methods ()
        );
    }
    catch (e) {
        document.querySelector('body').innerHTML = 'Failed to initialise application';
        console.error (e);
    }
}
if (window.document.readyState=='interactive' || window.document.readyState=='complete') {
    execute ();
}
else {
    window.document.addEventListener ('DOMContentLoaded',execute);
}
