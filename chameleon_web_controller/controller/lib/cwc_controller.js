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

        console.log( data );

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

        console.log( data );

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

            var hammertime = new Hammer(controllers[ c_id ], {});
            hammertime.on('swipe', function(ev) {
                console.log( ev );
            });

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
                SwipePad.prototype.validate_action( 500 );
            });

            /* -- Add horazontal -- */
            hammertime_h.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
            });

            /* -- Add vertical -- */
            hammertime_v.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
            hammertime_v.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
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

        console.log( data );

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

        console.log( data );

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

            var hammertime = new Hammer(controllers[ c_id ], {});
            hammertime.on('swipe', function(ev) {
                console.log( ev );
            });

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
                SwipePad.prototype.validate_action( 500 );
            });

            /* -- Add horazontal -- */
            hammertime_h.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
            });

            /* -- Add vertical -- */
            hammertime_v.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
            hammertime_v.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
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

        console.log( data );

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

        console.log( data );

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

            var hammertime = new Hammer(controllers[ c_id ], {});
            hammertime.on('swipe', function(ev) {
                console.log( ev );
            });

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
                SwipePad.prototype.validate_action( 500 );
            });

            /* -- Add horazontal -- */
            hammertime_h.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
            });

            /* -- Add vertical -- */
            hammertime_v.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
            hammertime_v.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
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

