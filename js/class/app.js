
/* Original boilerplate by Whitelamp http://www.whitelamp.co.uk */


export class App {

        /*
        Server calls are made with Framework.fetch()
        Referenced in App as this.framework.fetch(), it requires two arguments:
         * the originating DOM event
         * the response callback function

        Although it can be subverted if necessary, normal framework behaviour requires
        that you use the function App.response() bound to App

        Therefore:
        response = await this.framework.fetch (myEvent,myPayload,this.hooks.responseHook.bind(this));
        */




    // Basic requirements

    async authenticate (evt) {
        var response;
        /*
        Hpapi permissions for anonymous ping()
        INSERT IGNORE INTO `hpapi_method` (`vendor`, `package`, `class`, `method`, `label`, `notes`) VALUES
        ('whitelamp-uk',    'hpapi-utility',    '\\Hpapi\\Utility', 'ping', 'Ping the API', 'Ping the API for a return value of true');
        INSERT IGNORE INTO `hpapi_run` (`usergroup`, `vendor`, `package`, `class`, `method`) VALUES
        ('anon', 'whitelamp-uk',  'hpapi-utility', '\\Hpapi\\Utility', 'ping');
        */
        response = await this.framework.ping (
            evt,
            this.hooks.responseHook.bind (this),
            this.framework.fetch.bind (this.framework)
        );
        return response.returnValue;
    }

    constructor (framework,hooks,methods) {
        var fn;
        console.log ('Constructing App class (at page load)');
        this.hooks = hooks; // methods to be run by the framework
        this.methods = methods; // methods to be run by the framework
        this.framework = framework;
        this.framework.boxes.callbackSet (this.hooks.boxHook.bind(this));
        this.config = this.framework.config; // shared config file for framework and app
        this.qs = this.framework.qs; // tidier than querySelector()
        this.qsa = this.framework.qsa; // tidier than querySelectorAll()
        fn = this.hooks.loadHook.bind (this);
        fn ();
    }




    // Shared functions

    $ (container,selector) {
        if (String(container)==container) {
            // myNode = $ ( '[data-body]', '#my-id' );
            container = this.qs (document.body,container);
        }
        if (container) {
            // myNode = $ ( myParentNode, '#my-id' );
            return this.qs (container,selector);
        }
    }

    $$ (container,selector) {
        if (String(container)==container) {
            // myNodeList = this.$$ ( '[data-body]', '.my-class' );
            container = this.qs (document.body,container);
        }
        if (container) {
            // myNodeList = this.$$ ( myParentNode, '.my-class' );
            return this.qsa (container,selector);
        }
    }

    async api (evt,method,args=null) {
        var args,payload,response;
        // Complete an incomplete payload using Config.defaults
        payload = this.framework.payload (method,args);
        // Make an API request with the full payload
        response = await this.framework.fetch (evt,payload,this.hooks.responseHook.bind(this));
        return response;
    }

    async confirm (evt,html,abortText='Cancel',continueText='OK') {
        var box;
        // The event argument is not used currently
        /*
        this.framework.boxes.create (persistence,{lilo:true,blocker:true})
         * blocker indicates that the user should not be able to modify any ancestor
           box of this box until it has been removed from the DOM (eg a prompt or if
           a box requires completion before a parent box allows further interaction)
        */
        box = this.framework.boxes.create ('sticky',{lilo:true,blocker:true});
        box.classList.add ('confirm');
        box.innerHTML  = this.framework.merge (
            {
                html: html,
                abort: abortText,
                continue : continueText
            },
            await this.framework.fetchTemplate ('prompt')
        );
        // Add box to the DOM
        this.wrapper.appendChild (box);
    }

    async notify (evt,message) {
        var box,fn,nr;
        // The event argument is not used currently
        /*
        this.framework.boxes.create (persistence,{lilo:true,blocker:true})
         * lilo is for notifications/prompts where - for the specified persistence -
           the last box added should be the one the user sees last (ie have a low z-
           index)
        */
        box = this.framework.boxes.create ('sticky',{lilo:true,blocker:true});
        box.classList.add ('prompt');
        box.innerHTML  = this.framework.merge (
            {
                message: message
            },
            await this.framework.fetchTemplate ('prompt')
        );
        // Add box to the DOM
        this.wrapper.appendChild (box);
        fn = this.framework.destroy.bind (this.framework);
        nr = box.number;
        setTimeout (function(){fn(nr)},1000*this.config.messages.notifyTimeout);
    }

    async prompt (evt,html,closeText='OK') {
        var box,fn,nr,ouput;
        // The event argument is not used currently
        box = this.framework.boxes.create ('sticky',{lilo:true,blocker:true});
        box.classList.add ('prompt');
        box.innerHTML  = this.framework.merge (
            {
                html: html,
                close: closeText
            },
            await this.framework.fetchTemplate ('prompt')
        );
        // Add box to the DOM
        this.wrapper.appendChild (box);
    }

}

