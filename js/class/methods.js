
/* Original boilerplate by Whitelamp http://www.whitelamp.co.uk */


export class Methods {

    /*

    Responder methods invoked by framework listeners


    Principles of use
    -----------------

    These are invoked by the framework listener based on the HTML data attribute data-handlers.

    <mytag data-handlers="click,myClickResponder,mousemove,myMousemoveResponder" /> 

    One is not restricted to a single responder per event type; the methods will execute asynchronously.
    <mytag data-handlers="click,myClickResponder1;click,myClickResponder2" /> 

    Important: the framework binds these methods to the application object therefore the keyword "this"
    within these methods means "this application" and not "this class file"

    All these methods receive a single argument:
    App.handle(evt) --> this.methods['myClickResponder'] (evt)
    It is good practice to make it the first argument for all shared functions in app.js and keep
    passing the event around; so often it is useful to have event type/data-attributes available where
    one did not expect (as the variable is merely a reference there is no overhead to passing it through
    chains of functions).

    The framework requires data-handlers for basic operation and it adds the derivative data-hash
    with.
     * The current history state:
       - https://my.host/my-app/#test/x/y/z
         which gives
       - this.framework.context().method = 'test'
       - this.framework.context().args = [ 'x', 'y', 'z' ]
       - this.framework.context().hash = '#test/x/y/z' ]
     * Breadcrumbs provided by the element event
       - data-handlers = 'click [myFunc (a,b,c)]'
       - data-hash = '#myfunc/a/b/c' (derived by the framework from data-handlers)
         https://my.host/my-app/#myfunc/a/b/c

    Your methods can make API calls quite simply with Framework.fetch():
    Note: always bind your hooks to App
    response = await this.framework.fetch (myEvent,myPayload,this.hooks.responseHook.bind(this));
    Opening comments in app.js provide more details

    The last duties (optional) of each method:
     * prepare output including the merging of data
     * finally, return anything the controller element/framework requested and advise a browser state
 
    It is nice and easy to do those - respectively:
     * var output = this.framework.merge (data,html,options);
     * return { stateChange: 'replace', contentType: 'text/html', output: output }

    The only real framework intervention within your method is for the purpose of login. If you call a
    function that results in a failed server authentication, it will throw an error which, under normal
    circumstances, you should allow to propagate to Framework.handle() which triggers other framework
    processes. The test method shows how you can filter and throw that error but trap the others should
    the need arise.



    async/await tip
    ---------------

    Functions doing n separate async/await calls will take n times longer than one call:
        rtn1 = await async_func (arg1); rtn2 = await async_func (arg2);

     * so do not use conventional await pattern within a loop
     * maybe do not use it if the arguments to your second async function do not depend on the return
       value from the first
     * For functionally independent async calls, await Promise.all() pattern is quicker

    Under the bonnet async/await is Promise-based; you can still have the nice readable await pattern:
    var [ rtn1, rtn2 ] = await Promise.all ( [ async_func (arg1), async_func (arg2) ] );

    Which is not particularly ugly for a single function using the same pattern if you like that sort
    of consistency:
    var [ rtn ]  = await Promise.all ( [ async_func (arg) ] );

    */

    about (evt) {
        this.prompt (evt,'About - '+evt.type+' event',{});
        // Probably not a new browser state:
        return {
//            force: true,
            stateChange : 'none',
//            stateHash : 'view/other'
//            destination: this.framework.boxes[0],
//            contentType: 'text/html',
//            output: html
        }
    }

    async login (evt,request) {
        var bcs,email,ok,password,event;
        password = evt.currentTarget.form.password.value;
        evt.currentTarget.form.password.value = '';
        if (request=='submit') {
            this.config.credentials.email = evt.currentTarget.form.email.value;
            this.config.credentials.password = password;
            // Run the login event again
            this.framework.handle (this,this.framework.loginEvent);
        }
        else {
            this.hooks.loginCancelHook (evt);
            return {
//                force: true,
                stateChange : 'none',
//                stateHash : 'view/other'
//                destination: this.framework.boxes[0],
//                contentType: 'text/html',
//                output: html
            }
        }
    }

    async test (evt,somearg) {
        var auth,denied,ct,data,output,p,r,x;
        /*
        Make an API call

        Deliberately get a server test response tailored to your test
        For example - you are authenticated anonymously but are denied the request
        Hooks.responseHook() - bound to App - will determine if a login is required

        // Hpapi permissions for anonymous pong()
        INSERT IGNORE INTO `hpapi_method` (`vendor`, `package`, `class`, `method`, `label`, `notes`) VALUES
        ('whitelamp-uk',    'hpapi-utility',    '\\Hpapi\\Utility', 'pong', 'Pong the API', 'Pong the API with auth status/denied for the return value you want');
        INSERT IGNORE INTO `hpapi_methodarg` (`vendor`, `package`, `class`, `method`, `argument`, `name`, `empty_allowed`, `pattern`) VALUES
        ('whitelamp-uk', 'hpapi-utility', '\\Hpapi\\Utility', 'pong', 1,  'Auth code eg 061', 0,  'varchar-4'),
        ('whitelamp-uk', 'hpapi-utility', '\\Hpapi\\Utility', 'pong', 2,  'Denied (boolean)', 0,  'db-boolean');
        INSERT IGNORE INTO `hpapi_run` (`usergroup`, `vendor`, `package`, `class`, `method`) VALUES
        ('anon', 'whitelamp-uk',  'hpapi-utility', '\\Hpapi\\Utility', 'pong');
        */
        auth = '068';
        denied = 0; // or 1
        r = await this.framework.pong (
            evt,
            this.hooks.responseHook.bind (this),
            this.framework.fetch.bind (this.framework),
            auth,
            denied
        );
//        this.log ('warn',r);

/*
        // Make API requests via the App using the default server class
        // See Config.defaults
        x = await this.data ('myServerMethod',[ 1, 'abc', {k:'v'} ]);
        this.log ('log',x);

        // Make API requests via the App using a different server class
        // but from the same package
        x = await this.data (
            {
                vendor : this.config.defaults.vendor,
                package : this.config.defaults.package,
                class : "\\MyNamespace\\MyClass",
                method : "myOtherMethod",
                args : [
                    1,
                    "abc",
                    { x : "a", y : "b" }
                ]
            }
        );
        this.log ('log',x);
*/

        // A bit of meaningless data construction
        data = {
            returned : 1 * r.returnValue,
            methodCurrent : this.framework.context().method,
            somearg : somearg,
            hashCurrent : this.framework.context().hash,
            hashNew : evt.currentTarget.dataset.hash,
            team : [
                {
                    name : 'Florence',
                    age : 32
                },
                {
                    name : 'Mia',
                    age : 26
                },
                {
                    name : 'Sky',
                    age : 40
                }
            ],
            victim : {
                name : 'Bob',
                age : 48
            },
            dataset : Object.assign ({},evt.currentTarget.dataset),
            meta : {
                collection : 'My collection',
                categories : [ 'c19', 'french', 'fiction', 'crime' ],
                genre : 'Late 19th century French murder mysteries',
            },
            books : [
                {
                    isbn : '1234',
                    content : {
                        chapters : [
                            {
                                paragraphs : [
                                    'Once upon a time ...'
                                ],
                                meta : {
                                    plot : 'In which Mme. Dupont has a peachy experience.'
                                },
                                title : 'Backlog of Stone Fruit'
                            },
                            {
                                paragraphs : [
                                    'Then after that ...'
                                ],
                                meta : {
                                    plot : 'In which M. Dupont gets a fruity surprise.'
                                },
                                title : 'Crepes Framboises'
                            }
                        ],
                        foreword : 'This events described in this tome took place during the Paris fruit disaster of 1878'
                    },
                    title : 'The Case of the Crushed Canteloupe'
                }
            ]
        }

        output = await this.framework.fetchTemplate ('test');
        // One might do pre-data DOM manipulation here (eg splice in a sub-template, remove optional bits)
        // Then merge data into HTML:
        output = this.framework.merge (data,output,{});
        // One might do post-data DOM manipulation here (eg CSS classlist changes, bespoke data attributes)
        // Return an object 
        return {
            force: true,
//            stateChange : 'replace',
//            stateHash : 'view/other'
            destination: this.framework.boxes[0],
            contentType: 'text/html',
            output: output
        }
    }

    async test2 (evt) {
        if (evt.currentTarget.tagName.toLowerCase()=='section') {
            /*
            Framework.write() completely overwrites myElement.innerHTML and then sends an afterwrite event
            If you "manually" manipulate the DOM here *and* you want an afterwrite handler in
            data-handlers to work, you need to send an event to the framework yourself:
            this.framework.handle (this,this.event('afterwrite',myElement));
            There have been ideas using observers triggered by HTML mutation but I see dangers of infinite
            loops...
            */
            // Use Framework.write()
            // use 4th arg if you want a callback (see Framework.run())
            this.framework.write (
                evt.currentTarget,
                'text/plain',
                'Date = ' + (new Date().toUTCString),
                null
            );
            // Done, advance the browser state
            return true;
        }
        this.prompt (evt,'The framework just invoked Methods.test2() with Event.type='+evt.type,{});
        // If you do not return object properties, the framework makes up its own mind
    }

    async test3 (evt) {
        this.prompt (evt,'test3 invoked by Event.type = '+evt.type);
            // If you do not return object properties, the framework makes up its own mind
        return {
            force: true,
            stateChange: 'none',
//            stateHash: '#some/where',
//            destination: this.framework.boxes[0],
//            contentType: 'text/html',
//            output: html
        }
    }

    async view (evt,view) {
        var output;
        // Generally load a view without doing any method-specific data instantiation
        if (view) {
            // Get the HTML for the view
            try {
                output = await this.framework.fetchTemplate (view);
            }
            catch (e) {
                this.log ('error',e);
            }
            // If you do not return object properties, the framework makes up its own mind
            return {
//                force: true,
                stateChange: 'push',
//                stateHash: '#some/where',
                destination: this.framework.boxes[0],
                contentType: 'text/html',
                output: output
            }
        }
        else {
            this.prompt (evt,'Sorry this URL does not make sense',{});
        }
        // none = no state change
        return {
            force: true,
            stateChange: 'none',
//            stateHash: '#some/where',
//            destination: this.framework.boxes[0],
//            contentType: 'text/html',
//            output: output
        }
    }

}

