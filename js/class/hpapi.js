
/* Copyright 2018 Whitelamp http://www.whitelamp.com/ */

export class Hpapi {

    constructor (config) {
        console.log ('Constructing '+this.constructor.name+' extends Hpapi');
        this.userId = 0;
        this.errorCodesReserved = {
            input : 999,
            connection : 998,
            server : 997,
            response : 996,
            reserved2 : 995,
            reserved3 : 994,
            reserved4 : 993,
            reserved5 : 992,
            reserved6 : 991,
        }
        this.config = config;

// TODO a lot of these functions should be in framework so swapping out the API is modular

        this.token = this.tokenRead ();
    }

    error (code,message,originatingError=null) {
        return new Error (
            message,
            {
                cause: {
                    code : code,
                    cause : originatingError
                }
            }
        );
    }

    async fetch (timeoutSecs,url,credentials,payload) {
        var json,k,request,response,rtn;
        try {
            request = this.pack (credentials,payload);
        }
        catch (e) {
            this.log ('error',e.message);
            throw this.error (this.errorCodesReserved.input,e.message,e);
            return false;
        }
        try {
            rtn = await this.fetchJson (timeoutSecs,url,request);
        }
        catch (e) {
            this.log ('error',e.message);
        }
        if ('password' in request && request.password.length>0) {
            request.password = '[redacted]'
        }
//        this.log ('log',request);
        if (!rtn) {
            throw this.error (this.errorCodesReserved.connection,e.message,e);
            return false;
        }
        try {
            json = JSON.parse (rtn);
        }
        catch (e) {
            this.log ('error',rtn);
            throw this.error (this.errorCodesReserved.server,'Server response is not JSON',e);
            return false;
        }
        try {
            response = this.unpack (credentials,json);
        }
        catch (e) {
            this.log ('error',e.message);
            throw this.error (this.errorCodesReserved.output,'Failed to unpack response',e);
            return false;
        }
        return response;
    }

    async fetchHtml (timeoutSecs,url,postData=null) {
        var html,options,response;
        options = {
            timeout : 1000 * timeoutSecs,
            method: 'GET',
            headers: {
                "Content-Type": "text/html"
            }
        }
        if (postData) {
            options.method = 'POST';
            options.body = postData;
        }
        response = await this.fetchUrl (url,options);
        html = await response.text ();
        return html;
    }

    async fetchJson (timeoutSecs,url,request) {
        var json,options,response,text;
        options = {
            timeout: 1000 * timeoutSecs,
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify (request)
        }
        response = await this.fetchUrl (url,options,'TEST');
        text = await response.text ();
        return text;
    }

    async fetchTemplate (timeoutSecs,url,contentType) {
        var html,options,response;
        options = {
            timeout : 1000*timeoutSecs,
            method: 'GET',
            headers: {
                "Content-Type": contentType
            }
        }
        response = await this.fetchUrl (url,options);
        html = await response.text ();
        return html;
    }

    async fetchUrl (url,options) {
        var c,m,r,t;
        c = new AbortController ();
        t = setTimeout (c.abort.bind(c),options.timeout);
        options.signal = c.signal;
        try {
            r = await fetch (url,options);
            clearTimeout (t);
            if (!r.ok) {
                m = `HTTP error ${r.status}`;
                this.log ('error',m);
                throw this.error (this.errorCodesReserved.connection,m);
                return false;
            }
            return r;
        }
        catch (e) {
            this.log ('error',e.message);
        }
    }

    log (type,obj) {
        if (!['log','warn','error'].includes(type)) {
            throw new Error ('logging type "'+type+'" invalid: one of [ log warn error]');
        }
        if (this.config.app.logging) {
            console[type] (obj);
        }
    }

    pack (credentials,method) {
        var request,token;
        if (this.config.credentials.email && this.email) {
            if (this.config.credentials.email!=this.email) {
                // Authenticated user has changed
                this.config.credentials.userChanged = true;
            }
            this.tokenDelete ();
        }
        request = {
            method : method
        }
        if (credentials.key) {
            // Sessionless API key
            request.key = credentials.key;
        }
        else {
            token = this.token;
            if (this.token.value) {
                // Normally use a session token (no locally stored password)
                request.token = this.token.value;
            }
            else if (credentials.password) {
                // Email and password when there is no token
                request.email = credentials.email;
                request.password = credentials.password;
            }
            else {
                // Anonymous request
                request.password = '';
            }
        }
        request.datetime = new Date().toUTCString ();
        return request;
    }

    async ping (evt,responseHook,fetchFn) {
        var payload,response;
        /*
        The main purpose of ping() is to do pre-flight authentication -  used in conjunction with
        this.config.app.private = true

        Hpapi ping() is an Hpapi dummy method that works anonymously for any class
        [ \Hpapi\Utility::ping() does not really exist ]

        If the response meta-data and a simple true/false return value is not sufficient for you:
         * copy this method to App.ping() and modify App to use it instead
         * use App.ping() to call your own real Hpapi ping() override method
         * configure `hpapi_run` permissions to allow anonymous users
        */
        payload = {
            "vendor" : "whitelamp-uk",
            "package" : "hpapi-utility",
            "class" : "\\Hpapi\\Utility",
            "method" : "ping",
            "arguments" : [
            ]
        }
        response = await fetchFn (evt,payload,responseHook);
        return response;
    }

    async pong (evt,responseHook,fetchFn,authCode,deniedError=true) {
        var payload,response;
        /*
        Hpapi pong() is an Hpapi dummy method that works anonymously for any class
        [ \Hpapi\Utility::pong() does not really exist ]

        It allows you to force a dummy response from the server
        */
        authCode = String (authCode);
        if (authCode.length!=3 || authCode<'061' || authCode>'071') {
            throw new Error ('Auth status must be between 061 and 071 inclusive');
            return false;
        }
        if (!(deniedError && true) && !['068','070','071'].includes(authCode)) {
            throw new Error ('Nonsensical - auth status '+authCode+' will alway get a denied error');
            return false;
        }
        payload = {
            "vendor" : "whitelamp-uk",
            "package" : "hpapi-utility",
            "class" : "\\Hpapi\\Utility",
            "method" : "pong",
            "arguments" : [
                authCode,
                deniedError
            ]
        }
        response = await fetchFn (evt,payload,responseHook);
        return response;
    }

    tokenDelete ( ) {
        var token;
        token = { value : '', expires : 0 };
        this.token = this.tokenWrite (token);
    }

    tokenRead ( ) {
        var c,d,i,p;
        // Even if you delete a cookie you can still
        // read it for the rest of the session
        // so this is run by this.constructor()
        // and subsequently this.token should be used
        if (!this.config.credentials.cookie) {
            this.log ('error','Config.credentials.cookie has not been configured');
            return { value : '', expires : 0 };
        }
        c = document.cookie.split (';');
        for (i in c) {
            p = c[i].split ('=');
            if (decodeURIComponent(p[0].trim())==this.config.credentials.cookie) {
                if ((i+1) in c) {
                    d = c[i+1].split ('=');
                    d = new Date (d[1].trim());
                    d = Math.floor (d.getTime()/1000);
                }
                else {
                    d = 0;
                }
                return {
                    value : decodeURIComponent (p[1].trim()),
                    expires : d
                };
            }
        }
        return { value : '', expires : 0 };
    }

    tokenWrite (token) {
        var d;
        if (this.config.credentials.cookie.length==0) {
            this.log ('error','Config.credentials.cookie has not been configured');
            return '';
        }
        d = 0;
        if (!this.config.app.sessions) {
            d = new Date (1000*token.expires);
            d = d.toUTCString ();
        }
        document.cookie = encodeURIComponent (this.config.credentials.cookie) + '=' + encodeURIComponent (token.value) + ';expires=' + d;
        return token;
    }

    unpack (credentials,rtn) {
        var error,parts,response,s,t;
        response                = rtn.response;
        // Remove email and password from credentials
        // Either there is now a token or the user has to try again
        delete credentials.email;
        delete credentials.password;
        // Save user ID
        this.userId             = rtn.userId;
        // Save new token
        if ('token' in response) {
            t = {
                value : response.token,
                expires : response.tokenExpires
            };
            this.token          = this.tokenWrite (credentials.cookie,t);
            this.email          = rtn.email;
        }
        s                       = {};
        s.userChanged           = false;
        if (this.config.credentials.userChanged) {
            // Authenticated user has changed
            s.userChanged       = true;
            delete this.config.credentials.userChanged;
        }
        parts                   = response.authStatus.split (' ');
        s.auth                  = parts[0];
        s.anonymous             = false; // anonymous      = neither email nor token was given
        s.authenticated         = false; // authenticated  = passed auth with either email or token
        s.verified              = false; // verified       = passed auth but user is not verified
        s.unauthorized          = false; // unauthorised   = failed auth with either email or token
        s.expired               = false; // expired        = token has expired
        s.denied                = false; // denied         = request denied
        if (s.auth=='068' || s.auth=='070') {
            s.authenticated     = true;
        }
        if (s.auth=='069') {
            s.expired           = true;
        }
        if (s.auth=='071') {
            s.anonymous         = true;
        }
        if (s.auth!='064' && s.auth!='069' && s.auth!='071') {
            s.unauthorized      = true;
        }
        if (s.auth=='068') {
            s.verified          = true;
        }
        s.token                 = true;
        if (s.auth=='069') {
            s.token             = false;
            this.tokenDelete (credentials.cookie);
        }
        s.message               = parts.join (' ');
        if (response.error) {
            s.error             = {};
            parts               = response.error.split (' ');
            s.error.hpapi       = parts[0];
            parts.shift ();
            s.error.http        = parts[0];
            parts.shift ();
            s.error.message     = parts.join (' ');
            if (s.error.http=='403') {
                s.denied        = true;
            }
        }
        else {
            s.error             = null;
        }
        response.status         = s;
//        this.log ('log',response);
        return response;
    }

}


