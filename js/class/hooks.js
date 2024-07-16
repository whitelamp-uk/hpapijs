
/* Copyright 2024 Whitelamp http://www.whitelamp.co.uk */


export class Hooks {

    /*
    Hooks to control framework behaviour

    Important: the framework binds these hooks to the application object therefore
    the keyword "this" within these hooks means "this application" and not "this class
    file".

    The variable name of the argument to the hook indicates what it is expecting:
     * jsEvt - a JS Event object
     * evt - a framework event object
     * element - current target of a framework event

    JS Event.currentTarget does not survive very long; the framework offers a
    persistent reference.

    A JS Event may be used to create a framework event.
    evt = this.framework.event (jsEvt);
    */

    afterrunHook (evt,rtn,err) {
        /*
        Framework.run() calls the method specified in data-handlers immediately
        followed by this function. Its arguments are the event, return value from
        the method and/or any error that was caught.
        */
        // Catch the specific error message that reveals login box
        if (err) {
            if (err.message=='login') {
                /*
                responseHook() [see below] throws this specific error after calling
                Framework.deny().

                In this hook we want to catch it and make sure that the state proposed
                by data-statechange is 'replace'; if the user navigates away and then
                hits back button, the browser will still be showing the login.

                Note that the method will not write() a state change after responseHook()
                threw the error because conventionally it should be aborted (exceptional
                purpose aside, it should not try/catch Framework.fetch() or wrapper
                functions for the same).
                */
                if (evt==this.loginEvent) {
                    // This is a login re-prompt; replace current state rather than push
                    this.framework.state (this.framework.context().hash,true);
                }
            }
            else  {
                // This is a real error so throw it
                throw err;
            }
        }
        /*
        The framework completely ignores method return values. If you want to use them for
        application logic, here is likely the best place to put it.
        */
    }

    afterwriteHook (evt) {
        var box,boxes,destroy,dragger,draggers,hash,view;
        /*
        This hook is called at the end of Framework.write().
        It simply receives the framework event that led to the function call occurring.
        Framework.write() is silent unless there is a non-empty string evt.write.payload
        Here we:
         * append/remove the destination box to/from the DOM
         * write appropriate state change (and set destination box state data-attributes)
         * destroy old boxes
        */

        // Destination box DOM attachment
        if (evt.write.detached) {
            this.boxes.detach (evt.write.destination.dataset.box);
        }
        else {
            this.boxes.attach (evt.write.destination.dataset.box);
        }
 
        // Enact evt.write.statechange (we could override it if we had a good reason)
        view = this.framework.context().method;
        hash = this.framework.context().hash;
        if (['none','replace'].includes(evt.write.statechange)) {
            if (evt.write.statechange=='replace') {
                // history replace state
                this.framework.state (hash,true);
            }
        }
        else if (evt.write.statechange.indexOf('#')==0 && evt.write.statechange.length>1) {
            // history push state
            this.state (evt.write.statechange);
            hash = evt.write.statechange;
            view = hash.substring(1).split('/').shift().trim();
        }
        else {
            this.framework.log ('error','State change "'+evt.write.statechange+'" is not valid [ none replace valid_state_hash ]');
        }
        evt.output.destination.dataset.statehash = hash;
        evt.output.destination.dataset.stateview = view;

        // Use the destination hash and view to destroy left-over boxes
        boxes = this.$$ (this.wrapper,'[data-box][data-persistence]');
        for (box of boxes) {
            destroy = false;
            if (box.dataset.persistence=='repaint' && evt.write.repainted) {
                destroy = true;
            }
            else if (box.dataset.persistence=='state' && box.dataset.statehash!=hash) {
                destroy = true;
            }
            else if (box.dataset.persistence=='view' && box.dataset.stateview!=view) {
                destroy = true;
            }
            if (destroy) {
                this.framework.boxes.destroy (box.dataset.box);
            }
        }

        // Complete the framework write process
        if (this.framework.handlerExists(evt.currentTarget,'afterwrite')) {
            // Fire an afterwrite framework event on the current target (not the destination!)
            this.framework.handle (this,this.framework.event('afterwrite',evt.currentTarget));
        }
        else {
            // Only otherwise, listen to the box ...
            if (evt.write.repainted) {
                // ... provided existing events were killed by overwriting innerHTML
                this.framework.listenersAdd (evt.currentTarget,this.hooks.eventHook.bind(this));
                // Add mousedown listeners to data-dragger elements
                draggers = this.$$(evt.output.destination,'[data-dragger]');
                for (dragger of draggers) {
                    dragger.addEventListener ('mousedown',this.boxes.dragStarting.bind(this.boxes));
                }
            }
        }

    }

    beforeWriteHook (evt,methodOptions) {
        /*
        The primary purpose of this hook is to prioritise data-attribute and Framework.write
        option stored as evt.writen.

        Here we patch method write options and data-attribute write options into evt.write
        to be used by Framework.write()

        All method options are strings (like data attributes) with just the force property
        being an array of other properties to force.
        {
            force: [ 'statechange', ],
            statechange: 'replace', // [ none replace ] or a replacement hash
            destination: '0', // value of data-box
            detached: '1', // After repainting, leave the box is a detached state
            contenttype: 'text/html',
            payload: '<section>HTML code</section>' // Actual value of either innerHTML or innerText
        }
        evt.currentTarget.dataset might sensibly use four of these
        {
            statechange: '#view/other', // [ none replace ] or a replacement hash
            destination: '0', // value of data-box
            detached: '1',
            contenttype: 'text/html'
        }
        */
        // Sensible default output destinations
        if (evt.currentTarget.dataset.destination) {
            // Template has defined the destination
        }
        else if (event.type=='beforeaddlistener' || event.type=='afterwrite') {
            event.write.destination = event.currentTarget.closest ('[data-box]');
        }
        else {
            event.write.destination = this.boxes.find(0).element;
        }
        // Data-attribute trumps method option unless the method option is forced
        evt.write = {}
        ps = [ 'contenttype', 'destination', 'detached','payload', 'statechange' ];
        for (i in ps) {
            evt.write[ ps[i] ] = '';
            if (evt.currentTarget.dataset[ps[i]]) {
                evt.write[ ps[i] ] = evt.currentTarget.dataset[ ps[i] ];
            }
            if (options[ ps[i] ] && (options.force.includes(ps[i]) || !evt.write[ ps[i] ].length)) {
                evt.write[ ps[i] ] = options[ ps[i] ];
            }
        }
    }

    boxHook (report) {
        // Called by Framework.boxes functions when they do certain things
console.warning (report);
    }

    eventHook (jsEvt) {
        var elm,href;
        /*
        Every event coming through here was ultimately caused by one these:
         * the data-handlers HTML attribute
         * <a> tags
        */
        // Interfere with the JS Event before we get to the handler (see below)
        elm = jsEvt.currentTarget;
        if (jsEvt.type=='click') {
            // CLICK
            if (elm.tagName.toLowerCase()=='a') {
                // <A></A>
                if (elm.hasAttribute('href')) {
                    href = this.framework.href (elm);
                    if (href.willReload) {
                        // Allow the HTML default action
                        return true;
                        // Do not pass to the framework
                    }
                    if (href.internal) {
                        // Do not allow the HTML default action
                        jsEvt.preventDefault ();
                        // Let the framework deal with it
                    }
                }
            }
        }
        else if (jsEvt.type=='submit') {
            // SUBMIT
            if (elm.tagName.toLowerCase()=='form') {
                // <FORM></FORM>
                // Force browser to provide auto-complete suggestions
                /*
                // Dump the HTML submission harmlessly (happily also exploiting the browser auto-
                // complete feature)
                e.setAttribute ('action','about:blank'); // browser empty page
                e.setAttribute ('target','autocomplete'); // undisplayed iframe in index.html
                */
            }
        }
        // Start the framework process chain by passing a framework event to the handler
        // All framework functions deal in framework events and not JS Events - see Framework.event()
        this.framework.handle (this,this.framework.event(jsEvt));
    }

    async hashchangeHook (jsEvt) {
        var context;
        /*
        The window hashchange event is fired when the user changes the hash in the location bar and
        hits Enter or by the user clicking an HTML link to an anchor on the current page.

        It is not fired by JS tinkering with history.state - the possibly simple reason being forever
        looping state changes...
        */
        // Do the right things for the reload context
        context = this.framework.context ();
        if (!this.framework.context().hash) {
            // Replace the browser state
            this.framework.state (this.config.app.home,true)
        }
        if (context.method in this.methods) {
            // We have a viable user request to process
            if (!this.config.app.private) {
                // Always allow a public app on hashchange
                this.framework.allow ();
            }
            // Kill all event listeners inside wrapper
            this.framework.wrapper.innerHTML += ' ';
            // Set box(0) beforeaddlistener from context
            this.framework.boxes.find(0).element.dataset.handlers = this.framework.handlerString ('beforeaddlistener',context.method,context.args);
            /*
            NB beforeaddlistener pseudo-event causes Framework.listen() to execute the handler
            method *instead* of adding a listener for it.

            The primary intent of beforeaddlistener was auto-loading of currentTarget.innerHTML

            But it might be thought of more generally as setting your own custom handler which
            trumps the generic handler. Why not just set your own separate handlers? Well you
            could - but then you would be operating outside the framework altogether.
            */
            // Add all event listeners declared inside wrapper (the beforeaddlistener event will get "fired" too)
            this.framework.listenersAdd (this.framework.wrapper,this.hooks.eventHook.bind(this));
        }
        else {
            // Report view missing
            this.prompt (jsEvt,this.config.app.messages.view404(context));
        }
    }

    async loadHook ( ) {
        var fn;
        this.framework.log ('log','Loading application following page load');
        // Load the login view
        this.framework.appLogin.innerHTML = await this.framework.fetchTemplate ('login');
        // Set up *initial* event listeners for anything inside *[data-body]*
        this.framework.listenersAdd (this.framework.body,this.hooks.eventHook.bind(this));
        // Reload the application on hashchange event
        fn = this.hooks.hashchangeHook.bind (this);
        window.addEventListener ('hashchange',fn);
        // Reload it right now
        fn ( { type: 'appload' } );
    }

    logincancelHook ( ) {
        if (!this.config.app.private) {
            // How to respond to a public (aka anonymous) login cancel
            if (loginEvt.status.authenticated) {
                // Forget the event
                this.loginEvent = null;
                // Allow the current view again
                this.framework.allow ();
            }
        }
        // Never cancel the login if the app is private
    }

    async responseHook (evt,response) {
        var c,e,m;
        // Runs directly after JS fetch()
        if (response.status.denied) {
            /*
            When the server reports the equivalent of HTTP status 403,
            should there be a log-in challenge or,
            if not, what is the user message?
            */
            s = response.status; // see Hpapi.unpack()
            if (response.status.authenticated) {
                // An acceptable user has made an unacceptable request
                m = 'Sorry you do not have permission to do that';
                if (!response.status.verified) {
                    m += ' (NB your account is not verified yet)';
                }
            }
            else if (response.status.expired || response.status.anonymous) {
                /*
                Either the request was made with an expired token
                or the user is anonymous (maybe anonymous permissions were insufficient)
                [ NB to make the app private, set Config.app.private = true - see Hooks.loadHook() ]
                */
                // Buffer the GUI event
                this.framework.loginEvent = evt;
                // Deny the application
                this.framework.deny ();
                // Advise the calling method to abort with keyword message "login"
                throw new Error ('login');
                return;
            }
            else {
                this.framework.log ('warn','Authentication failure:');
                this.framework.log (evt.currentTarget.dataset);
                m = 'We could not complete your request - contact the administrator for help';
            }
            this.prompt (evt,m,'Understood');
        }
        else {
            // When the response has no error, re-attach application (if detached)
            if (response.status.userChanged) {
                window.location.reload ();
                return;
            }
            else if (response.status.authenticated) {
                this.framework.allow ();
            }
            // Remove log-in box
            this.framework.appLogin.classList.remove ('active');
        }
        // Advise the calling method to continue
        return true;
    }

}

