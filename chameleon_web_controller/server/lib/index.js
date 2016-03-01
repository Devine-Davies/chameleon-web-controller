
var _ = require("underscore");
//console.log( _.uniq([1, 2, 1, 4, 1, 3]) )

/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

/* ------------------------------
*  Coding standerds !
*  ------------------------------
*  _ = private vars & functons
*/
!function() {
"use strict";

    var cwc = {

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
    module.exports.cwc = cwc;

}( );

/*------------------------------------------------------
* -- Centralised --
*/
//@codekit-append "../../centralised/_functions.js";

/*------------------------------------------------------
* -- Server --
*/
//@codekit-append "_server.js"
//@codekit-append "_ServerMethod"
//@codekit-append "_ServerMessages"


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


document.body.addEventListener('touchmove',function(e){
  e.preventDefault();
});

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function Server( extend )
    {
        cwc.registerPlugin(this, 'Server');

        this.server_info = extend;

        this.start_connection( );

    };

    /*------------------------------------------------------
    * @object - The server were connected to
    */
    Server.prototype.server_info = null;

    /*------------------------------------------------------
    * @Array - Connected clients
    * @info - Save all the connected clients here
    */
    Server.prototype.connected_clients = [
    ];

    /*------------------------------------------------------
    * @function - Start connection
    * @info - Starts the server
    */
    Server.prototype.start_connection = function()
    {
        switch ( this.server_info.type )
        {
            case 'ws' :
            this.websocket_server_handler(
            );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Set extended options
    * @info - Combines the global extend object with this options object
    * allowing further extended options
    */
    Server.prototype.websocket_server_handler = function( )
    {
        this.server_info.server.on("connection", function( ws )
        {
            var client_pos = Server.prototype.connected_clients.length;

            /* -- Client has connected -- */
            cwc.Server.prototype.save_client(
                ws
            );

            /* -- Client has disconnected -- */
            ws.close = function ( evt )
            {
                cwc.Server.prototype.drop_client(
                    client_pos
                );
            };

            /* -- Server message -- */
            ws.onmessage = function ( evt )
            {
                cwc.Server.prototype.process_request(
                    JSON.parse( evt.data )
                );
            };

        });

    };

    /*------------------------------------------------------
    * @function - Drop clinet
    * @info - Send clinet pos to know witch one to drop
    */
    Server.prototype.drop_client = function( client_pos )
    {
        var array = this.connected_clients;

        /* -- Enpy the value : but keep the pos for use of id -- */
        delete array[ client_pos ];

    };

    /*------------------------------------------------------
    * @function - Save client
    * @info - Store the clinet in the (connected_clients) array,
    * also send a message to the clinet asking for it's type ( Display/Controller )
    */
    Server.prototype.save_client = function ( connection )
    {
        var clinet_id = this.connected_clients.length;

        this.connected_clients.push({
            'id'         : clinet_id,
            'type'       : null,
            'connection' : connection
        });

        /* -- Check to see if all have screen types -- */
        connection.send( this.format_msg({
            recipient    : 'all',
            sender       : 'server',
            action       : 'hi',
            arguments    : clinet_id,
        } ) );

    };

    /*------------------------------------------------------
    * @function - Set client type
    * @info - When the client say hi back with there type
    */
    Server.prototype.set_client_type = function( args )
    {
        this.connected_clients[ args.client_id ].type = args.sender;

        // -- Send message back stating that they have connected --
        this.process_request({
            recipient : args.sender, // display || controller
            sender    : 'server',
            action    : 'display_set',
            arguments : '',
        });

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    Server.prototype.process_request = function( message )
    {
        console.log('----------------');
        console.log( message );
        console.log('----------------');

        /* -- Whom the message shall be sent to -- */
        switch( message.recipient )
        {
            case  'server' :
                this.server_message( message );
            break;

            case 'display' :
                this.send_message_to_display( message );
            break;

            case 'controller' :
                this.send_message_controllers( message );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Server message
    * @info - Message is for the server
    */
    Server.prototype.server_message = function( message )
    {
        cwc.ServerMethod.prototype.call_method(
            message
        );

    };

    /*------------------------------------------------------
    * @function - Send message to display
    * @info - Sending message to all displays
    */
    Server.prototype.send_message_to_display = function( message )
    {
        /* -- Will return an array -- */
        var display_client = this.get_client('display')

        if( display_client != null )
        {
            display_client[0].connection.send( this.format_msg(
                 message
            ));
        }

    };

    /*------------------------------------------------------
    * @function - Send message controllers
    * @info - Sending message to all controllers
    */
    Server.prototype.send_message_controllers = function( message )
    {
        /* -- Will return an array -- */
        var controllers_client = this.get_client('controller')

        var message = this.format_msg( message );

        if( controllers_client != null )
        {
            for( var i = 0; i < controllers_client.length; i++)
            {
                controllers_client[ i ].connection.send(
                    message
                );
            }
        }

    };

    /*------------------------------------------------------
    * @function - Get client
    * @info     - Give a client_type
    * @return   - All found clients
    */
    Server.prototype.get_client = function( client_type )
    {
        var c_clients     = this.connected_clients;
        var c_leng        = c_clients.length;
        var found_clients = [];

        for( var i = 0; i < c_leng; i++ )
        {
            if ( i in c_clients )
            {
                var client = c_clients[ i ];

                if( client.type == client_type )
                {
                    found_clients.push( client );
                }
            }
        }
        return ( found_clients.length > 0 )? found_clients : null;

    };

    /*------------------------------------------------------
    * @function - Format msg
    * @info     - Use json across servers
    */
    Server.prototype.format_msg = function( msg )
    {
        /* -- Might want to check is obj -- */
        return JSON.stringify( msg );

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(Server, 'Server');

}( module.exports.cwc );

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
    * @function
    * where we invoke custom methods
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

}( module.exports.cwc );

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ServerMessages(  )
    {
        /* -- Add to plugins -- */
        cwc.registerPlugin(ServerMessages, 'ServerMessages');

        /* -- Created the methord to recive hello event -- */
        cwc.ServerMessages.prototype.say_hello_to_server()
    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    ServerMessages.prototype.say_hello_to_server = function()
    {
        /* -- Created the methord to recive hello event -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'client says hello',
            callback : function( args ){
                cwc.Server.prototype.set_client_type( args )
            }
        } );
    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ServerMessages, 'ServerMessages');

    cwc.ServerMessages( );

}( module.exports.cwc );



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


document.body.addEventListener('touchmove',function(e){
  e.preventDefault();
});

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function Server( extend )
    {
        cwc.registerPlugin(this, 'Server');

        this.server_info = extend;

        this.start_connection( );

    };

    /*------------------------------------------------------
    * @object - The server were connected to
    */
    Server.prototype.server_info = null;

    /*------------------------------------------------------
    * @Array - Connected clients
    * @info - Save all the connected clients here
    */
    Server.prototype.connected_clients = [
    ];

    /*------------------------------------------------------
    * @function - Start connection
    * @info - Starts the server
    */
    Server.prototype.start_connection = function()
    {
        switch ( this.server_info.type )
        {
            case 'ws' :
            this.websocket_server_handler(
            );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Set extended options
    * @info - Combines the global extend object with this options object
    * allowing further extended options
    */
    Server.prototype.websocket_server_handler = function( )
    {
        this.server_info.server.on("connection", function( ws )
        {
            var client_pos = Server.prototype.connected_clients.length;

            /* -- Client has connected -- */
            cwc.Server.prototype.save_client(
                ws
            );

            /* -- Client has disconnected -- */
            ws.close = function ( evt )
            {
                cwc.Server.prototype.drop_client(
                    client_pos
                );
            };

            /* -- Server message -- */
            ws.onmessage = function ( evt )
            {
                cwc.Server.prototype.process_request(
                    JSON.parse( evt.data )
                );
            };

        });

    };

    /*------------------------------------------------------
    * @function - Drop clinet
    * @info - Send clinet pos to know witch one to drop
    */
    Server.prototype.drop_client = function( client_pos )
    {
        var array = this.connected_clients;

        /* -- Enpy the value : but keep the pos for use of id -- */
        delete array[ client_pos ];

    };

    /*------------------------------------------------------
    * @function - Save client
    * @info - Store the clinet in the (connected_clients) array,
    * also send a message to the clinet asking for it's type ( Display/Controller )
    */
    Server.prototype.save_client = function ( connection )
    {
        var clinet_id = this.connected_clients.length;

        this.connected_clients.push({
            'id'         : clinet_id,
            'type'       : null,
            'connection' : connection
        });

        /* -- Check to see if all have screen types -- */
        connection.send( this.format_msg({
            recipient    : 'all',
            sender       : 'server',
            action       : 'hi',
            arguments    : clinet_id,
        } ) );

    };

    /*------------------------------------------------------
    * @function - Set client type
    * @info - When the client say hi back with there type
    */
    Server.prototype.set_client_type = function( args )
    {
        this.connected_clients[ args.client_id ].type = args.sender;

        // -- Send message back stating that they have connected --
        this.process_request({
            recipient : args.sender, // display || controller
            sender    : 'server',
            action    : 'display_set',
            arguments : '',
        });

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    Server.prototype.process_request = function( message )
    {
        console.log('----------------');
        console.log( message );
        console.log('----------------');

        /* -- Whom the message shall be sent to -- */
        switch( message.recipient )
        {
            case  'server' :
                this.server_message( message );
            break;

            case 'display' :
                this.send_message_to_display( message );
            break;

            case 'controller' :
                this.send_message_controllers( message );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Server message
    * @info - Message is for the server
    */
    Server.prototype.server_message = function( message )
    {
        cwc.ServerMethod.prototype.call_method(
            message
        );

    };

    /*------------------------------------------------------
    * @function - Send message to display
    * @info - Sending message to all displays
    */
    Server.prototype.send_message_to_display = function( message )
    {
        /* -- Will return an array -- */
        var display_client = this.get_client('display')

        if( display_client != null )
        {
            display_client[0].connection.send( this.format_msg(
                 message
            ));
        }

    };

    /*------------------------------------------------------
    * @function - Send message controllers
    * @info - Sending message to all controllers
    */
    Server.prototype.send_message_controllers = function( message )
    {
        /* -- Will return an array -- */
        var controllers_client = this.get_client('controller')

        var message = this.format_msg( message );

        if( controllers_client != null )
        {
            for( var i = 0; i < controllers_client.length; i++)
            {
                controllers_client[ i ].connection.send(
                    message
                );
            }
        }

    };

    /*------------------------------------------------------
    * @function - Get client
    * @info     - Give a client_type
    * @return   - All found clients
    */
    Server.prototype.get_client = function( client_type )
    {
        var c_clients     = this.connected_clients;
        var c_leng        = c_clients.length;
        var found_clients = [];

        for( var i = 0; i < c_leng; i++ )
        {
            if ( i in c_clients )
            {
                var client = c_clients[ i ];

                if( client.type == client_type )
                {
                    found_clients.push( client );
                }
            }
        }
        return ( found_clients.length > 0 )? found_clients : null;

    };

    /*------------------------------------------------------
    * @function - Format msg
    * @info     - Use json across servers
    */
    Server.prototype.format_msg = function( msg )
    {
        /* -- Might want to check is obj -- */
        return JSON.stringify( msg );

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(Server, 'Server');

}( module.exports.cwc );

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
    * @function
    * where we invoke custom methods
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

}( module.exports.cwc );

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ServerMessages(  )
    {
        /* -- Add to plugins -- */
        cwc.registerPlugin(ServerMessages, 'ServerMessages');

        /* -- Created the methord to recive hello event -- */
        cwc.ServerMessages.prototype.say_hello_to_server()
    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    ServerMessages.prototype.say_hello_to_server = function()
    {
        /* -- Created the methord to recive hello event -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'client says hello',
            callback : function( args ){
                cwc.Server.prototype.set_client_type( args )
            }
        } );
    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ServerMessages, 'ServerMessages');

    cwc.ServerMessages( );

}( module.exports.cwc );



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
    * @function
    */
    function Server( extend )
    {
        cwc.registerPlugin(this, 'Server');

        this.server_info = extend;

        this.start_connection( );

    };

    /*------------------------------------------------------
    * @object - The server were connected to
    */
    Server.prototype.server_info = null;

    /*------------------------------------------------------
    * @Array - Connected clients
    * @info - Save all the connected clients here
    */
    Server.prototype.connected_clients = [
    ];

    /*------------------------------------------------------
    * @function - Start connection
    * @info - Starts the server
    */
    Server.prototype.start_connection = function()
    {
        switch ( this.server_info.type )
        {
            case 'ws' :
            this.websocket_server_handler(
            );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Set extended options
    * @info - Combines the global extend object with this options object
    * allowing further extended options
    */
    Server.prototype.websocket_server_handler = function( )
    {
        this.server_info.server.on("connection", function( ws )
        {
            var client_pos = Server.prototype.connected_clients.length;

            /* -- Client has connected -- */
            cwc.Server.prototype.save_client(
                ws
            );

            /* -- Client has disconnected -- */
            ws.close = function ( evt )
            {
                cwc.Server.prototype.drop_client(
                    client_pos
                );
            };

            /* -- Server message -- */
            ws.onmessage = function ( evt )
            {
                cwc.Server.prototype.process_request(
                    JSON.parse( evt.data )
                );
            };

        });

    };

    /*------------------------------------------------------
    * @function - Drop clinet
    * @info - Send clinet pos to know witch one to drop
    */
    Server.prototype.drop_client = function( client_pos )
    {
        var array = this.connected_clients;

        /* -- Enpy the value : but keep the pos for use of id -- */
        delete array[ client_pos ];

    };

    /*------------------------------------------------------
    * @function - Save client
    * @info - Store the clinet in the (connected_clients) array,
    * also send a message to the clinet asking for it's type ( Display/Controller )
    */
    Server.prototype.save_client = function ( connection )
    {
        var clinet_id = this.connected_clients.length;

        this.connected_clients.push({
            'id'         : clinet_id,
            'type'       : null,
            'connection' : connection
        });

        /* -- Check to see if all have screen types -- */
        connection.send( this.format_msg({
            recipient    : 'all',
            sender       : 'server',
            action       : 'hi',
            arguments    : clinet_id,
        } ) );

    };

    /*------------------------------------------------------
    * @function - Set client type
    * @info - When the client say hi back with there type
    */
    Server.prototype.set_client_type = function( args )
    {
        this.connected_clients[ args.client_id ].type = args.sender;

        // -- Send message back stating that they have connected --
        this.process_request({
            recipient : args.sender, // display || controller
            sender    : 'server',
            action    : 'display_set',
            arguments : '',
        });

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    Server.prototype.process_request = function( message )
    {
        console.log('----------------');
        console.log( message );
        console.log('----------------');

        /* -- Whom the message shall be sent to -- */
        switch( message.recipient )
        {
            case  'server' :
                this.server_message( message );
            break;

            case 'display' :
                this.send_message_to_display( message );
            break;

            case 'controller' :
                this.send_message_controllers( message );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Server message
    * @info - Message is for the server
    */
    Server.prototype.server_message = function( message )
    {
        cwc.ServerMethod.prototype.call_method(
            message
        );

    };

    /*------------------------------------------------------
    * @function - Send message to display
    * @info - Sending message to all displays
    */
    Server.prototype.send_message_to_display = function( message )
    {
        /* -- Will return an array -- */
        var display_client = this.get_client('display')

        if( display_client != null )
        {
            display_client[0].connection.send( this.format_msg(
                 message
            ));
        }

    };

    /*------------------------------------------------------
    * @function - Send message controllers
    * @info - Sending message to all controllers
    */
    Server.prototype.send_message_controllers = function( message )
    {
        /* -- Will return an array -- */
        var controllers_client = this.get_client('controller')

        var message = this.format_msg( message );

        if( controllers_client != null )
        {
            for( var i = 0; i < controllers_client.length; i++)
            {
                controllers_client[ i ].connection.send(
                    message
                );
            }
        }

    };

    /*------------------------------------------------------
    * @function - Get client
    * @info     - Give a client_type
    * @return   - All found clients
    */
    Server.prototype.get_client = function( client_type )
    {
        var c_clients     = this.connected_clients;
        var c_leng        = c_clients.length;
        var found_clients = [];

        for( var i = 0; i < c_leng; i++ )
        {
            if ( i in c_clients )
            {
                var client = c_clients[ i ];

                if( client.type == client_type )
                {
                    found_clients.push( client );
                }
            }
        }
        return ( found_clients.length > 0 )? found_clients : null;

    };

    /*------------------------------------------------------
    * @function - Format msg
    * @info     - Use json across servers
    */
    Server.prototype.format_msg = function( msg )
    {
        /* -- Might want to check is obj -- */
        return JSON.stringify( msg );

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(Server, 'Server');

}( module.exports.cwc );

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
    * @function
    * where we invoke custom methods
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

}( module.exports.cwc );

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ServerMessages(  )
    {
        /* -- Add to plugins -- */
        cwc.registerPlugin(ServerMessages, 'ServerMessages');

        /* -- Created the methord to recive hello event -- */
        cwc.ServerMessages.prototype.say_hello_to_server()
    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    ServerMessages.prototype.say_hello_to_server = function()
    {
        /* -- Created the methord to recive hello event -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'client says hello',
            callback : function( args ){
                cwc.Server.prototype.set_client_type( args )
            }
        } );
    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ServerMessages, 'ServerMessages');

    cwc.ServerMessages( );

}( module.exports.cwc );



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
    * @function
    */
    function Server( extend )
    {
        cwc.registerPlugin(this, 'Server');

        this.server_info = extend;

        this.start_connection( );

    };

    /*------------------------------------------------------
    * @object - The server were connected to
    */
    Server.prototype.server_info = null;

    /*------------------------------------------------------
    * @Array - Connected clients
    * @info - Save all the connected clients here
    */
    Server.prototype.connected_clients = [
    ];

    /*------------------------------------------------------
    * @function - Start connection
    * @info - Starts the server
    */
    Server.prototype.start_connection = function()
    {
        switch ( this.server_info.type )
        {
            case 'ws' :
            this.websocket_server_handler(
            );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Set extended options
    * @info - Combines the global extend object with this options object
    * allowing further extended options
    */
    Server.prototype.websocket_server_handler = function( )
    {
        this.server_info.server.on("connection", function( ws )
        {
            var client_pos = Server.prototype.connected_clients.length;

            /* -- Client has connected -- */
            cwc.Server.prototype.save_client(
                ws
            );

            /* -- Client has disconnected -- */
            ws.close = function ( evt )
            {
                cwc.Server.prototype.drop_client(
                    client_pos
                );
            };

            /* -- Server message -- */
            ws.onmessage = function ( evt )
            {
                cwc.Server.prototype.process_request(
                    JSON.parse( evt.data )
                );
            };

        });

    };

    /*------------------------------------------------------
    * @function - Drop clinet
    * @info - Send clinet pos to know witch one to drop
    */
    Server.prototype.drop_client = function( client_pos )
    {
        var array = this.connected_clients;

        /* -- Enpy the value : but keep the pos for use of id -- */
        delete array[ client_pos ];

    };

    /*------------------------------------------------------
    * @function - Save client
    * @info - Store the clinet in the (connected_clients) array,
    * also send a message to the clinet asking for it's type ( Display/Controller )
    */
    Server.prototype.save_client = function ( connection )
    {
        var clinet_id = this.connected_clients.length;

        this.connected_clients.push({
            'id'         : clinet_id,
            'type'       : null,
            'connection' : connection
        });

        /* -- Check to see if all have screen types -- */
        connection.send( this.format_msg({
            recipient    : 'all',
            sender       : 'server',
            action       : 'hi',
            arguments    : clinet_id,
        } ) );

    };

    /*------------------------------------------------------
    * @function - Set client type
    * @info - When the client say hi back with there type
    */
    Server.prototype.set_client_type = function( args )
    {
        this.connected_clients[ args.client_id ].type = args.sender;

        // -- Send message back stating that they have connected --
        this.process_request({
            recipient : args.sender, // display || controller
            sender    : 'server',
            action    : 'display_set',
            arguments : '',
        });

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    Server.prototype.process_request = function( message )
    {
        console.log('----------------');
        console.log( message );
        console.log('----------------');

        /* -- Whom the message shall be sent to -- */
        switch( message.recipient )
        {
            case  'server' :
                this.server_message( message );
            break;

            case 'display' :
                this.send_message_to_display( message );
            break;

            case 'controller' :
                this.send_message_controllers( message );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Server message
    * @info - Message is for the server
    */
    Server.prototype.server_message = function( message )
    {
        cwc.ServerMethod.prototype.call_method(
            message
        );

    };

    /*------------------------------------------------------
    * @function - Send message to display
    * @info - Sending message to all displays
    */
    Server.prototype.send_message_to_display = function( message )
    {
        /* -- Will return an array -- */
        var display_client = this.get_client('display')

        if( display_client != null )
        {
            display_client[0].connection.send( this.format_msg(
                 message
            ));
        }

    };

    /*------------------------------------------------------
    * @function - Send message controllers
    * @info - Sending message to all controllers
    */
    Server.prototype.send_message_controllers = function( message )
    {
        /* -- Will return an array -- */
        var controllers_client = this.get_client('controller')

        var message = this.format_msg( message );

        if( controllers_client != null )
        {
            for( var i = 0; i < controllers_client.length; i++)
            {
                controllers_client[ i ].connection.send(
                    message
                );
            }
        }

    };

    /*------------------------------------------------------
    * @function - Get client
    * @info     - Give a client_type
    * @return   - All found clients
    */
    Server.prototype.get_client = function( client_type )
    {
        var c_clients     = this.connected_clients;
        var c_leng        = c_clients.length;
        var found_clients = [];

        for( var i = 0; i < c_leng; i++ )
        {
            if ( i in c_clients )
            {
                var client = c_clients[ i ];

                if( client.type == client_type )
                {
                    found_clients.push( client );
                }
            }
        }
        return ( found_clients.length > 0 )? found_clients : null;

    };

    /*------------------------------------------------------
    * @function - Format msg
    * @info     - Use json across servers
    */
    Server.prototype.format_msg = function( msg )
    {
        /* -- Might want to check is obj -- */
        return JSON.stringify( msg );

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(Server, 'Server');

}( module.exports.cwc );

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
    * @function
    * where we invoke custom methods
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

}( module.exports.cwc );

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ServerMessages(  )
    {
        /* -- Add to plugins -- */
        cwc.registerPlugin(ServerMessages, 'ServerMessages');

        /* -- Created the methord to recive hello event -- */
        cwc.ServerMessages.prototype.say_hello_to_server()
    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    ServerMessages.prototype.say_hello_to_server = function()
    {
        /* -- Created the methord to recive hello event -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'client says hello',
            callback : function( args ){
                cwc.Server.prototype.set_client_type( args )
            }
        } );
    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ServerMessages, 'ServerMessages');

    cwc.ServerMessages( );

}( module.exports.cwc );

