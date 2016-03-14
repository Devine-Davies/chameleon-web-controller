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
//@codekit-append "_ControllerMaster.js";
//@codekit-append "_DpadController.js";
//@codekit-append "_TouchPadController.js";
//@codekit-append "_AnalogController.js";
//@codekit-append "_PullbarController.js";

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

        /* -- get ready to accept hi message from server -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'hi',
            callback : function( client_id ) {
                cwc.Server.prototype.say_hi_back( client_id );
            }
        } );

        /* -- connect to the host via web sockets -- */
        cwc._server_connection = this.connect(
            options.host,
            options.port,
            options.type
        );

        /* -- set message evetns -- */
        if( cwc._server_connection )
        {
            this.set_connection_events();
        }

    };

    /*------------------------------------------------------
    * @object - Connection
    * @info   - The connection object to main server
    */
    Server.prototype.connection = null;

    /*------------------------------------------------------
    * @int  - Client id
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
                console.log('Server message is not properly fromatted.');
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
    function ControllerMaster( extend )
    {
        cwc.registerPlugin(this, 'ControllerMaster');
    };

    /*------------------------------------------------------
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    ControllerMaster.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'
    };

    /*------------------------------------------------------
    * @object - Last Posistion
    * @info - this will allow us to determan
    */
    ControllerMaster.prototype.last_delta_pos = {
        x : 0,
        y : 0
    };

    /*------------------------------------------------------
    * @function - Tag all with id
    * @info - Will update the tracking system for next items and groups
    */
    ControllerMaster.prototype.tag_all_with_id = function ( elm, c_id )
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
    ControllerMaster.prototype.fetch_instructions = function( elm )
    {
        var tax = 'data-cwc-instructions';

        /* -- Search for nav end inftructions-- */
        if( elm.hasAttribute( tax )  )
        {
            return JSON.parse(
                elm.getAttribute( tax )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info : angle 0 :  180 is converted 180-360
    * @info : angle 0 : -180 is converted 0-180
    */
    ControllerMaster.prototype.calculate_axis_as_cardinal_direction = function( angle )
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
    ControllerMaster.prototype.calculate_axis_as_coordinate = function( z )
    {
        var int = Math.round( (z / 100) * 10 ) / 10;
        return Number( ( z < 0 )? (int - 1) : (int + 1) );

    };

    /*------------------------------------------------------
    * @function - Get moving direction
    * x : ( in || out )
    * y : ( in || out )
    */
    ControllerMaster.prototype.get_moving_direction = function( delta )
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
    ControllerMaster.prototype.invoke_hook = function( hook, instructions, arg )
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
    cwc.plugin(ControllerMaster, 'ControllerMaster');

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
    function DPadController( extend )
    {
        cwc.registerPlugin(this, 'DPadController');

        this.controller_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    DPadController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=dpad',
            btn        : 'data-cwc-cbtn',
        }

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    DPadController.prototype.all_DPadControllers = [];

    DPadController.prototype.controller_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var controller = controllers[ c_id ];

            /* -- Find all item in group -- */
            var actions = this.controller_actions_lookup(
                controllers[ c_id ], c_id
            );

            this.all_DPadControllers[ c_id ] = {
                container     : controller,
                actions       : actions,
                instructions  : cwc.ControllerMaster.prototype.fetch_instructions( controller )
            };

        };

    }

   /*------------------------------------------------------
    * @function - Navitems lookup
    * @info - Find elms with data-(navitem) add the this to object
    * @return - true : false
    */
    DPadController.prototype.controller_actions_lookup = function( group, c_id )
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

            var mc = new Hammer.Manager( action );
                mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
                mc.add(new Hammer.Tap());

                mc.on("tap", function( ev ){
                     cwc.DPadController.prototype.button_invoked(
                        ev.target.c_id,
                        ev.target.a_id
                    );
                }).on("doubletap", function(){

                });

            actions.push( action )
        }

        return actions;

    };

    DPadController.prototype.button_invoked = function( c_id, a_id )
    {
        var action       = this.all_DPadControllers[ c_id ].actions[ a_id ];
        var instructions = this.all_DPadControllers[ c_id ].instructions;

        /* -- Check to see if action can be indertfyed -- */
        if(! action.hasAttribute( 'data-cwc-cbtn' ) )
            return;

        /* -- Validate action -- */
        switch( action.getAttribute( 'data-cwc-cbtn' ) )
        {
            case 'up'     :
            var info = {
                direction          : 'UP',
                cardinal_direction : 'N',
                angle              : 0,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'right'  :
            var info = {
                direction          : 'RIGHT',
                cardinal_direction : 'E',
                angle              : 90,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'down'   :
            var info = {
                direction          : 'DOWN',
                cardinal_direction : 'S',
                angle              : 180,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'left'   :
            var info = {
                direction          : 'LEFT',
                cardinal_direction : 'W',
                angle              : 270,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'enter'  :
            info = {
                direction : 'ENTER',
            }
            break;
        }

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'on-tap', instructions, info );
    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(DPadController, 'DPadController');

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
    function TouchPadController( extend )
    {
        cwc.registerPlugin(this, 'TouchPadController');

        this.lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller="touchpad"'
        }
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.all_TouchPadControllers = [];

    /*------------------------------------------------------
    * @object - Tracking
    * @info - Keep and drecord of all found nav elms
    */
    TouchPadController.prototype.tracking = null;

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var controller   = controllers[ c_id ];

            /* -- Add the id to all elements below -- */
            cwc.ControllerMaster.prototype.tag_all_with_id( controller, c_id );

            var instructions = cwc.ControllerMaster.prototype.fetch_instructions( controller );

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( controller , {
                recognizers: [ [Hammer.Swipe, {
                    direction : Hammer.DIRECTION_HORIZONTAL
                } ] ]
            } );

            /* -- Add the touch pad -- */
            this.all_TouchPadControllers.push({
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
                    cwc.TouchPadController.prototype.on_move( ev );
                });
            }

            else if( this.get_movment_type( c_id ) == 'pan' )
            {
                mc.add(new Hammer.Pan({
                    domEvents: true, threshold: 4, pointers: 0
                } ) );

                mc.on("panmove panstart panend", function( ev ){
                    cwc.TouchPadController.prototype.on_move( ev );
                });
            }
        };

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    */
    TouchPadController.prototype.get_movment_type = function( c_id )
    {
        /* -- get the insrtuctions for the current analog -- */
        var instructions = this.all_TouchPadControllers[ c_id ].instructions;

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
    TouchPadController.prototype.on_move = function( ev )
    {
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_TouchPadControllers[ c_id ].pad;
        var instructions = this.all_TouchPadControllers[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.ControllerMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( ev.deltaX ),
            y : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( ev.deltaY )
        };

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.ControllerMaster.prototype.get_moving_direction(
            delta
        );

        cwc.ControllerMaster.prototype.invoke_hook

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'on-touch', instructions, {
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
    TouchPadController.prototype.validate_action = function( type )
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
    TouchPadController.prototype.send_actions_to_first_screen = function( action )
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
    cwc.plugin(TouchPadController, 'TouchPadController');

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
    function AnalogController( extend )
    {
        cwc.registerPlugin(this, 'AnalogController');

        this.pad_lookup();

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    AnalogController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=analog'
        }
    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    AnalogController.prototype.all_AnalogControllers = [];

    /*------------------------------------------------------
    * @object - Returned data
    * @info - All of the infromation gatherd during movement
    * @info -
    */
    AnalogController.prototype.returned_data = {};

    /*------------------------------------------------------
    * @object - Tracking
    * @info - Keep and drecord of all found nav elms
    */
    AnalogController.prototype.tracking = null;

    /*------------------------------------------------------
    * @object - Request id
    * @info - animation request id
    */
    AnalogController.prototype.request_id = 0;

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    AnalogController.prototype.pad_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var analog  = controllers[ c_id ];
            var trigger = analog.querySelector("span");

            /* -- Add the id to all elements below -- */
            cwc.ControllerMaster.prototype.tag_all_with_id( analog, c_id );

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( analog );
                mc.add(new Hammer.Pan({
                    domEvents: false, threshold: 4, pointers: 0
                } ) );

            mc.on("pan panstart panend", function( ev ) {
                cwc.AnalogController.prototype.on_analog_pan( ev );
            });

            /* -- Save the group -- */
            this.all_AnalogControllers[ c_id ] = {
                analog        : analog,
                trigger       : trigger,
                instructions  : cwc.ControllerMaster.prototype.fetch_instructions( analog )
            };

        }

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    AnalogController.prototype.on_analog_pan = function( ev )
    {
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_AnalogControllers[ c_id ].analog;
        var trigger      = this.all_AnalogControllers[ c_id ].trigger;
        var instructions = this.all_AnalogControllers[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( delta.x ),
            y : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( delta.y )
        };

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.ControllerMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.ControllerMaster.prototype.get_moving_direction(
            delta
        );

        /* -- Store all the infromation caculaed to return back -- */
        this.returned_data = {
            cardinal_direction : cardinal_direction,
            direction          : cwc.ControllerMaster.prototype.hammer_dirs[ ev.direction ],
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
            cwc.ControllerMaster.prototype.invoke_hook( 'pan', instructions, this.returned_data );
        }

    };

    /*------------------------------------------------------
    * @function - On pan start
    */
    AnalogController.prototype.on_pan_start = function( c_id, instructions, analog, trigger )
    {
        /* -- Track the onbject being used -- */
        this.tracking = c_id;

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'panstart', instructions, null);

        if( this.get_movment_type() == 'tick' )
        {
            this.on_tick();
        }

        analog.classList.add("active");

    };

    /*------------------------------------------------------
    * @function - On pan end
    */
    AnalogController.prototype.on_pan_end = function( c_id, instructions, analog, trigger )
    {
        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'panend', instructions, null);

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
    AnalogController.prototype.get_movment_type = function(  )
    {
        /* -- get the insrtuctions for the current analog -- */
        var instructions = this.all_AnalogControllers[ this.tracking ].instructions;

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
    AnalogController.prototype.on_tick = function( order )
    {
        /* -- destroy the tick  -- */
        if( order === 'destroy' )
        {
            window.cancelAnimationFrame(
                cwc.AnalogController.prototype.request_id
            );
        }

        /* -- Start the tick process -- */
        else
        {
            /* -- get the insrtuctions for the current analog -- */
            var instructions = cwc.AnalogController.prototype.all_AnalogControllers[
                cwc.AnalogController.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook( 'pan', instructions,
                cwc.AnalogController.prototype.returned_data
            );

            /* -- Build the loop -- */
            cwc.AnalogController.prototype.request_id = window.requestAnimationFrame(
                cwc.AnalogController.prototype.on_tick
            );
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogController.prototype.trigger_translate = function( prams )
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
    cwc.plugin(AnalogController, 'AnalogController');

}( window.cwc, Hammer );

/*------------------------------------------------------
 * Viewport Scroll Controller
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
 • Add support for data attr nav dir - up, down, left, right
 -------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function PullbarController( extend )
    {
        cwc.registerPlugin(this, 'PullbarController');

        /* -- Search for pullbars -- */
        this.pullbars_lookup();
    };

    /*------------------------------------------------------
    * @object - Taxonomy
    * @info   - all the data attr of pullbar info
    */
    PullbarController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            pullbar        : 'data-cwc-controller=pullbar',
        }

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info   - Keep and record of all found pullbar elms
    */
    PullbarController.prototype.all_pullbars = [
    ];

    /*------------------------------------------------------
    * @object - Returned data
    * @info - All of the infromation gatherd during movement
    * @info -
    */
    PullbarController.prototype.returned_data = {
    };

    /*------------------------------------------------------
    * @object - Request id
    * @info   - reuest animation frame id
    */
    PullbarController.prototype.request_id = 0;

    /*------------------------------------------------------
    * @object - Tracking
    * @info   - All us to track the current item in use
    */
    PullbarController.prototype.tracking = null;

    /*------------------------------------------------------
    * @function - Pullbar lookup
    * @info     - Finds all pullbars within the dom
    */
    PullbarController.prototype.pullbars_lookup = function( )
    {
        var all_pullbars_in_dom      = document.querySelectorAll('['+ this.taxonomy.data.pullbar +']');
        var all_pullbars_in_dom_leng = all_pullbars_in_dom.length;

        for( var a_id = 0; a_id < all_pullbars_in_dom_leng; a_id++ )
        {
            /* -- Get the pullbar and trigger -- */
            var pullbar = all_pullbars_in_dom[ a_id ];
            var trigger = pullbar.querySelector("span");

            /* -- Add the id to all elements below -- */
            cwc.ControllerMaster.prototype.tag_all_with_id( pullbar, a_id );

            /* -- Bind the group id to the trigger -- */
            trigger.g_id = a_id;

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( trigger );
                mc.add(new Hammer.Pan({
                    threshold: 0, pointers: 0
                }));

            mc.on("panstart panup pandown panend", function( ev ) {
                cwc.PullbarController.prototype.on_pullbars_trigger_pan(
                    ev
                );
            });

            /* -- Save the group -- */
            this.all_pullbars[ a_id ] = {
                pullbar          : pullbar,
                trigger          : trigger,
                instructions     : cwc.ControllerMaster.prototype.fetch_instructions( pullbar )
            };

        }

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info     - Panning options an collishion
    */
    PullbarController.prototype.on_pullbars_trigger_pan = function( ev )
    {
        /* -- Set the components and options -- */
        var g_id            = ( event.target.g_id == undefined )? this.tracking : event.target.g_id;
        var pullbar         = this.all_pullbars[ g_id ].pullbar;
        var trigger         = this.all_pullbars[ g_id ].trigger;
        var instructions    = this.all_pullbars[ g_id ].instructions;

        /* -- Get the style infromation about the componants -- */
        var style = {
            pbh : pullbar.clientHeight,
            pbw : pullbar.clientWidth,

            trh : trigger.clientHeight,
            trw : trigger.clientWidth,
        };

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- threshold -- */
        var threshold = {
            y : {
                top :  (style.pbh / 2 ) - ( style.trh / 2 ) + delta.y  <= -( style.trh / 2 ),
                btm :  (style.pbh / 2 ) + ( style.trh / 2 ) <=  delta.y + (style.trh / 2 ),
            }
        }

        /* -- Collishion -- */
        if( threshold.y.top || threshold.y.btm )
        {
            /* -- Set the data to be returned -- */
            this.returned_data = this.get_feedback_data(
                ev
            );

            /* -- Check if we in enter frame -- */
            if( this.request_id == 0 )
            {
                /* -- Start the tick process -- */
                this.on_tick();

                /* -- Clear out the timer -- */
                pullbar.classList.add("auto");
            }

        }

        /* -- no collishion -- */
        else if( (! threshold.y.top) && (! threshold.y.btm) )
        {
            /* -- Start the tick process -- */
            if( this.request_id > 0 )
            {
                this.on_tick('destroy');
            }

            /* -- clear the timer -- */
            pullbar.classList.remove("auto");

            /* -- move the publlbar handle -- */
            this.pullbar_trigger_translate({
                trigger : trigger,
                delta_x : 0,
                delta_y : delta.y
            });

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook( 'on-pull', instructions,
                this.get_feedback_data( ev )
            );

        }

        this.start_and_end_toggle( ev.type, g_id, pullbar, trigger )

    };


    /*------------------------------------------------------
    * @function - Get feedback data
    * @info     - builds the return data object to feed back to user
    */
    PullbarController.prototype.get_feedback_data = function( ev )
    {
        return {
            /* -- cardinal the users is moving in -- */
            cardinal_direction : cwc.ControllerMaster.prototype.calculate_axis_as_cardinal_direction(
                ev.angle
            ),

            /* -- coordinates of x and y -- */
            coordinate : {
                x : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( ev.deltaX ),
                y : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( ev.deltaY )
            },

            /* -- check to see if we are moving to the center or to the endge (in : out) -- */
            in_out : cwc.ControllerMaster.prototype.get_moving_direction({
                x : ev.deltaX,
                y : ev.deltaY,
            } )
        };

    };

    /*------------------------------------------------------
    * @function - Start and end toggle
    * @info     - Called to check if the pan process has started or ended
    */
    PullbarController.prototype.start_and_end_toggle = function( type, g_id, pullbar, trigger )
    {
        /* -- Add on start -- */
        if( type === 'panstart' )
        {
            this.tracking = g_id;
            pullbar.classList.add("active");
        }

        /* -- Remove all -- */
        else if( type === 'panend' )
        {
            /* -- Start the tick process -- */
            this.on_tick('destroy');

            /* -- Move the publlbar handle to start -- */
            this.pullbar_trigger_translate({
                trigger : trigger,
                delta_x : 0,
                delta_y : 0
            });

            /* -- Clear out the timer -- */
            pullbar.classList.remove("auto");

            /* -- Clear out the timer -- */
            pullbar.classList.remove("active");
        }

    };

    /*------------------------------------------------------
    * @function - Pullbar trigger translate
    * @info     - Clear out the fimer and reset collishion
    */
    PullbarController.prototype.pullbar_trigger_translate = function( prams )
     {
        /* -- Move the publlbar handle -- */
        window.requestAnimationFrame( function(){
            prams.trigger.style.transform = [
                'translate3d(' + prams.delta_x + 'px,' + prams.delta_y + 'px, 0)'
            ]
        });

    };

    /*------------------------------------------------------
    * @function - On tick
    * @info     - When pull bar has is pulsating
    */
    PullbarController.prototype.on_tick = function( order )
    {
        /* -- destroy the tick  -- */
        if( order == 'destroy' )
        {
            window.cancelAnimationFrame(
                cwc.PullbarController.prototype.request_id
            );

            cwc.PullbarController.prototype.request_id = 0;
        }

        /* -- Start the tick process -- */
        else
        {
            /* -- get the insrtuctions for the current analog -- */
            var instructions = cwc.PullbarController.prototype.all_pullbars[
                cwc.PullbarController.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook( 'on-pull', instructions,
                cwc.PullbarController.prototype.returned_data
            );

            /* -- Build the loop -- */
            cwc.PullbarController.prototype.request_id = requestAnimationFrame(
                cwc.PullbarController.prototype.on_tick
            );
        }

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(PullbarController, 'PullbarController');

}( window.cwc );

