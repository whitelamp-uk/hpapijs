
/* Copyright 2022 Whitelamp http://www.whitelamp.co.uk */

import {Hpapi} from './hpapi.js';

export class Framework extends Hpapi {

    allow ( ) {
// TODO - every data-box inside data-wrapper
        if (this.config.app.private) {
            this.authorized = true;
        }
        if (!this.boxes.find(0).isConnected) {
            this.wrapper.prependChild (this.boxes.find(0));
        }
        this.hide (this.login);
    }

    constructor (config,boxes) {
        super (config);
        if ('body' in document.body.dataset) {
            this.body = document.body;
        }
        else {
            this.body = this.qs (document.body,'[data-body]');
            if (!this.body) {
                throw new Error ('No element with data-body');
                return;
            }
        }
        this.boxes = new boxes (config,body);
        this.construction = this.qs (this.body,'[data-construction]')
        this.login = this.qs (this.body,'[data-login]')
        this.wrapper = this.qs (this.body,'[data-wrapper]')
        this.app0 = this.qs (this.wrapper,'[data-app]')
        this.appLogin = this.qs (this.wrapper,'[data-login]')
        this.boxes.configure (config);
        this.boxes.box0 (this.app0);
        this.log ('log','Framework constructed');
    }

    context ( ) {
        var context;
        context = {
            args : null,
            hash : window.location.hash,
            method : null,
            parameters : this.parameters (window.location.search)
        }
        if (context.hash.length>1) {
            context.args        = context.hash.substring(1).split ('/');
            context.method      = context.args.shift ();
        }
        return context;
    }

    deny ( ) {
// TODO - every data-box inside data-wrapper
        this.authorized = false;
        if (this.boxes.find(0).isConnected) {
            this.boxes.find(0).remove ();
        }
        // Reveal login box
        this.reveal (this.login);
    }

    event (jsEvt,currentTarget=null,target=null) {
        var cp,event,pd,sip,sp;
        /*
        In promisory code, currentTarget tends to wind up being null when you least
        expect.

        These look-alike framework events have stable object properties - now
        currentTarget will survive until either it or the framework event is destroyed.

        As long as JS Event functions remain available you can manipulate the JS Event:
         * explicitly eg. myFrameworkEvent.jsEvent.preventDefault ()
           implicitly eg. myFrameworkEvent.stopImmediatePropagation ()
        They are synonymous; either way you will get an error if you try to run them
        too late.
        */
        if (currentTarget) {
            /*
            The first argument is a string denoting the framework event type.
            So replace it with a dummy JS Event for the currentTarget and (optional)
            target.
            */
            jsEvt = {
                type : String(jsEvt).trim (),
                currentTarget : currentTarget,
                target : target
            };
            if (jsEvt.type.indexOf(' ')>=0) {
                throw new Error ('"'+jsEvt.type+'" is not a valid framework event type');
                return;
            }
            // Dummy functions for a dummy event
            cp = pd = sip = sp = function () {};
        }
        else {
            // The first (sole) argument is a JS Event so bind real JS Event functions
            cp = jsEvt.composedPath.bind (jsEvt);
            pd = jsEvt.preventDefault.bind (jsEvt);
            sip = jsEvt.stopImmediatePropagation.bind (jsEvt);
            sp = jsEvt.stopPropagation.bind (jsEvt);
        }
        // Convert the JS Event to a framework event
        event = {
            type: jsEvt.type,
            output: {
                destination: null,
                contentType: 'text/html',
                payload: ''
            },
            state: {
                change: 'none',
                hash: ''
            },
            currentTarget: jsEvt.currentTarget,
            target: jsEvt.target,
            jsEvent: jsEvt,
            composedPath: cp,
            preventDefault: pd,
            stopImmediatePropagation: sip,
            stopPropagation: sp
        }
        return event;
    }

    async fetch (evt,payload,responseHook) {
        var html,response;
//alert ('fetching payload');
        response = await super.fetch (
            this.config.server.timeout,
            this.config.server.endpoint,
            this.config.credentials,
            payload
        );
        if (responseHook) {
//alert ('fetched payload after');
            await responseHook (evt,response);
        }
        else {
            this.log ('log','No response function for fetching payload');
        }
        return response;
    }

    async fetchTemplate (name) {
        var str,t;
        t = this.config.template;
//alert ('fetching view '+t.directory + '/' + name + '.' + t.extension);
        str = await super.fetchTemplate (
            this.config.server.timeout,
            t.directory + '/' + name + '.' + t.extension,
            t.type
        );
//alert ('fetched view '+str);
        return str;
    }

    async handle (app,evt) {
        var hs,i,m,ok,rh;
        /*
        A persistent framework event is better than an ephemeral JS Event
        This framework event goes pretty much everywhere
        */
        if (this.config.app.private) {

// TODO is this true if you need a "Go away" notification box, say?

            /*
            Pre-flight authentication because nothing should happen without
            it regardless of whether or not the handler's method calls the
            API straight away (if at all)
            */
            if (evt.lastResponse==undefined || evt.lastResponse.status.auth!='068') {
                rh = app.responseHook.bind (app);
                try {
                    evt.lastResponse = await this.ping (evt,rh,this.fetch.bind(this));
                }
                catch (e) {
                   this.log ('log',e);
                }
                rh (evt);
                if (!['068','070'].includes(evt.lastResponse.status.auth)) {
                    // Private site, not authenticated, run no handlers
                    return;
                }
            }
        }
        hs = this.handlers (evt);
// TODO replace with hs = this.handlers2Array (evt); // a grown-up parser
        for (i in hs) {
            if (hs[i] && (hs[i].method in app.methods)) {
                // Run the GUI method Methods[hs[i].method]()
                // Framework.run() is asynchronous
                // We do not wait for promise resolution
                m = app.methods[hs[i].method].bind (app);
                this.run (app,evt,m,hs[i]);
            }
            else {
                throw new Error ('Methods.'+hs[i].method+' is not a function');
            }
        }
    }

    handlerString (evtType,method,args) {
        var h,i,illegals=[ '{', '}', '(', ',', ')' ];
        if (method.indexOf(' ')>=0) {
            throw new Error ('Method may neither start with a digit nor contain spaces');
            return;
        }
        for (i in illegals) {
            if (method.indexOf(illegals[i])>=0) {
                throw new Error ('Method contains an illegal character - these are not allowed: '+illegals.join(' '));
                return;
            }
        }
        h = evtType + ' {' + method + ' (' + args.join(',') + ') }';
        return hs;
        /*
        Ooh my first attempt at parsing escape sequences
        if (char=="\\") // single escape character
            case '(':
                sb.Append('\(');
                break;
            case '\\':
            case '\"':
                sb.Append(ch);
                break;
        // We have to escape these using \
            \ ( ) { } ,        

        */
    }

    handlerObjects (handlersString,evtType=null) {
        var args=[],element,h,handlers,hs=[],i,j,m;
            // Many data-handlers-driven methods
            handlers = handlersString.split ('}');
            for (i in handlers) {
                h = handlers[i].split ('{');
                if (h[0].trim()==evtType) {
                    if (!(h[1]=h[1].trim())) {
                        throw new Error ('data-handlers="'+handlersString+'" has an incomplete declaration (event type'+evtType+')');
                        return;
                    }
                    // Remove trailing argument bracket
                    if (h[1].charAt(h[1].length-1)==')') {
                        h[1] = h[1].substring (0,h[1].length-1);
                    }
                    h[1] = h[1].split ('(');
                    m = h[1][0].replace(' ','');
                    if (!m) {
                        throw new Error ('data-handlers="'+handlersString+'" has a missing method (event type'+evtType+')');
                        return;
                    }
                    h[1] = h[1][1].trim().split (',');
                    for (j in h[1]) {
                        if (h[1][j]=h[1][j].trim()) {
                            args.push (h[1][j]);
                        }
                    }
                    if (args.length) {
                        hs.push ( { method:m, args:args, hash:'#'+m+'/'+args.join('/') } );
                    }
                }
            }
            if (!handlers.length) {
                this.log ('warn',evt.currentTarget);
                this.log ('warn','Element has no valid: event_type {method_name () }');
            }
/*
for each args we have to unescape any of these using \
    \ ( ) { } ,


Parse the string into multiple handler object
If evtType is given, discard any objects of the wrong type


*/
        return hs;
    }

    handlers (evt) {
        var args=[],element,h='',handlers,hs=[],i,j,m='';
        if (evt.currentTarget.dataset.handlers==undefined) {
            evt.currentTarget.dataset.handlers = '';
        }
        if (evt.type=='click' && evt.currentTarget.hasAttribute('href')) {
            // Look for a click handler (just one)
            // click <a>
            hs = evt.currentTarget.getAttribute('href').split ('#');
            hs.shift ();
            hs = hs.join ('#');
            hs = hs.split ('/');
            for (i in hs) {
                if (hs[i]=hs[i].trim()) {
                    args.push (hs[i]);
                }
            }
            if (args.length) {
                m = args.shift ();
                hs = this.handlerString ('click',m,args);
            }
        }
        if (evt.currentTarget.dataset.handlers) {
            hs = ' ' + evt.currentTarget.dataset.handlers;
        }
        // Return all handler objects for this event type
        return this.handlerObjects (hs,evt.type);
    }

    hide (element) {
        element.classList.add ('hidden');
    }

    href (elmt) {
        var bcs,hash,hashed,href,query,properties={},split,url;
        if (elmt.hasAttribute('href')) {
            href = elmt.getAttribute ('href');
            hashed = href.indexOf('#') >= 0;
            split = href.split ('?');
            href = split.shift ();
            split = split.join ('?');
            split = split.split ('#');
            query = split.shift ();
            hash = split.join ('#')
            if (href.indexOf('://')>0) {
                // At a different host
                url = href;
            }
            else {
                // At the same host
                url = window.location.origin;
                if (href.indexOf('/')==0) {
                    // Absolute path
                    url += href;
                }
                else {
                    // Relative path
                    url += window.location.pathname + href;
                }
                if (query) {
                    url += '?' + query;
                }
                if (query) {
                    url += '#' + hash;
                }
            }
            url = new URL (url);
            properties = {
                app : false,
                hash : url.hash,
                willReload : true,
                remote : false,
                url : url
            }
            if (url.host!=window.location.host) {
                properties.external = true;
            }
            else if (url.pathname==window.location.pathname) {
                properties.app = true;
                if (url.search==window.location.search && hashed) {
                    properties.willReload = false;
                }
            }
            return properties;
        }
    }

    listenersAdd (element,handleFn) {
        var aclick,elm,es,h,hs,i;
        es = this.qsa (element,'[data-handlers],a');
        for (elm of es) {
            if ((hs=this.href(elm)) && hs.app) {
                aclick = true;
                elm.addEventListener ('click',handleFn);
            }
            if ('handlers' in elm.dataset) {
                hs = elm.dataset.handlers.split ('}');
                for (i=0;i<hs.length;i++) {
                    h = hs[i].split ('{');
                    if ((h[0]=h[0].trim()) && (h[1]=h[1].trim())) {
                        if (h[0]=='beforeaddlistener') {
                            // This is the actual event so run the handler now
                            try {
                                handleFn (this.event(h[0],elm,null));
                            }
                            catch (e) {
                                this.log ('error',e);
                            }
                        }
                        else if (h[0]=='click' && aclick) {
                            // Do not call the same function twice for the same event type
                        }
                        else {
                            elm.addEventListener (h[0],handleFn);
                        }
                    }
                }
            }
        }
    }

    merge (data,html) {
        var c,count,i,elm,elms,fragment,html,merges,path,prototype,v;
        prototype = document.createElement ('section');
        prototype.innerHTML = html;
        // Save memory
        html = null;
        // Add to the DOM so we can manipulate
        this.construction.appendChild (prototype);
        // Expansion of arrays
        count = 0;
        while (true) {
            if (count>=this.config.sanity.arrayExpansions) {
                // Sanity
                throw new Error ('Sanity kicked in after '+String(count)+' array expansion cycles');
                return;
            }
            count++;
            elms  = this.qsa (prototype,'[data-array]');
            if (!elms.length) {
                break;
            }
            for (elm of elms) {
                /*
                // Only if this elm[data-array] has no ancestor array
                // Confusingly, closest() starts by testing the element itself
                // If you do not want that you need to start with the parent
                */
                if (!elm.parentElement.closest('[data-array]')) {
                    /*
                    Only do one expansion per inner loop - ie use qsa() after each change.
                    If we go around the outer loop long enough, every data-array will end
                    up here (this.mergeExpand() always removes the attribute so it is no
                    longer selectable).
                    Transform a generic [data-array] row template ...
                    */
                    this.mergeExpand (data,elm);
                    /*
                    ... into a specific [data-list] template - ie having the right number
                    of correctly indexed rows for this array.
                    No longer a data-array, it is ignored next time round this outer loop.
                    Theoretical unlimited nesting is the aspiration...
                    */
                    // Always break from the inner loop
                    break;
                }
            }
        }
        // Instantiation with expanded data paths
        elms = this.qsa (prototype,'[data-merges]');
        for (elm of elms) {
            merges = this.mergesParse(elm.dataset.merges);
            for (i in merges) {
                try {
//console.error ('data.'+merges[i].path);
                    v = String (eval('data.'+merges[i].path));
                }
                catch (e) {
//console.error (e);
                    v = '';
                }
                if (merges[i].target=='html' || merges[i].target=='text') {
                    if (!v.length && elm.hasAttribute('data-ifempty')) {
                        merges[i].target=='text';
                        v = elm.dataset.ifempty;
                    }
                }
                // Text node merges
                if (merges[i].target=='html') {
                    elm.innerHTML = v;
                }
                else if (merges[i].target=='text') {
                    elm.innerText = v;
                }
                // Special merges
                else if (merges[i].target=='classes') {
                    c = elm.getAttribute ('class');
                    c = elm.setAttribute ('class',c+' '+v);
                }
                // General purpose set attribute
                else {
                    elm.setAttribute (merges[i].target,v)
                }
            }
        }
        html = prototype.innerHTML;
        // Lose the prototype from both DOM and memory on returning
        prototype.remove ();
        return html;
    }

    mergeExpand (data,wrapper) {
        var arr,elseElm,fragment,i,idx,idxs,j,merges,p,ps,rows=[],str;
        /*
        Manipulate a DOM-attached "live" element that wraps an array template.
        Therefore no return value is needed.
         * Receive an element *containing* template for the data structure
         * Replace it with n multiple indexed instantiations where n is the length
           of the array
        */
        // Immediately insure that parsing can only be attempted once
        wrapper.dataset.list = wrapper.dataset.array;
        delete wrapper.dataset.array;
        try {
            p = 'data.' + wrapper.dataset.list;
            arr = eval (p);
        }
        catch (e) {
            console.error (e);
            return;
        }
        // Make a copy from the template
        if (arr.length>0) {
            // Remove the no-results bit
            elseElm = this.qs (wrapper,':scope > [data-else]');
            if (elseElm) {
                elseElm.remove ();
            }
        }
        for (i in arr) {
            rows[i] = document.createElement ('section');
            rows[i].innerHTML = wrapper.innerHTML;
            this.construction.appendChild (rows[i]);
            // Add the row index to all data-index
            idxs = this.qsa (rows[i],'[data-index]');
            for (idx of idxs) {
                // But only if not nested in a [data-array]
                if (!idx.parentElement.closest('[data-array]')) {
                    idx.dataset.index = String (i);
                }
            }
            // Add the row index to all child data-array data paths
            ps = this.qsa (rows[i],'[data-array]');
            for (p of ps) {
                // String pointer is between the first empty square brackets
                idx = p.dataset.array.indexOf('[]') + 1;
                str = p.dataset.array.substring (0,idx);
                str += String (i);
                str += p.dataset.array.substring (idx);
                p.dataset.array = str;
            }
            // Add the row index to all merge data paths
            ps = this.qsa (rows[i],'[data-merges]');
            for (p of ps) {
                // Read merges and process their paths
                merges = this.mergesParse (p.dataset.merges);
                for (j in merges) {
                    // String pointer is between the first empty square brackets
                    idx = merges[j].path.indexOf('[]') + 1;
                    str = merges[j].path.substring (0,idx);
                    str += String (i);
                    str += merges[j].path.substring (idx);
                    merges[j].path = str;
                }
                // Write the merges
                p.dataset.merges = this.mergesStringify (merges);
            }
        }
        // Replace the generic template with the data-specific template
        wrapper.innerHTML = '';
        for (i in rows) {
            wrapper.innerHTML += rows[i].innerHTML;
            // ... and tidy up as we go
            rows[i].remove ();
        }
    }

    mergesParse (mergeString) {
        var i,parts,merges=[],split;
        // Eg: data-merges="data-isbn(books[].isbn) text(books[].title)""
        if (mergeString) {
            // Many value instantiations
            split = mergeString.split ('}');
            for (i in split) {
                if (split[i]=split[i].trim()) {
                    parts = split[i].split ('{');
                    if ((parts[0]=parts[0].replace(' ','')) && (parts[1]=parts[1].replace(' ',''))) {
                        merges.push ( { string: mergeString, target : parts[0], path : parts[1] } );
                    }
                    else {
                        merges.push ( { string: mergeString, target : parts[0], path : parts[1] } );
                        throw new Error ('data-merges="'+mergeString+'" is invalid');
                        return;
                    }
                }
            }
        }
        return merges;
    }

    mergesStringify (merges) {
        var i,ms=[];
        for (i in merges) {
            ms.push (merges[i].target+'{'+merges[i].path+'}');
        }
        ms = ms.join (' ');
        return ms;
    }

    parameters (search) {
        var k,params=[],ps,v;
        ps = new URLSearchParams ();
        for ([k,v] of ps.entries()) {
            params[k] = v;
        }
        return params;
    }

    payload (method,args=null) {
        var args,payload,response;
        /*
        If args are given, treat them as an array, interpret the method as
        a name string and use the default API class for the payload.

        Otherwise treat the method as the full payload object.
        */
        if (args) {
            payload = {
                vendor : this.config.defaults.vendor,
                package : this.config.defaults.package,
                class : this.config.defaults.class,
                method : String (method),
                args : []
            }
            for (i in args) {
                payload.args.push (args[i]);
            }
        }
        else {
            payload = method;
        }
        return payload;
    }

    qs (element,selector) {
        return element.querySelector (selector); // shorthand function
    }

    qsa (element,selector) {
        return element.querySelectorAll (selector); // shorthand function
    }

    reveal (element) {
        element.classList.remove ('hidden');
    }

    async run (app,evt,method,handle) {
        var err,fn,html,rs,rtn,state;
        html = evt.currentTarget.innerHTML;
        try {
            rtn = await method (evt,...handle.args);
        }
        catch (e) {
            err = e;
        }
        if (!err && !this.loginEvent) {
            // If we have successfully run this method there is no
            // requirement to none any login prompt or hide the content
            this.allow ();
        }
        // End of the framework run cycle
        fn = app.afterrunHook.bind (app);
        fn (evt,rtn,err);
    }

    state (hash,replace=false) {
        // NB URL query strings are viewed as temporary (ignored in terms of state)
        var state,url;
        state = this.userId + ',' + hash;
        if (replace) {
            history.replaceState (state,null,hash);
        }
        else if (state!=history.state) {
            history.pushState (state,null,hash);
        }
    }

// TODO: add state change handler(s) to prevent back button from revealing previous user's states (except #0 = anonymous)

    write (app,evt,options={}) {
        var fn,opts={},p;
        // Tolerate messy data
        if (String(options.force)==options.force) {
            if (options.force.toLowerCase()=='all') {
                options.force = [];
                for (p in options) {
                    if (p!='force') {
                        options.force.push (p);
                    }
                }
            }
            else {
                options.force = [ options.force ];
            }
        }
        else {
            options.force = [];
        }
        // Call beforewrite hook to provide event.write
        fn = app.beforewriteHook.bind (this);
        fn (evt,options);
        if (evt.write.payload) {
            // Repaint content of the destination box
            if (evt.write.contenttype==undefined) {
                evt.write.contenttype = 'text/html';
            }
            if (evt.write.contenttype!='text/html') {
                evt.write.contenttype!='text/plain';
            }
            if (evt.write.box) {
                if (evt.write.contenttype=='text/html') {
                    evt.output.box.innerHTML = evt.write.payload;
                }
                else {
                    evt.output.box.innerText = evt.write.payload;
                }
                evt.write.repainted = true;
            }
            else {
                console.error ('Output dumped - evt.write.box / data-destination not');
            }
        }
        // Call afterwrite hook
        fn = app.afterwriteHook.bind (app);
        fn (evt);
    }

}

