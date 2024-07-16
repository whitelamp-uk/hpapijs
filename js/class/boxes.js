
/* Original boilerplate by Whitelamp http://www.whitelamp.co.uk */


export class Boxes {

    /*
    Framework boxes object

    Box numbers are stable references to a box object (even when the box is gone)

    Therefore this.boxCounter=0 at construction (representing main application box)
     * it is incremented and assigned to each box at insertion
     * it is never decremented
    */

    attach (parentElm,boxNr) {
        var box;
        // Attach the box to a parent element
        box = this.find (boxNr);
        if (!box.isConnected) {
            parentElm.appendChild (box);
            return true;
        }
    }

    blockers (evt) {
        var blocker;
        blocker = document.body.querySelector ('data-box="'+evt.currentTarget.dataset.box+'" [data-box][data-blocker]');
        if (blocker) {
            evt.preventDefault ();
        }
    }

    box0 (box) {
        if (this.boxes.length==0) {
            this.internal.insert (this.boxes,box);
        }
    }

    callbackSet (callbackFn) {
        this.callbackFn = callbackFn;
    }

    constructor (config,body) {
        // Internal support functions
        this.internal = {
            insert : function (boxes,box,lilo=false) {
                var from,level,levels,lifo;
                /*
                Add this box to this.boxes by splicing it in at the right point
                array index <==> CSS z-index
                */
                levels = {
                    sticky: 0,
                    view: 0,
                    state: 0,
                    write: 1,
                    ephemeral: 2
                }
                level = levels[box.dataset.persistence];
                // This insert is "last in", "first out" is the highest array index
                // for any given level 
                lifo = lilo==undefined || !lilo;
                for (from in boxes) {
                    if (lilo && levels[boxes[from].element.dataset.persistence]==level) {
                        // LILO - last box created goes at the bottom of the level
                        break;
                    }
                    if (lifo && levels[boxes[from].element.dataset.persistence]>0) {
                        // Last box created goes on top
                        break;
                    }
                }
                this.reindex (boxes,from);
            },

            reindex : function (boxes,from=1) {
                var i;
                // Squirt the new box into the right place in the array
                from *= 1;
                if (from<1) {
                    throw new Error ('Box re-indexing cannot start below z-index=1');
                }
                // z-indexes are to be incremented contiguously beyond this index
                for (i=from;boxes[i];i++) {
                    box.dataset.zindex = String (i);
                }
            }
        }

        this.config = config;
        this.body = body;
        this.boxCounter = 0;
        this.boxes = [];
        this.dragbox = null;
        this.dragstart = null;
        this.dragzone = document.querySelector ('[data-dragzone]');
    }

    create (persistence='sticky',options={}) {
        var box,p,ps;
        ps = [ 'sticky', 'view', 'state', 'repaint', 'ephemeral' ];
        if (!ps.includes(persistence)) {
            persistence = 'sticky';
        }
        /*
        All optional: { blocker: true, closer: true, mover: true, shrinker: true }
        */
        ps = [ 'blocker', 'closer', 'mover', 'shrinker' ];
        this.callbackFn ( { box: box, before: 'create' } );
        // Increment the box number counter
        this.boxCounter++;
        // Create a box element
        box = document.createElement ('section');
        box.dataset.box = String (this.boxCounter);
        box.dataset.persistence = persistence;
        if (options) {
            for (p in options) {
                if (ps.includes(p)) {
                    box.dataset[p] = p;
                }
                else {
                    throw new Error ('"Box option "'+p+'" is not valid');
                    return;
                }
            }
        }
        for (p in this.chromeDefaults) {
            if (box.dataset[p]) {
                // The option wins
            }
            else {
                // The default gets used
                box.dataset[p] = this.chromeDefaults[p];
            }
        }
        this.internal.insert (this.boxes,box,options.lilo);
        box.addEventListener ('focus',this.blockers.bind(this));
        this.callbackFn ( { box: box, after: 'create' } );
        return box;
    }

    destroy (boxNr) {
        var box,from;
        box = this.box (boxNr);
        this.callbackFn ( { box: box, before: 'destroy' } );
        // Detach from the DOM
        if (box.isConnected) {
            box.remove ();
        }
        // Lose the array element
        if (box) {
            from = box.dataset.zindex;
            this.boxes.splice (box.index,1);
            this.internal.reindex (this.boxes,from);
        }
        this.callbackFn ( { box: box, after: 'destroy' } );
    }

    detach (boxNr) {
        var box;
        box = this.box (boxNr);
        // Detach from the DOM
        if (box.isConnected) {
            box.remove ();
        }
    }

    function dragBoundaries (styles) {
        var bounds={};
        bounds.min = {
            x: parseFloat (styles.getPropertyValue('margin-left')),
            y: parseFloat (styles.getPropertyValue('margin-top'))
        }
        bounds.min.x += parseFloat (styles.getPropertyValue ('left'));
        bounds.min.y += parseFloat (styles.getPropertyValue ('top'));
        bounds.max = {
            x: bounds.min.x + parseFloat (styles.getPropertyValue ('width')),
            y: bounds.min.y + parseFloat (styles.getPropertyValue ('height'))
        }
        return bounds;
    }

    function dragChecking (evt) {
        var bounds,mouse;
        if (this.dragstart) {
            mouse = {
                x: parseFloat (evt.clientX),
                y: parseFloat (evt.clientY)
            };
            bounds = this.dragBoundaries (getComputedStyle(this.dragzone));
            if (mouse.x<bounds.min.x || mouse.x>bounds.max.x || mouse.y<bounds.min.y || mouse.y>bounds.max.y) {
                this.dragEnding (evt);
            }
        }
    }

    function dragEnding (evt) {
        if (this.dragstart) {
            this.body.removeEventListener ('mousemove',this.dragMoving.bind(this),false);
            this.body.removeEventListener ('mouseup',this.dragEnding.bind(this),false);
            this.body.removeEventListener ('mouseleave',this.dragEnding.bind(this),false);
            this.dragMoving (evt);
            start = null;
        }
    }

    function dragMoving (evt) {
        var bounds,left,mouse,styles,top;
        if (this.dragstart && 'clientX' in evt) {
            styles = getComputedStyle (this.dragbox);
            mouse = {
                x: parseFloat (evt.clientX),
                y: parseFloat (evt.clientY)
            };
            left = (start.box.x + mouse.x - start.mouse.x);
            top = (start.box.y + mouse.y - start.mouse.y);
            bounds = boundaries (getComputedStyle(dragzone));
            bounds.max.x -= parseFloat (styles.getPropertyValue('width'));
            bounds.max.y -= parseFloat (styles.getPropertyValue('height'));
            if (left<bounds.min.x) {
                left = bounds.min.x;
            }
            else if (left>bounds.max.x) {
                left = bounds.max.x;
            }
            if (top<bounds.min.y) {
                top = bounds.min.y;
            }
            else if (top>bounds.max.y) {
                top = bounds.max.y;
            }
            this.dragbox.style.left = left + 'px';
            this.dragbox.style.top = top + 'px';
        }
    }

    function dragStarting (evt) {
        var dragger,styles;
        this.dragger = evt.currentTarget;
        this.dragger.addEventListener ('mousedown',starting);
        this.dragbox = this.dragger.closest ('[data-box]');
        styles = getComputedStyle (box);
        this.dragstart = {
            mouse: {
                x: parseFloat (evt.clientX),
                y: parseFloat (evt.clientY)
            },
            box: {
                x: parseFloat (styles.getPropertyValue('left')),
                y: parseFloat (styles.getPropertyValue('top'))
            }
        };
        this.body.removeEventListener ('mousemove',this.dragMoving.bind(this),false);
        this.body.removeEventListener ('mouseup',this.dragEnding.bind(this),false);
        this.body.removeEventListener ('mouseleave',this.dragEnding.bind(this),false);
    }

    find (boxNr) {
        var i;
        if (boxNr>0) {
            for (i in this.boxes) {
                if (this.boxes[i].dataset.number==boxNr) {
                    return box;
                }
            }
        }
    }




















}

