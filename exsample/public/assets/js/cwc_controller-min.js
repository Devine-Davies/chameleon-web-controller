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
//@codekit-append "_PadMaster.js";
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
    CustomMethod.prototype.custom_methods = [];

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    CustomMethod.prototype.create_method = function( prams )
    {
        this.custom_methods.push({
            'name'     : prams.name,
            'method'   : prams.method
        });

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    CustomMethod.prototype.call_method = function( prams )
    {
        var cm_count = this.custom_methods.length;

        for( var i = 0; i < cm_count; i++ )
        {
            var cm = this.custom_methods[ i ];

            if( cm.name === prams.method )
            {
                cm.method(
                    prams.arguments
                );

                return;
            }
        }

        console.log('Methord has not been created : CM');
    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(CustomMethod, 'CustomMethod');

}( window.cwc );

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
    function PadMaster( extend )
    {
        cwc.registerPlugin(this, 'PadMaster');
    };

    /*------------------------------------------------------
    * @object - Last Posistion
    * @info - this will allow us to determan
    */
    PadMaster.prototype.last_delta_pos = {
        x : 0,
        y : 0
    };

    /*------------------------------------------------------
    * @function - Tag all with id
    * @info - Will update the tracking system for next items and groups
    */
    PadMaster.prototype.tag_all_with_id = function ( elm, c_id )
    {
        elm.dataset.cid = c_id;

        var child_elms = elm.getElementsByTagName("*");
        var child_elms_count = child_elms.length;

        for( var i = 0; i < child_elms_count; i ++ )
        {
            var child_elm = child_elms[ i ];
                child_elm.dataset.cid = c_id;
        }
    }

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info - Will update the tracking system for next items and groups
    */
    PadMaster.prototype.fetch_instructions = function( analog )
    {
        var tax = 'data-cwc-pad-instructions';

        /* -- Search for nav end inftructions-- */
        if( analog.hasAttribute( tax )  )
        {
            return JSON.parse(
                analog.getAttribute( tax )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info : angle 0 :  180 is converted 180-360
    * @info : angle 0 : -180 is converted 0-180
    */
    PadMaster.prototype.calculate_axis_as_cardinal_direction = function( angle )
    {
        /* -- Negative number -- */
        if( angle < 0 ) { angle = ( 180 - Math.abs( angle ) ); }

        /* -- Posative number -- */
        else { angle = (180 + angle); }

        var directions = ["W", "NW", "N", "NE", "E", "SE", "S", "SW", "W"];
        var d_count    = 360 / (directions.length - 1);

        var index      = Math.floor( ((angle -22.5 ) % 360) / d_count );
        return directions[ index + 1 ];

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - @http://goo.gl/bQdzfN
    */
    PadMaster.prototype.calculate_axis_as_coordinate = function( z )
    {
        var int = Math.round( (z / 100) * 10 ) / 10;
        return Number( ( z < 0 )? (int - 1) : (int + 1) );

    };

    /*------------------------------------------------------
    * @function - Get moving direction
    * x : ( in || out )
    * y : ( in || out )
    */
    PadMaster.prototype.get_moving_direction = function( delta )
    {
        /* -- Find out what direction we are moving in -- */
        function check( z, z1 ) {
            if( ( Math.abs( z ) > Math.abs( z1 ) ) )       { return 'in';     }
            else if( ( Math.abs( z ) == Math.abs( z1 ) ) ) { return 'static'; }
            else                                           { return 'out';    }
        }

        /* -- Get our direction -- */
        var dir = {
            x : check(  Math.abs( this.last_delta_pos.x ), Math.abs( delta.x ) ),
            y : check(  Math.abs( this.last_delta_pos.y ), Math.abs( delta.y ) )
        }

        /* -- Record the movment -- */
        this.last_delta_pos = delta;

        /* -- Return the values -- */
        return dir;

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    PadMaster.prototype.invoke_hook = function( hook, instructions, arg )
    {
        if( instructions.hasOwnProperty( hook ) )
        {
            cwc.CustomMethod.prototype.call_method(  {
                method    : instructions[ hook ],
                arguments : arg
            } );
        }

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(PadMaster, 'PadMaster');

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
    function DPad( extend )
    {
        cwc.registerPlugin(this, 'DPad');

        this.controller_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    DPad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=dpad',
            btn        : 'data-cwc-cbtn',
        }

    };

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    DPad.prototype.events = {
            /* -- D & right -- */
            68 : function(){  },
            39 : function(){  },

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    DPad.prototype.all_dpads = [];

    DPad.prototype.controller_lookup = function()
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
    DPad.prototype.controller_actions_lookup = function( group, c_id )
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
            //      cwc.DPad.prototype.button_invoked(
            //         this.c_id,
            //         this.a_id
            //     )
            // };

            var hammertime = new Hammer(action, {});
            hammertime.on('tap', function(ev) {
                 cwc.DPad.prototype.button_invoked(
                    ev.target.c_id,
                    ev.target.a_id
                )
            });

            actions.push( action )
        }

        return actions;

    };

     DPad.prototype.button_invoked = function( c_id, a_id )
     {
        var action = this.all_dpads[ c_id ].actions[ a_id ];

        this.validate_action (
            action.getAttribute( this.taxonomy.data.btn )
        );

     }

     DPad.prototype.validate_action = function( type )
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

     DPad.prototype.send_actions_to_first_screen = function( action )
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
    cwc.plugin(DPad, 'DPad');

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
    function TouchPad( extend )
    {
        cwc.registerPlugin(this, 'TouchPad');

        this.touchpad_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=touchpad'
        }
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPad.prototype.all_touchpads = [];

    /*------------------------------------------------------
    * @object - Tracking
    * @info - Keep and drecord of all found nav elms
    */
    TouchPad.prototype.tracking = null;

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPad.prototype.touchpad_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var controller   = controllers[ c_id ];

            /* -- Add the id to all elements below -- */
            cwc.PadMaster.prototype.tag_all_with_id( controller, c_id );

            var instructions = cwc.PadMaster.prototype.fetch_instructions( controller );

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( controller , {
                recognizers: [ [Hammer.Swipe, {
                    direction : Hammer.DIRECTION_HORIZONTAL
                } ] ]
            } );

            /* -- Add the touch pad -- */
            this.all_touchpads.push({
                pad          : controller,
                instructions : instructions
            });

            /* -- If the movment has been set to pull, then call the users function -- */
            if( this.get_movment_type( c_id ) == 'swipe' )
            {
                mc.add( new Hammer.Swipe({
                    threshold: 0
                }) );

                mc.on("swipe", function( ev ) {
                    cwc.TouchPad.prototype.on_move( ev );
                });
            }

            else if( this.get_movment_type( c_id ) == 'pan' )
            {
                mc.add(new Hammer.Pan({
                    domEvents: true, threshold: 4, pointers: 0
                } ) );

                mc.on("panmove panstart panend", function( ev ){
                    cwc.TouchPad.prototype.on_move( ev );
                });
            }
        };

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    */
    TouchPad.prototype.get_movment_type = function( c_id )
    {
        /* -- get the insrtuctions for the current analog -- */
        var instructions = this.all_touchpads[ c_id ].instructions;

        /* -- Check the type of movment -- */
        if( instructions.hasOwnProperty( 'movement-type' ) )
        {
            if( instructions['movement-type'] == 'pan' )
            {
                return instructions['movement-type'];
            }
            else
            {
                return 'swipe';
            }
        }
        else
        {
            return 'swipe';
        }

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPad.prototype.on_move = function( ev )
    {
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_touchpads[ c_id ].pad;
        var instructions = this.all_touchpads[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.PadMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.PadMaster.prototype.calculate_axis_as_coordinate( ev.deltaX ),
            y : cwc.PadMaster.prototype.calculate_axis_as_coordinate( ev.deltaY )
        };

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.PadMaster.prototype.get_moving_direction(
            delta
        );

        cwc.PadMaster.prototype.invoke_hook

        /* -- check if hook has been applied -- */
        cwc.PadMaster.prototype.invoke_hook( 'on-touch', instructions, {
            cardinal_direction : cardinal_direction,
            coordinate         : coordinate,
            in_out             : in_out
        } );

        this.tracking = c_id;

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPad.prototype.validate_action = function( type )
    {
        var dirs = {
           8   : 'up',
           4   : 'right',
           16  : 'down',
           2   : 'left',
           500 : 'enter'
        };

        // -- Send the action to the main screen --
        this.send_actions_to_first_screen(
            dirs[ type ]
        );

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPad.prototype.send_actions_to_first_screen = function( action )
    {
        console.log( action );

        cwc.Server.prototype.send_message({
            recipient : 'display',
            action    : 'move navigation',
            arguments : action
        });

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(TouchPad, 'TouchPad');

}( window.cwc, Hammer );

/*------------------------------------------------------
 Analog Pad
 ------------------------------------------------------
 To-Do •
 ------------------------------------------------------
 •
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
    * @object - Returned data
    * @info - All of the infromation gatherd during movement
    * @info -
    */
    AnalogPad.prototype.returned_data = {};

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
    * @object - Tracking
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.tracking = null;

    /*------------------------------------------------------
    * @object - Request id
    * @info - animation request id
    */
    AnalogPad.prototype.request_id = 0;

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
            var analog  = controllers[ c_id ];
            var trigger = analog.querySelector("span");

            /* -- Add the id to all elements below -- */
            cwc.PadMaster.prototype.tag_all_with_id( analog, c_id );

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( analog );
                mc.add(new Hammer.Pan({
                    domEvents: false, threshold: 4, pointers: 0
                } ) );

            mc.on("pan panstart panend", function( ev ) {
                cwc.AnalogPad.prototype.on_analog_pan( ev );
            });

            /* -- Save the group -- */
            this.all_analogpads[ c_id ] = {
                analog        : analog,
                trigger       : trigger,
                instructions  : cwc.PadMaster.prototype.fetch_instructions( analog )
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
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_analogpads[ c_id ].analog;
        var trigger      = this.all_analogpads[ c_id ].trigger;
        var instructions = this.all_analogpads[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.PadMaster.prototype.calculate_axis_as_coordinate( delta.x ),
            y : cwc.PadMaster.prototype.calculate_axis_as_coordinate( delta.y )
        };

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.PadMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.PadMaster.prototype.get_moving_direction(
            delta
        );

        /* -- Store all the infromation caculaed to return back -- */
        this.returned_data = {
            cardinal_direction : cardinal_direction,
            direction          : this.hammer_dirs[ ev.direction ],
            in_out             : in_out,
            coordinate         : coordinate,
            delta              : delta,
            angle              : ev.angle,
        };

        /* -- analog container circal -- */
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
        var dx  = (analog_c.x + analog_c.radius) - (trigger_c.x + trigger_c.radius) - trigger_c.s_x;
        var dy  = (analog_c.y + analog_c.radius) - (trigger_c.y + trigger_c.radius) - trigger_c.s_y;
        var dis = Math.sqrt(dx * dx + dy * dy) + ( trigger_c.radius );

        /* -- Collishion happerning  --*/
        if (dis > analog_c.radius + trigger_c.radius)
        {
            /* --- Collision detection : for fix the triiger againsied the of the analog area -- */
            var angle = ev.angle;
            var x = analog_c.x + analog_c.radius * Math.cos( angle * (Math.PI / 180) );
            var y = analog_c.y + analog_c.radius * Math.sin( angle * (Math.PI / 180) );

            /* -- add auto class -- */
            analog.classList.add("auto");

            /* -- Move the tigger handle -- */
            this.trigger_translate({
                trigger : trigger,
                delta_x : x,
                delta_y : y
            });

        }
        /* -- Move as normal --*/
        else
        {
            /* -- Remove class auto -- */
            analog.classList.remove("auto");

            /* -- Move the tigger handle -- */
            this.trigger_translate({
                trigger : trigger,
                delta_x : delta.x,
                delta_y : delta.y
            });

        }

        /* -- Remove all -- */
        if( ev.type === 'panstart' )
        {
            /* -- Pan has started trigger -- */
            this.on_pan_start(
                c_id,
                instructions,
                analog,
                trigger
            );
        }
        /* -- Remove all -- */
        else if( ev.type === 'panend' )
        {
            /* -- Pan has started trigger -- */
            this.on_pan_end(
                c_id,
                instructions,
                analog,
                trigger
            );
        }
        /* -- If the movment has been set to pull, then call the users function -- */
        else if( this.get_movment_type() == 'pull' )
        {
            /* -- check if hook has been applied -- */
            cwc.PadMaster.prototype.invoke_hook( 'pan', instructions, this.returned_data );
        }

    };

    /*------------------------------------------------------
    * @function - On pan start
    */
    AnalogPad.prototype.on_pan_start = function( c_id, instructions, analog, trigger )
    {
        /* -- Track the onbject being used -- */
        this.tracking = c_id;

        /* -- check if hook has been applied -- */
        cwc.PadMaster.prototype.invoke_hook( 'panstart', instructions, null);

        if( this.get_movment_type() == 'tick' )
        {
            this.on_tick();
        }

        analog.classList.add("active");

    };

    /*------------------------------------------------------
    * @function - On pan end
    */
    AnalogPad.prototype.on_pan_end = function( c_id, instructions, analog, trigger )
    {
        /* -- check if hook has been applied -- */
        cwc.PadMaster.prototype.invoke_hook( 'panend', instructions, null);

        /* -- Remove any if nessary -- */
        analog.classList.remove("active");
        analog.classList.remove("auto");

        /* -- Move the publlbar handle to start -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : 0,
            delta_y : 0
        });

        /* -- Stop the tick if it has been set -- */
        if( this.get_movment_type() == 'tick' )
        {
            this.on_tick('destroy');
        }

        /* -- Track the onbject being used -- */
        this.tracking = null;

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - @http://goo.gl/bQdzfN
    */
    AnalogPad.prototype.get_movment_type = function(  )
    {
        /* -- get the insrtuctions for the current analog -- */
        var instructions = this.all_analogpads[ this.tracking ].instructions;

        /* -- Check the type of movment -- */
        if( instructions.hasOwnProperty( 'movement-type' ) )
        {
            if( instructions['movement-type'] == 'tick' )
            {
                return instructions['movement-type'];
            }
            else
            {
                return 'pull';
            }
        }
        else
        {
            return 'pull';
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - @http://goo.gl/bQdzfN
    */
    AnalogPad.prototype.on_tick = function( order )
    {
        /* -- destroy the tick  -- */
        if( order === 'destroy' )
        {
            window.cancelAnimationFrame( this.request_id );
        }

        /* -- Start the tick process -- */
        else
        {
            /* -- get the insrtuctions for the current analog -- */
            var instructions = cwc.AnalogPad.prototype.all_analogpads[
                cwc.AnalogPad.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.PadMaster.prototype.invoke_hook( 'pan', instructions,
                cwc.AnalogPad.prototype.returned_data
            );

            /* -- Build the loop -- */
            cwc.AnalogPad.prototype.request_id = window.requestAnimationFrame(
                cwc.AnalogPad.prototype.on_tick
            );
        }

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
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.tracking = null;

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

            /* -- Add the id to all elements below -- */
            cwc.PadMaster.prototype.tag_all_with_id( pullbar, a_id );

            /* -- Bind the group id to the trigger -- */
            trigger.g_id = a_id;

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( trigger );
                mc.add(new Hammer.Pan({
                    threshold: 0, pointers: 0
                }));

            mc.on("panstart panup pandown panend", function( ev ) {
                cwc.ViewportScroll.prototype.on_pullbars_trigger_pan(
                    ev
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
    ViewportScroll.prototype.on_pullbars_trigger_pan = function( ev )
    {
        /* -- Get the pullbar id from the elm attr -- */
        var g_id = ( event.target.g_id == undefined )? this.tracking : event.target.g_id;

        var pullbar         = this.all_pullbars[ g_id ].pullbar;
        var trigger         = this.all_pullbars[ g_id ].trigger;
        var instructions    = this.all_pullbars[ g_id ].instructions;

        var pullbar_style = getComputedStyle(pullbar);
        var trigger_style = getComputedStyle(trigger);

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- Add on start -- */
        if( ev.type === 'panstart' )
        {
            this.tracking = g_id;
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

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.PadMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.PadMaster.prototype.calculate_axis_as_coordinate( ev.deltaX ),
            y : cwc.PadMaster.prototype.calculate_axis_as_coordinate( ev.deltaY )
        };

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.PadMaster.prototype.get_moving_direction(
            delta
        );

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
            /* -- clear out the scroll if needed -- */
            this.clear_auto_scroll();

            /* -- clear the timer -- */
            pullbar.classList.remove("auto");

            /* -- move the publlbar handle -- */
            this.pullbar_trigger_translate({
                trigger : trigger,
                delta_x : 0,
                delta_y : delta.y
            });

            /* -- Validate the sction -- */
            this.validate_action (scroll_option);

        }

        /* -- check if hook has been applied -- */
        cwc.PadMaster.prototype.invoke_hook( 'on-touch', instructions, {
            cardinal_direction : cardinal_direction,
            coordinate         : coordinate,
            in_out             : in_out
        } );

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
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

    };

    /*------------------------------------------------------
    * @function - Pullbar Trigger Reset
    * @info - Panning opctions an constraints
    * @return - true : false
    */
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

    };

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

    };

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

     };

     ViewportScroll.prototype.scroll_to = function( prams )
     {
        this.validate_action({
            viewport_target : prams.viewport_target,
            direction       : prams.direction,
            ammount         : prams.ammout || false,
            type            : 'scroll to'
        });

     };

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

     };

     ViewportScroll.prototype.send_actions_to_first_screen = function( args )
     {
        cwc.Server.prototype.send_message({
            recipient : 'display',
            action    : 'scroll viewport',
            arguments : args
        });

     };


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ViewportScroll, 'ViewportScroll');

}( window.cwc );





