/* ------------------------------
*  Cwc Controller instance !
*  ------------------------------
*  _ = private vars & functons
*/

!function() {
"use strict";

    var cwc = {

        /* ------------------------------------------------------
        * Global connection to server
        */
        _server_connection : null,

        /* ------------------------------------------------------
        * Not USed yet might want to stoe client this send ci here
        */
        _cwc_client_id : null,

        /* ------------------------------------------------------
        * Set type of plugin
        */
        _cwc_type : 'controller',

        /* ------------------------------------------------------
        * Stores initialized plugins.
        */
        _plugins: {},

        /* ------------------------------------------------------
        * Stores generated unique ids for plugin instances
        */
        _uuids: [],

        /* ------------------------------------------------------
        * Stores currently active plugins.
        */
        _activePlugins: {},

        /* ------------------------------------------------------
        * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
        * @param {Object} plugin - The constructor of the plugin.
        */
        plugin: function(plugin, name) {
            // Object key to use when adding to global Foundation object
            // Examples: Foundation.Reveal, Foundation.OffCanvas
            var className = (name || functionName(plugin));
            // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
            // Examples: data-reveal, data-off-canvas
            var attrName  = hyphenate(className);

            // Add to the Foundation object and the plugins list (for reflowing)
            this._plugins[attrName] = this[className] = plugin;
        },

        /*------------------------------------------------------
        * @function
        * Creates a pointer to an instance of a Plugin within the Foundation._activePlugins object.
        * Sets the `[data-pluginName="uniqueIdHere"]`, allowing easy access to any plugin's internal methods.
        * Also fires the initialization event for each plugin, consolidating repeditive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @fires Plugin#init
        */
        registerPlugin: function(plugin, name){
            var pluginName  = name ? hyphenate(name) : functionName( plugin.constructor ).toLowerCase();
                plugin.uuid = this.GetYoDigits(6, pluginName);

            this._uuids.push(plugin.uuid);

            return;
        },

        /*------------------------------------------------------
        * returns a random base-36 uid with namespacing
        * @function
        * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
        * @param {String} namespace - name of plugin to be incorporated in uid, optional.
        * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
        * @returns {String} - unique id
        */
        GetYoDigits: function(length, namespace){
            length = length || 6;
            return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1) + (namespace ? '-' + namespace : '');
        },

    };

    /* -- Bound out object to the window -- */
    window.cwc = cwc;

}();

/*------------------------------------------------------
* -- Centralised --
*/
//@codekit-append "../../centralised/_functions.js";
//@codekit-append "../../centralised/_Server.js";
//@codekit-append "../../centralised/_ServerMethod.js";
//@codekit-append "../../centralised/_CustomMethod.js";

/*------------------------------------------------------
* -- Controller Assets --
*/
//@codekit-append "_D_Pad.js"
//@codekit-append "_SwipePad.js";
//@codekit-append "_AnalogPad.js";
//@codekit-append "_ViewportScroll.js";

// Polyfill to get the name of a function in IE9
function functionName(fn)
{
	if (Function.prototype.name === undefined)
	{
		var funcNameRegex = /function\s([^(]{1,})\(/;
		var results = (funcNameRegex).exec((fn).toString());
		return (results && results.length > 1) ? results[1].trim() : "";
	}
	else if (fn.prototype === undefined)
	{
		return fn.constructor.name;
	}
	else
	{
		return fn.prototype.constructor.name;
	}
}

// Convert PascalCase to kebab-case
// Thank you: http://stackoverflow.com/a/8955580
function hyphenate(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @object - Server Object
    * @info   - Used to handle communication between server
    * and client
    */
    function Server( options )
    {
        /* -- register the plugin -- */
        cwc.registerPlugin(this, 'Server');

        /* -- Get ready to accept hi message from server -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'hi',
            callback : function( client_id ) {
                cwc.Server.prototype.say_hi_back( client_id );
            }
        } );

        /* -- Connect to the host via web sockets -- */
        cwc._server_connection = this.connect(
            options.host,
            options.port,
            options.type
        );

        /* -- Set message evetns -- */
        if( cwc._server_connection )
        {
            this.set_connection_events();
        }

    };

    /*------------------------------------------------------
    * @object - Connection
    * @info - The connection object to main server
    */
    Server.prototype.connection = null;

    /*------------------------------------------------------
    * @int - Client id
    * @info - Store the given clients id from the server
    */
    Server.prototype.client_id = null;

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.connect = function( host, port, type )
    {
        /* -- Check the type of connection -- */
        switch ( type )
        {
            case 'ws':
                return new WebSocket (
                    'ws:' + host + ':'+ port
                );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Set connection events
    * @info - onerror, onclose, onopen,onmessage
    */
    Server.prototype.set_connection_events = function()
    {
        /* -- Set us the event handleres -- */
        cwc._server_connection.onerror = function(){
            cwc.Server.prototype.onerror(
            );
        };

        cwc._server_connection.onclose = function(){
            cwc.Server.prototype.onclose(
            )
        };

        cwc._server_connection.onopen = function(  ){
            cwc.Server.prototype.onopen(
                this.connection
            )
        };

        cwc._server_connection.onmessage = function ( data ) {
            cwc.Server.prototype.onmessage(
                data
            );
        };

    };

    /*------------------------------------------------------
    * @function - Say hi back
    * @info - We will send our cleint type back to there server,
    * when recived an on hi message
    */
    Server.prototype.say_hi_back = function( client_id )
    {

        cwc.Server.prototype.client_id = client_id;

        cwc.Server.prototype.send_message({
            recipient : 'server',
            action    : 'client says hello',
            arguments : {
                client_id : client_id,
                sender    : cwc._cwc_type
            }
        });

    };

    /*------------------------------------------------------
    * @function - On open
    * @info - on connect open
    */
    Server.prototype.onopen = function( con )
    {

    };

    /*------------------------------------------------------
    * @function - On error
    * @info - on connect error
    */
    Server.prototype.onerror = function()
    {
        console.log('Error connectiong');

    };

    /*------------------------------------------------------
    * @function - On close
    * @info - Server has sent a message
    */
    Server.prototype.onclose = function()
    {
        console.log('closed ');

    };

    /*------------------------------------------------------
    * @function - On message
    * @info - Server has sent a message
    */
    Server.prototype.onmessage = function( data )
    {
        /* -- Message data -- */
        var data = JSON.parse( data.data );

        //console.log( data );

        /* -- Is a valid mesage : return true not valid -- */
        if( cwc.Server.prototype.validate_onmessage( data ) )
        {
            console.log( 'Message not properly formatted' );
        }

        /* -- Message for Display || Controller-- */
        else if( cwc._cwc_type  == data.recipient )
        {
            cwc.ServerMethod.prototype.call_method( data );
        }

        /* -- Message for display & controller -- */
        else if( data.recipient  == 'all' )
        {
            cwc.ServerMethod.prototype.call_method( data );
        }

    };

    /*------------------------------------------------------
    * @function - Send message
    * @info - Send a message to the server from dlient
    */
    Server.prototype.send_message = function( data )
    {
        /* -- Set where they come from -- */
        data.sender = cwc._cwc_type;

        /* -- Is this a valid mesage : return true not valid -- */
        if( this.validate_onmessage( data ) )
        {
            console.log( 'Message not properly formatted' );
        }
        else
        {
            cwc._server_connection.send( JSON.stringify(
                data
            ) );
        }

        // console.log( data );

    };

    /*------------------------------------------------------
    * @function - Validate onmessage
    * @info - Validate the message from the server
    */
    Server.prototype.validate_onmessage = function( data )
    {
        var checks = [
            /* -- This is the method we wish to run -- */
            'action',

            /* -- Whome the message is for -- */
            'recipient',

            /* -- Arguments to be passed to method -- */
            'arguments',

            /* -- Who sent the message -- */
            'sender',
        ];

        for( var i = 0; i < checks.length; i++ )
        {
            /* -- If property was not found : return true -- */
            if ( ! data.hasOwnProperty( checks[i] ) )
            {
                return true;
            }
        }

        return false;

    };

    cwc.plugin(Server, 'Server');

}( window.cwc );

!function( cwc ){
  'use strict';

    function ServerMethod( )
    {
        cwc.registerPlugin(this, 'CustomMethod');
    }

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    ServerMethod.prototype.custom_methods = [
    ];

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    ServerMethod.prototype.create_method = function( prams )
    {
        this.custom_methods[ prams.action ] = {
            'callback' : prams.callback
        };

    };

    /*------------------------------------------------------
    * @function - Call method
    * @info     - Use to invoke created methord
    */
    ServerMethod.prototype.call_method = function( prams )
    {
        /* -- Check methord exsists -- */
        if( this.custom_methods[ prams.action ] )
        {
            this.custom_methods[ prams.action ].callback(
                prams.arguments
            );
        }

    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(ServerMethod, 'ServerMethod');

}( window.cwc );

!function( cwc ){
  'use strict';

    function CustomMethod( )
    {
        cwc.registerPlugin(this, 'CustomMethod');
    }

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    CustomMethod.prototype.custom_methods = [
    ];

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    CustomMethod.prototype.create_method = function( prams )
    {
        this.custom_methods[ prams.name ] = {
            'method' : prams.method
        };

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    CustomMethod.prototype.call_method = function( prams )
    {
        if( "arguments" in prams )
        {
            this.custom_methods[ prams.method ].method(
                prams.arguments
            );
        }
        else
        {
            this.custom_methods[ prams.method ].method(
            );
        }

    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(CustomMethod, 'CustomMethod');

}( window.cwc );

/*------------------------------------------------------
 * To-Do
 ------------------------------------------------------
 • Add support for data attr nav dir - up, down, left, right
 • Add support for NO end last and first attr
 • Add support for Enter key for on select
 • Must show testing on Screen
 • Add commit
 ------------------------------------------------------
 • Start D-pad
*/


!function( cwc, Hammer ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function D_Pad( extend )
    {
        cwc.registerPlugin(this, 'D_Pad');

        this.controller_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    D_Pad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=d-pad',
            btn        : 'data-cwc-cbtn',
        }

    };

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    D_Pad.prototype.events = {
            /* -- D & right -- */
            68 : function(){  },
            39 : function(){  },

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    D_Pad.prototype.all_dpads = [];

    D_Pad.prototype.controller_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            /* -- Find all item in group -- */
            var actions = this.controller_actions_lookup(
                controllers[ c_id ], c_id
            );

            this.all_dpads[ c_id ] = {
                container : controllers[ c_id ],
                actions   : actions
            };

        };

    }

   /*------------------------------------------------------
    * @function - Navitems lookup
    * @info - Find elms with data-(navitem) add the this to object
    * @return - true : false
    */
    D_Pad.prototype.controller_actions_lookup = function( group, c_id )
    {
        var descendents     = group.querySelectorAll('['+ this.taxonomy.data.btn +']');
        var descendents_len = descendents.length;

        var actions = [
        ];

        for( var a_id = 0; a_id < descendents_len; a_id++ )
        {
            var action = descendents[ a_id ];
                action.a_id = a_id;
                action.c_id = c_id;

            // action.onclick = function(  ){
            //      cwc.D_Pad.prototype.button_invoked(
            //         this.c_id,
            //         this.a_id
            //     )
            // };

            var hammertime = new Hammer(action, {});
            hammertime.on('tap', function(ev) {
                 cwc.D_Pad.prototype.button_invoked(
                    ev.target.c_id,
                    ev.target.a_id
                )
            });

            actions.push( action )
        }

        return actions;

    };

     D_Pad.prototype.button_invoked = function( c_id, a_id )
     {
        var action = this.all_dpads[ c_id ].actions[ a_id ];

        this.validate_action (
            action.getAttribute( this.taxonomy.data.btn )
        );

     }

     D_Pad.prototype.validate_action = function( type )
     {
        /* -- Validate action -- */
        switch( type )
        {
            case 'up'     :
            case 'right'  :
            case 'down'   :
            case 'left'   :
            case 'enter'  :
            this.send_actions_to_first_screen( type );
            break;
        }

     }

     D_Pad.prototype.send_actions_to_first_screen = function( action )
     {
        console.log('sending ' + action);

        cwc.Server.prototype.send_message({
            recipient : 'display',
            action    : 'move navigation',
            arguments : action
        });
     }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(D_Pad, 'D_Pad');

}( window.cwc, Hammer );

/*------------------------------------------------------
 * To-Do
 ------------------------------------------------------
 • Add support for data attr nav dir - up, down, left, right
 • Add support for NO end last and first attr
 • Add support for Enter key for on select
 • Must show testing on Screen
 • Add commit
 ------------------------------------------------------
 • Start D-pad
*/

!function( cwc, Hammer ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function SwipePad( extend )
    {
        cwc.registerPlugin(this, 'SwipePad');

        this.swipe_pad_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    SwipePad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=swipe-pad'
        }

    };


    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    SwipePad.prototype.all_swipe_pad = [];

    SwipePad.prototype.swipe_pad_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var hammertime_h = new Hammer(controllers[ c_id ], {});
            var hammertime_v = new Hammer(controllers[ c_id ], {});

            /* -- Tap -- */
            hammertime_h.on('tap', function(ev) {
                cwc.SwipePad.prototype.validate_action( 500 );
            });

            /* -- Add horazontal -- */
            hammertime_h.on('swipe', function(ev) {
                cwc.SwipePad.prototype.validate_action( ev.direction );
            });

            /* -- Add vertical -- */
            hammertime_v.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
            hammertime_v.on('swipe', function(ev) {
                cwc.SwipePad.prototype.validate_action( ev.direction );
            });
        };

    }

     SwipePad.prototype.validate_action = function( type )
     {
        var dirs = {
           8   : 'up',
           4   : 'right',
           16  : 'down',
           2   : 'left',
           500 : 'enter'
        };

        console.log( type )

        // -- Send the action to the main screen --
        this.send_actions_to_first_screen(
            dirs[ type ]
        );

     }

     SwipePad.prototype.send_actions_to_first_screen = function( action )
     {
        console.log('sending ' + action);

        cwc.Server.prototype.send_message({
            recipient : 'display',
            action    : 'move navigation',
            arguments : action
        });
     }


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(SwipePad, 'SwipePad');

}( window.cwc, Hammer );

/*------------------------------------------------------
 * To-Do
 ------------------------------------------------------
 • Add support for data attr nav dir - up, down, left, right
 • Add support for NO end last and first attr
 • Add support for Enter key for on select
 • Must show testing on Screen
 • Add commit
 ------------------------------------------------------
 • Start D-pad
*/

!function( cwc, Hammer ){
  'use strict';


    /*------------------------------------------------------
    * @function
    */
    function AnalogPad( extend )
    {
        cwc.registerPlugin(this, 'AnalogPad');

        this.pad_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    AnalogPad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=analog-pad'
        }

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.all_analogpads = [];

    /*------------------------------------------------------
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    AnalogPad.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'

    };

    /*------------------------------------------------------
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    AnalogPad.prototype.is_sending = false;

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.auto_move_timer = false;

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.tracking = null;

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    AnalogPad.prototype.pad_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var analog = controllers[ c_id ];
                analog.c_id = c_id;

            var trigger = analog.querySelector("span");
                trigger.c_id = c_id;

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( analog );
                mc.add(new Hammer.Pan({
                    domEvents: false,
                    threshold: 4, pointers: 0
                } ) );

            mc.on("panstart panmove panend", function( ev ) {
                cwc.AnalogPad.prototype.on_analog_pan( ev );
            });

            /* -- Save the group -- */
            this.all_analogpads[ c_id ] = {
                analog           : analog,
                trigger          : trigger,
                // instructions     : instructions
            };

        }

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    AnalogPad.prototype.on_analog_pan = function( ev )
    {
        var c_id = ( event.target.c_id == undefined )? this.tracking : c_id;

        var analog  = this.all_analogpads[ 0 ].analog;
        var trigger = this.all_analogpads[ 0 ].trigger;

        /* -- Remove all -- */
        if( ev.type === 'panstart' )
        {
            this.tracking = c_id;
            analog.classList.add("active");
            return;
        }

        /* -- Remove all -- */
        if( ev.type === 'panend' )
        {
            /* -- Clear out the timer -- */
            this.analog_reset( analog, trigger )
            return;
        }

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        var analog_c = {
            x: analog.offsetLeft,
            y: analog.offsetTop,
            radius: analog.clientWidth / 2,
        };

        var trigger_c = {
            radius: trigger.clientWidth / 2,
            x: delta.x,
            y: delta.y,
            s_x: trigger.offsetLeft,
            s_y: trigger.offsetTop,
        };

        /* --- Collision detection for when moving out of circle -- */
        var dx = (analog_c.x + analog_c.radius) - (trigger_c.x + trigger_c.radius) - trigger_c.s_x;
        var dy = (analog_c.y + analog_c.radius) - (trigger_c.y + trigger_c.radius) - trigger_c.s_y;
        var distance = Math.sqrt(dx * dx + dy * dy) + ( trigger_c.radius );

        if (distance > analog_c.radius + trigger_c.radius)
        {
            /* --- Collision detection : for fix the triiger againsied the of the analog area -- */
            var angle = ev.angle;
            var x = analog_c.x + analog_c.radius * Math.cos( angle * (Math.PI / 180) );
            var y = analog_c.y + analog_c.radius * Math.sin( angle * (Math.PI / 180) );

            this.restricted_bounds_movment(
                analog,
                trigger,
                x,
                y
            );

            /* -- Send the action to the main screen -- */
            this.send_actions_to_first_screen(
                this.hammer_dirs[ ev.direction ], 200
            );
        }
        else
        {
            /* -- no collision -- */
            this.within_bounds_movment(
                analog,
                trigger,
                delta.x,
                delta.y,
                this.hammer_dirs[ ev.direction ]
            );
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.analog_reset = function( analog, trigger )
    {
        /* -- Remove any if nessary -- */
        analog.classList.remove("active");
        analog.classList.remove("auto");

        /* -- Remove the last tracking id -- */
        this.tracking = null;

        /* -- Move the publlbar handle to start -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : 0,
            delta_y : 0
        });

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.restricted_bounds_movment = function( analog, trigger, x, y )
    {
        /* -- add auto class -- */
        analog.classList.add("auto");

        /* -- Move the publlbar handle -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : x,
            delta_y : y
        });

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.within_bounds_movment = function( analog, trigger, deltaX, deltaY, dir )
    {
        /* -- Remove class auto -- */
        analog.classList.remove("auto");

        /* -- Move the publlbar handle -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : deltaX,
            delta_y : deltaY
        });

        /* -- Send the action to the main screen -- */
        this.send_actions_to_first_screen(
            dir, 400
        );

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.trigger_translate = function( prams )
    {
        /* -- Move the publlbar handle -- */
        window.requestAnimationFrame( function(){
            prams.trigger.style.transform = [
                'translate3d(' + prams.delta_x + 'px,' + prams.delta_y + 'px, 0)'
            ]
        });

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
     AnalogPad.prototype.send_actions_to_first_screen = function( action, delay )
     {
        if ( ! this.is_sending )
        {
            this.is_sending = true;

            setTimeout( function(){
                cwc.Server.prototype.send_message({
                    recipient : 'display',
                    action    : 'move navigation',
                    arguments : action
                })

                cwc.AnalogPad.prototype.is_sending = false;
            } , ( delay || 200) )
        }

     };


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(AnalogPad, 'AnalogPad');

}( window.cwc, Hammer );




/*------------------------------------------------------
 * Viewport Scroll Controller
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
 • Add support for data attr nav dir - up, down, left, right
 • Add support for NO end last and first attr
 • Add support for Enter key for on select
 • Must show testing on Screen
 • Add commit
 -------------------------------------------------------
*/


!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ViewportScroll( extend )
    {
        cwc.registerPlugin(this, 'ViewportScroll');

        /* -- Search for pullbars -- */
        this.lookup_type_pullbars();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    ViewportScroll.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            vs     : 'data-cwc-viewportscroll-btn',
            action : 'data-cwc-action',

            pullbar        : 'data-cwc-viewportscroll-pullbar',
            pullbar_action : 'data-cwc-action',
        }

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.all_pullbars = [

    ];

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.pullbars_colishion = false;

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.pullbars_auto_scroll_timer = false;

    /*------------------------------------------------------
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    ViewportScroll.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'
    };

    /*------------------------------------------------------
    * @function - Lookup type pullbars
    * @info - panup pandown panleft panright panmove panend panstart
    * @return - true : false
    */
    ViewportScroll.prototype.lookup_type_pullbars = function( )
    {
        var all_pullbars_in_dom      = document.querySelectorAll('['+ this.taxonomy.data.pullbar +']');
        var all_pullbars_in_dom_leng = all_pullbars_in_dom.length;

        for( var a_id = 0; a_id < all_pullbars_in_dom_leng; a_id++ )
        {
            /* -- Get the pullbar and trigger -- */
            var pullbar = all_pullbars_in_dom[ a_id ];
            var trigger = pullbar.querySelector("span");

            /* -- Bind the group id to the trigger -- */
            trigger.g_id = a_id;

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( trigger );
                mc.add(new Hammer.Pan({
                    threshold: 0, pointers: 0
                }));

            mc.on("panstart panup pandown panend", function( ev ) {
                cwc.ViewportScroll.prototype.on_pullbars_trigger_pan(
                    ev, event.target.g_id
                );
            });

            /* -- Get instuctions -- */
            var instructions = JSON.parse(
                pullbar.getAttribute( this.taxonomy.data.pullbar )
            );

            /* -- Save the group -- */
            this.all_pullbars[ a_id ] = {
                pullbar          : pullbar,
                trigger          : trigger,
                instructions     : instructions
            };

        }

    };


    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    ViewportScroll.prototype.on_pullbars_trigger_pan = function( ev, g_id )
    {
        var pullbar         = this.all_pullbars[ g_id ].pullbar;
        var trigger         = ev.target;
        var instructions    = this.all_pullbars[ g_id ].instructions;

        var pullbar_style = getComputedStyle(pullbar);
        var trigger_style = getComputedStyle(trigger);

        /* -- Add on start -- */
        if( ev.type === 'panstart' )
        {
            pullbar.classList.add("active");
            return;
        }

        /* -- Remove all -- */
        else if( ev.type === 'panend' )
        {
            /* -- Clear out the timer -- */
            this.pullbar_trigger_reset( pullbar, trigger )
            return;
        }

        var pbh = parseInt(pullbar_style.height, 10),
            pbw = parseInt(pullbar_style.width , 10),
            trh = parseInt(trigger_style.height, 10),
            trw = parseInt(trigger_style.width , 10);

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        }

        /* -- threshold -- */
        var threshold = {
            y : {
                top :  (pbh / 2 ) - ( trh / 2 ) + delta.y  <= -( trh / 2 ),
                btm :  ( ( trh / 2 ) + delta.y ) >= ( (pbh / 2 ) + ( trh / 2 ) ),
            }
        }

        /* -- Get the ammount to be scrolled -- */
        var ammount = this.pullbar_get_ammount(
            instructions, this.hammer_dirs[ ev.direction ]
        );

        /* -- Scroll option to send to display -- */
        var scroll_option = {
            viewport_target : instructions.viewport_target,
            direction       : this.hammer_dirs[ ev.direction ],
            ammount         : ammount,
            type            : ev.type
        }

        /* -- Check to see no timer has been set -- */
        if( this.pullbars_colishion === null )
        {
            if( threshold.y.top || threshold.y.btm )
            {
                /* -- Trigger auto scroll  -- */
                this.set_auto_scroll(scroll_option, 20);

                /* -- Clear out the timer -- */
                pullbar.classList.add("auto");
            }

        }

        /* -- Check to see we are not on constratins -- */
        if( (! threshold.y.top) && (! threshold.y.btm) )
        {
            /* -- clear the out scroll if needed -- */
            this.clear_auto_scroll();

            /* -- Clear out the timer -- */
            pullbar.classList.remove("auto");

            /* -- Move the publlbar handle -- */
            this.pullbar_trigger_translate({
                trigger : trigger,
                delta_x : 0,
                delta_y : delta.y
            });

            /* -- Validate the sction -- */
            this.validate_action (scroll_option);

        }

    };


     ViewportScroll.prototype.pullbar_get_ammount = function( instructions, direction )
     {
        var ammount = instructions.ammount || 15;
        var axis    = instructions.axis    || false;

        switch ( direction )
        {
            case 'right' :
            case 'up'    :
            ammount = (axis !== 'inverted')? ammount : Math.abs(ammount) * -1;
            break;

            case 'left' :
            case 'down' :
            ammount = (axis !== 'inverted')? Math.abs(ammount) * -1 : ammount;
            break;
        }

        return ammount;
    }

     ViewportScroll.prototype.pullbar_trigger_reset = function( pullbar, trigger )
     {
        /* -- Clear out the timer -- */
        this.clear_auto_scroll();

        /* -- Move the publlbar handle to start -- */
        this.pullbar_trigger_translate({
            trigger : trigger,
            delta_x : 0,
            delta_y : 0
        });

        /* -- Clear out the timer -- */
        pullbar.classList.remove("active");

        /* -- Clear out the timer -- */
        pullbar.classList.remove("auto");
     }

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    ViewportScroll.prototype.pullbar_trigger_translate = function( prams )
     {
        /* -- Move the publlbar handle -- */
        window.requestAnimationFrame( function(){
            prams.trigger.style.transform = [
                'translate3d(' + prams.delta_x + 'px,' + prams.delta_y + 'px, 0)'
            ]
        });

    }


    /*------------------------------------------------------
    * @function - Set auto scroll
    * @info - Clear out the fimer and reset collishion
    * @prams - viewport_target
    * @prams - direction
    * @prams - type
    */
    ViewportScroll.prototype.set_auto_scroll = function( prams, time )
    {
        this.pullbars_colishion = true;

        this.pullbars_auto_scroll_timer = setInterval(function(){
            cwc.ViewportScroll.prototype.validate_action (
                prams
            );
        }, time);

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
     ViewportScroll.prototype.clear_auto_scroll = function()
     {
        if( this.pullbars_colishion !== null )
        {
            this.pullbars_colishion = null;
            clearInterval( this.pullbars_auto_scroll_timer );
        }

     }

     ViewportScroll.prototype.scroll_to = function( prams )
     {
        this.validate_action({
            viewport_target : prams.viewport_target,
            direction       : prams.direction,
            ammount         : prams.ammout || false,
            type            : 'scroll to'
        });
     }

     ViewportScroll.prototype.validate_action = function( args )
     {
        /* -- Validate action -- */
        switch( args.direction )
        {
            case 'up'     :
            case 'right'  :
            case 'down'   :
            case 'left'   :
            this.send_actions_to_first_screen( args );
            break;

        }

     }

     ViewportScroll.prototype.send_actions_to_first_screen = function( args )
     {
        console.log(
            args
        );

        cwc.Server.prototype.send_message({
            recipient : 'display',
            action    : 'scroll viewport',
            arguments : args
        });
     }


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ViewportScroll, 'ViewportScroll');

}( window.cwc );





