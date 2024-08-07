

export class Config {

    constructor ( ) {
        this.app = {
            logging : true,
            private : false
        }
        this.credentials = {
            cookie : 'hpapijssid',
            path : window.location.pathname.substring (0,window.location.pathname.lastIndexOf('/')) + '/',
            email : '',
            key : '',
            password : ''
        }
        this.server = {
            endpoint : 'https://playpen.markpage.net/hpapijs-api/',
            timeout : 7
        }
        // Using PHP templates gives programmable cache-control and maybe other useful things
        this.template = {
            directory : './template',
            extension : 'php',
            type : 'text/html'
        }




        this.connectTO              = 10;          // seconds
        this.diagnostic             = {
            data                    : true
        };
        this.enforceLocalStorage    = false;
        this.environment            = "development";
        this.forceTemplateLoad      = true;
        this.history                = {
            sessionDuration         : 1800,       // seconds to flag screens
            storageDuration         : 0,          // seconds to remember states
            storageLength           : 12          // items per group
        };
        this.inBodyLogger           = true;
        this.label                  = {
            login                   : "Log in",
            unlock                  : "Unlock"
        };
        this.loginByBadge           = true;
        this.mediaUrl               = '/media';
        this.navigatorOptions       = {
            lock                    : '#gui-splash',
            burger                  : '#gui-menu',
            findadd                 : null
        };
        this.papaparse              = {
            export                  : {
                quotes              : false,        // or array of booleans
                quoteChar           : '"',
                escapeChar          : '"',
                delimiter           : ",",
                header              : true,
                newline             : "\r\n",
                skipEmptyLines      : false,        // or 'greedy',
                columns             : null          // or array of strings
            },
            import                  : {
                delimiter           : "",           // auto-detect
                newline             : "",           // auto-detect
                quoteChar           : '"',
                escapeChar          : '"',
                header              : false,
                transformHeader     : undefined,
                dynamicTyping       : true,
                preview             : 0,
                encoding            : "",
                comments            : false,
                skipEmptyLines      : true,
                fastMode            : undefined,    // only works if no fields are quoted
                error               : undefined,    // callback for FileReader errors
                download            : false,        // parse argument is a string at this URL
                withCredentials     : undefined,    // XMLHttpRequest.withCredentials
                delimitersToGuess   : [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP],
                worker              : false,        // parse asynchronously
                beforeFirstChunk    : undefined,    // streaming callback function before first chunk
                chunk               : undefined,    // EITHER: streaming callback function for every chunk
                step                : undefined,    // OR:     streaming callback function for every row
                transform           : undefined,    // function to transform each value
                complete            : undefined     // worker callback function
            }
        };
        this.screenTO               = 3600;         // seconds
        this.searchTimeout          = 0.8;          // seconds
        this.templateTO             = 4;            // seconds
        this.url                    = 'https://some.host/some/api/';
    }

}

