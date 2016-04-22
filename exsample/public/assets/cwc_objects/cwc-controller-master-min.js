/* ------------------------------
*  Chameleon Web Controller
*  - Controller Master

   - MIT License
   - Copyright (c) 2016 Chameleon Web Controller

   - Permission is hereby granted, free of charge, to any person obtaining a copy
   - of this software and associated documentation files (the "Software"), to deal
   - in the Software without restriction, including without limitation the rights
   - to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   - copies of the Software, and to permit persons to whom the Software is
   - furnished to do so, subject to the following conditions:

   - The above copyright notice and this permission notice shall be included in all
   - copies or substantial portions of the Software.

   - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   - IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   - FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   - AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   - LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   - OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   - SOFTWARE.
*/

/*------------------------------------------------------
* -- Centralised --
*/
//@codekit-append "../../centralised/_functions.js";
//@codekit-append "../../centralised/_Server.js";
//@codekit-append "../../centralised/_Hooks.js";

/*------------------------------------------------------
* -- Controller Assets --
*/
//@codekit-append "_CacheControl.js";

//@codekit-append "_ControllerMaster.js";
//@codekit-append "_DpadController.js";
//@codekit-append "_GesturePadController.js";
//@codekit-append "_AnalogController.js";
//@codekit-append "_PullbarController.js";
//@codekit-append "_TextCapture.js";

!function() {
"use strict";

    var cwc = {

        /* ------------------------------------------------------
        * Global connection to server
        */
        _server_connection : null,

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
        plugin: function(plugin, name)
        {
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
        registerPlugin: function( plugin, name )
        {
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
        GetYoDigits: function(length, namespace)
        {
            length = length || 6;
            return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1) + (namespace ? '-' + namespace : '');
        },

    };

    /* -- Bound out object to the window -- */
    window.cwc = cwc;

}();

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
function hyphenate(str)
{
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isFunctionA(object)
{
 	return object && getClass.call(object) == '[object Function]';
}

/*------------------------------------------------------
 Server
 ------------------------------------------------------
 * Handles connection process
 ------------------------------------------------------
*/
!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @object - Server Object
    * @info   - Used to handle communication between server
    * and client
    */
    function Server( options )
    {
        /* -- register the plug-in -- */
        cwc.registerPlugin(this, 'Server');

        /* -- connect to the host via web sockets -- */
        this.connection_options = options;

    };

    /*------------------------------------------------------
    * @object - Client key
    * @info   - Key given to client by server
    */
    Server.prototype.client_key = '';

    /*------------------------------------------------------
    * @object - Connection options
    * @info   - Options passed by the client
    */
    Server.prototype.connection_options = {

    };

    /*------------------------------------------------------
    * @object - Connection
    * @info   - The connection object to main server
    */
    Server.prototype.connection = null;


    /*------------------------------------------------------
    * @int  - Cluster code
    * @info - For the group we want to connect to or on.
    */
    Server.prototype.cluster_code = null;

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.connect = function( cluster_code )
    {
        /* -- Flush any old connections -- */
        ( cwc._server_connection )? this.onclose() : null;

        /* -- Cluster code setting -- */
        if( ( cwc._cwc_type  == 'controller' ) && ( cluster_code != null ) )
        {
            this.cluster_code = cluster_code;
        }
        else
        {
            this.cluster_code = this.gen_cluster_code( );
        }

        var socket = null,
        host = this.connection_options.host,
        port = this.connection_options.port,
        type = this.connection_options.type;

        /* -- Check the type of connection -- */
        switch ( type )
        {
            case 'ws':
                socket = new WebSocket ( this.build_ws_connection (host, port, type) );
            break;
        }

        /* -- If connected -- */
        if( socket )
        {
            /* -- Create callback for class -- */
            this.create_reserved_connection_status_hooks();

            /* -- Set global connection  -- */
            cwc._server_connection = socket;
        }

        /* -- Set appropriate socket events -- */
        if( socket && type == 'ws' )
        {
            this.set_connection_events();
        }

    };

    /*------------------------------------------------------
    * @function - Create hooks
    * @info     - Connect to the server
    */
    Server.prototype.create_reserved_connection_status_hooks = function( length )
    {
        /* -- Crete connection fill | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:connection-success',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_success( feedback );
        } } );

        /* -- Crete connection fill | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:connection-failed',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_faild( feedback );
        } } );

    };

    /*------------------------------------------------------
    * @function - Connect
    * @info     - Connect to the server
    */
    Server.prototype.gen_cluster_code = function( length  )
    {
        var min = 10000;
        var max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /*------------------------------------------------------
    * @function - Connect
    * @info     - Connect to the server
    */
    Server.prototype.build_ws_connection = function( host, port )
    {
        var cluster_code  = this.cluster_code;
        var client_type   = cwc._cwc_type;

        return 'ws:' + host + ':'+ port +
        '?cluster_code=' + cluster_code +
        '&client_type='  + client_type;

    };

    /*------------------------------------------------------
    * @function - On connection success
    * @info     - how to react when connection successful
    */
    Server.prototype.on_connection_success = function( server_feedback )
    {
        /* -- Check to see if the developer has set hook-- */
        cwc.Hooks.prototype.invoke({
            hook_name : 'connection-success',
            arguments : server_feedback,
        } );

        /* -- Save the data -- */
        if( cwc._cwc_type  == 'controller' )
        {
            /* -- save the connection data -- */
            cwc.Hooks.prototype.invoke({
                hook_name : 'cwc:save-client-data',
                arguments : server_feedback,
            } );
        }

    };

    /*------------------------------------------------------
    * @function - On greeting message
    * @info     - how to react when connection successful
    */
    Server.prototype.on_connection_faild = function()
    {
        /* -- Invoke the connection success message -- */
        cwc.Hooks.prototype.invoke({
            hook_name      : 'connection-failed',
            arguments : this.connection_options,
        });

    };

    /*------------------------------------------------------
    * @function - Set connection events
    * @info     - onerror, onclose, onopen, onmessage
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
    * @function - On open
    * @info     - on connect open
    */
    Server.prototype.onopen = function( con )
    {

    };

    /*------------------------------------------------------
    * @function - On error
    * @info     - on connect error
    */
    Server.prototype.onerror = function()
    {
        console.log('Error connecting');

    };

    /*------------------------------------------------------
    * @function - On close
    * @info     - Server has sent a message
    */
    Server.prototype.onclose = function()
    {
        cwc._server_connection = null;
    };

    /*------------------------------------------------------
    * @function - On message
    * @info     - Server has sent a message
    */
    Server.prototype.onmessage = function( revived_package )
    {
        /* -- Message data -- */
        var hook_info = JSON.parse( revived_package.data );

        /* -- Look for users -- */
        cwc.Hooks.prototype.invoke({
            hook_name    : hook_info.hook_name,
            arguments    : hook_info.arguments,
            recipient    : hook_info.recipient,
            cwc_metadata : hook_info.cwc_metadata,
        } );

    };

    /*------------------------------------------------------
    * @function - Send message
    * @info     - Send a message to the server from client
    */
    Server.prototype.send_message = function( data )
    {
        /* -- Is this a valid message : return true not valid -- */
        if( ! this.validate_onmessage( data ) )
        {
            if( cwc._server_connection )
            {
                if( cwc._server_connection.readyState == 1 )
                {
                    cwc._server_connection.send( JSON.stringify(
                        data
                    ) );
                }
            }
        }

    };

    /*------------------------------------------------------
    * @function - Validate on-message
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
        ];

        for( var i = 0; i < checks.length; i++ )
        {
            /* -- If property was not found : return true -- */
            if ( ! data.hasOwnProperty( checks[ i ] ) )
            {
                console.log('Server message is not properly fromatted.');
                return true;
            }
        }

        return false;

    };

    cwc.plugin(Server, 'Server');

}( window.cwc );

/*------------------------------------------------------
 Hooks
 ------------------------------------------------------
 * Used for client communication and CWC call back function
 * Developer can also set hooks for complainants callback function
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    function Hooks( )
    {
        cwc.registerPlugin(this, 'Hooks');
    }

    /*------------------------------------------------------
    * @array
    * Place to store all custom method
    */
    Hooks.prototype.all_reserved_hooks = {};

    /*------------------------------------------------------
    * @array
    * Place to store all custom method
    */
    Hooks.prototype.all_hooks = {};

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    Hooks.prototype.set_hook = function( prams )
    {
        if( prams.hasOwnProperty('hook_name') && prams.hasOwnProperty('method') )
        {
            /* -- Check to see if for display -- */
            if ( prams.hook_name.includes('cwc:') )
            {
                this.all_reserved_hooks[ prams.hook_name ] = {
                    'hook_name': prams.hook_name,
                    'method'   : prams.method
                };
            }
            else
            {
                this.all_hooks[ prams.hook_name ] = {
                    'hook_name' : prams.hook_name,
                    'method'    : prams.method
                };
            }
        }
        else
        {
            console.log('Hook name and method is required: check cwc git repo for more info on Hooks');
        }

    };

    /*------------------------------------------------------
    * @function - Validate hook
    * @info     - Validate the hook being sent
    */
    Hooks.prototype.validate_hook = function( data )
    {
        var checks = [
        /* -- Hook to run          -- */ 'hook_name',
        /* -- recipient of message -- */ 'recipient',
        /* -- Arguments included   -- */ 'arguments',
        ];

        for( var i = 0; i < checks.length; i++ )
        {
            /* -- If property was not found : return true -- */
            if ( ! data.hasOwnProperty( checks[ i ] ) )
            {
                console.log('Server message is not properly formatted.');
                return false;
            }

        }

        return true;

    };

    /*------------------------------------------------------
    * @function - Invoke client hook
    * where we invoke custom methods
    */
    Hooks.prototype.invoke_client_hook = function( hook_info )
    {
        /* -- Is this a valid msg : return true not valid -- */
        if( this.validate_hook( hook_info ) )
        {
            if( cwc._server_connection )
            {
                if( cwc._server_connection.readyState == 1 )
                {
                    cwc._server_connection.send( JSON.stringify(
                        hook_info
                    ) );
                }
            }
        }

    };

    /*------------------------------------------------------
    * @function - invoke
    * @info - where we invoke custom methods
    * @d-hook: - will send the hook across server to display
    * @c-hook: - will send the hook across server to controller
    * @cwc:    - reserved hook by cwc can also be used with d-hook && c-hook
    * @hook:   - user created hook
    */
    Hooks.prototype.invoke = function( hook_info )
    {
        if( ! hook_info.hasOwnProperty( 'hook_name' ) )
        {
            console.log('A hook name in required');
            return;
        }

        /* -- Get the raw hook name -- */
        var hook_name = hook_info.hook_name

        /* -- Hook is for display -- */
        if ( hook_name.includes('d-hook:') )
        {
           this.invoke_client_hook( {
                recipient : 'display',
                hook_name : hook_name.replace("d-hook:", ""),
                arguments : hook_info.arguments
            } );

        }

        /* -- Check to see is for controller -- */
        else if ( hook_name.includes('c-hook:') )
        {
            this.invoke_client_hook( {
                recipient : 'controllers',
                hook_name : hook_name.replace("c-hook:", ""),
                arguments : hook_info.arguments
            } );

        }

        /* -- Call the hook on this client -- */
        else if ( hook_name.includes('cwc:') )
        {
            this.execute( this.all_reserved_hooks, hook_name, hook_info.arguments, hook_info.cwc_metadata );
        }

        /* -- is user hook -- */
        else
        {
            /* -- Can be called using hook:*(name) useful on data attr -- */
            var hook_name = hook_info.hook_name.replace('hook:','')

            /* -- Call the hook on this client -- */
            this.execute( this.all_hooks, hook_name, hook_info.arguments, hook_info.cwc_metadata );
        }

    };

    /*------------------------------------------------------
    * @function - execute
    * @info - call the hook
    */
    Hooks.prototype.execute = function( hooks, hook_name, args, cwc_metadata  )
    {
        if( hooks.hasOwnProperty( hook_name ) )
        {
            try {
                hooks[ hook_name ].method( args, cwc_metadata )
            } catch( e ) {
                console.log( e );
            }
        }
    }

    /* -- Add this new object to the main object -- */
    cwc.plugin(Hooks, 'Hooks');

}( window.cwc );

/*------------------------------------------------------
 * Cache Control
 ------------------------------------------------------
 • Need to add support for the user to attach there own data
   when a client that been saved
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function CacheControl( extend )
    {
        cwc.registerPlugin(this, 'CacheControl');

        /* -- Fetch any saved data -- */
        this.define_cwc_hooks();

        /* -- Fetch any saved data -- */
        this.fetch_storage_data();

        /* -- Check for old connections -- */
        this.delete_old_codes();
    };

    /*------------------------------------------------------
    * @string - Storage name
    * @info   - The name given to the local storage object
    */
    CacheControl.prototype.storage_name = 'cwc-cluster-cache';

    /*------------------------------------------------------
    * @int  - Time Threshold
    * @info - declare how long data should live in local storage
    */
    CacheControl.prototype.time_threshold = 120;

    /*------------------------------------------------------
    * @object - Storage data
    * @info   - Save the local storage object here
    */
    CacheControl.prototype.storage_data = {};

    /*------------------------------------------------------
    * @function - Define hooks
    * @info     - Set reserved hooks
    */
    CacheControl.prototype.define_cwc_hooks = function( )
    {
        /* -- Crete Hook for saving data -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:save-client-data',
          method    : function( feedback ) {
            cwc.CacheControl.prototype.save_cluster_code( feedback );
        } } );

    };

    /*------------------------------------------------------
    * @function - Fetch storage data
    * @info      - Function to retrieve local storage data
    */
    CacheControl.prototype.fetch_storage_data = function()
    {
        if ( localStorage.getItem( this.storage_name ) !== null )
        {
            this.storage_data = JSON.parse(
                localStorage.getItem( this.storage_name )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Retrieve storage data
    * @info      - function to get the local stage object
    */
    CacheControl.prototype.retrieve_storage_data = function()
    {
        return this.storage_data;

    };

    /*------------------------------------------------------
    * @function - Save connection information
    * @info - Called when a successful connection has been made to the server
    */
    CacheControl.prototype.save_cluster_code = function( client_data )
    {
        /* -- Check to see if the code has been saved -- */
        if( ! this.check_for_existence( client_data ) )
        {
            /* -- Formate the cluster code -- */
            this.storage_data[ client_data.key ] = client_data;

            /* -- Store -- */
            localStorage.setItem( this.storage_name , JSON.stringify(
              this.storage_data
            ) );
        }

    };

    /*------------------------------------------------------
    * @function - Delete old codes
    * @info      - removes the old codes from the local storage
    */
    CacheControl.prototype.delete_old_codes = function()
    {
        var object     = this.storage_data;
        var new_object = {
        };

        for (var key in object )
        {
            var data = object[key];
            var diff = ( ( Date.now() - data.timestamp ) / 1000 / 60 ) << 0;

            /* -- Add if under : Time Threshold option -- */
            if( diff < this.time_threshold )
            {
                new_object[ key ] = object[ key ];
            }
        }

        this.storage_data = new_object;

    };

    /*------------------------------------------------------
    * @function - Check for existence
    * @info      - Check to see if the code has been set
    */
    CacheControl.prototype.check_for_existence = function( client_data )
    {
        var object = this.storage_data;

        for ( var key in object )
        {
            if( object[ key ].cluster_code == cluster_code )
            {
                return true;
            }
        }

        return false;

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(CacheControl, 'CacheControl');

}( window.cwc );

/*------------------------------------------------------
 * Controller Master
 * ------------------------------------------------------
 * Dependencies
 * ------------------------------------------------------
 * Hammer.js was used thought the build of this component,
 * special thanks to the awesome developers at http://hammerjs.github.io/
 * ------------------------------------------------------
 * Talk About
  -------------------------------------------------------
 • Centralising functions to allow shared code to reduce
   development time from the lack of writing repetitive
   code
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
    * @info   - Take from the hammer is spec
    */
    ControllerMaster.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'
    };

    /*------------------------------------------------------
    * @object - Last Position
    * @info - this will allow to determine
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
    * @info : Will update the tracking system for next items and groups
    */
    ControllerMaster.prototype.fetch_instructions = function( elm )
    {
        var tax = 'data-cwc-instructions';

        /* -- Search for nav end instructions-- */
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
    ControllerMaster.prototype.calculate_compass_rose = function( angle )
    {
        /* -- Negative number -- */
        if( angle < 0 ) { angle = ( 180 - Math.abs( angle ) ); }

        /* -- Positive number -- */
        else { angle = (180 + angle); }

        var directions = ["W", "NW", "N", "NE", "E", "SE", "S", "SW", "W"];
        var d_count    = 360 / (directions.length - 1);

        var index      = Math.floor( ((angle -22.5 ) % 360) / d_count );
        return directions[ index + 1 ];

    };

    /*------------------------------------------------------
    * @function - Calculate Cartesian coordinates
    * @info - Reruns UE Editor like feedback for controller
    */
    ControllerMaster.prototype.calculate_cartesian_coordinates = function( z )
    {
        var int = Math.round( (z / 100) * 10 ) / 10;
        return this.clamp( (int * 2), -1, 1 );

    };

    /*------------------------------------------------------
    * @function - Clamp
    * @info - restricted the threshold of movement
    */
    ControllerMaster.prototype.clamp = function(num, min, max)
    {
      return num < min ? min : num > max ? max : num;
    }

    /*------------------------------------------------------
    * @function - Calculate axis direction
    * x : ( in || out )
    * y : ( in || out )
    */
    ControllerMaster.prototype.calculate_axis_direction = function( delta )
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

        /* -- Record the moment -- */
        this.last_delta_pos = delta;

        /* -- Return the values -- */
        return dir;

    };

    /*------------------------------------------------------
    * @function - Get input data
    * @info     - builds the return data object to feed back to user
    */
    ControllerMaster.prototype.get_input_data = function( ev, controller_name, instructions )
    {
        var input_data  = {};

        /* -- Check to see if user has restricted retired input data -- */
        var input_r = ( instructions && instructions.hasOwnProperty('input-r') )? instructions['input-r'].split("|") : 'all-input-data';

        /* -- Direction -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("direction") != -1) )
        {
            input_data.direction = cwc.ControllerMaster.prototype.hammer_dirs[ ev.direction ];
        }

        /* -- Delta -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("delta") != -1) )
        {
            input_data.delta = ev.delta;
        }

        /* -- Angle -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("angle") != -1) )
        {
            input_data.angle = ev.angle;
        }

        /* -- Compass Rose -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("compass_rose") != -1) )
        {
            input_data.compass_rose = cwc.ControllerMaster.prototype.calculate_compass_rose(
                ev.angle
            );
        }

        /* -- Cartesian Coordinates -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("cartesian_coordinates") != -1) )
        {
            input_data.cartesian_coordinates = {
                x : cwc.ControllerMaster.prototype.calculate_cartesian_coordinates( ev.deltaX ),
                y : cwc.ControllerMaster.prototype.calculate_cartesian_coordinates( ev.deltaY )
            }
        }

        /* -- Axis Direction -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("axis_direction") != -1) )
        {
            input_data.axis_direction = cwc.ControllerMaster.prototype.calculate_axis_direction( {
                x : ev.deltaX,
                y : ev.deltaY
            } );
        }

        return input_data;

    };

    /*------------------------------------------------------
    * @function - invoke hook
    * @info - used to invoke call back hook functions
    */
    ControllerMaster.prototype.invoke_hook = function( hook, instructions, arg )
    {
        if( instructions.hasOwnProperty( hook ) )
        {
            cwc.Hooks.prototype.invoke(  {
                hook_name : instructions[ hook ],
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
 Directional pad
 ------------------------------------------------------
 * Hammer.js was used thought the build of this component,
 * special thanks to the awesome developers at http://hammerjs.github.io/
 ------------------------------------------------------
 * What to talk about
 ------------------------------------------------------
 • Different directions
 • About return types (angle, dir, coords, CD)
 • Talk about design
 ------------------------------------------------------
 * Testing
 ------------------------------------------------------
 • Browser testing
 • Adding multi controllers to a single page
 • Unit testing on function
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
    * @object - Taxonomy
    * @info   - To store all data and class names
    */
    DPadController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=dpad',
            btn        : 'data-cwc-cbtn',
        }

    };

    /*------------------------------------------------------
    * @object - All controllers
    * @info   - Keep and record of all controllers found
    */
    DPadController.prototype.all_controllers = [
    ];

    /*------------------------------------------------------
    * @function -  Controller lookup
    * @info     -  Looks thought DOM to gather all controllers
    */
    DPadController.prototype.controller_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var controller = controllers[ c_id ];

            /* -- Find all buttons associated with controller -- */
            var actions = this.controller_buttons_lookup(
                controllers[ c_id ], c_id
            );

            this.all_controllers[ c_id ] = {
                container     : controller,
                actions       : actions,
                instructions  : cwc.ControllerMaster.prototype.fetch_instructions( controller )
            };

        };

    };

    /*------------------------------------------------------
    * @function - Controller buttons lookup
    * @info - Find all button associated with controller
    */
    DPadController.prototype.controller_buttons_lookup = function( group, c_id )
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

                mc.on("tap", function( ev ) {
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

    /*------------------------------------------------------
    * @function - Button invoked
    * @info - Users is interacting with controller
    */
    DPadController.prototype.button_invoked = function( c_id, a_id )
    {
        var action       = this.all_controllers[ c_id ].actions[ a_id ];
        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- Check to see if action is allowed -- */
        if(! action.hasAttribute( 'data-cwc-cbtn' ) )
            return;

        /* -- Validate action -- */
        switch( action.getAttribute( 'data-cwc-cbtn' ) )
        {
            case 'up'     :
            var info = {
                direction    : 'UP',
                compass_rose : 'N',
                angle        : 0,
            }
            break;

            case 'right'  :
            var info = {
                direction    : 'RIGHT',
                compass_rose : 'E',
                angle        : 90,
            }
            break;

            case 'down'   :
            var info = {
                direction    : 'DOWN',
                compass_rose : 'S',
                angle        : 180,
            }
            break;

            case 'left'   :
            var info = {
                direction    : 'LEFT',
                compass_rose : 'W',
                angle        : 270,
            }
            break;

            case 'enter'  :
            info = {
                direction    : 'ENTER',
                compass_rose : 'X',
                angle        : 0,
            }
            break;

        }

        info.controller = "DPadController";

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'on-tap', instructions, info );

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(DPadController, 'DPadController');

}( window.cwc, Hammer );

/*------------------------------------------------------
 GesturePadController
 ------------------------------------------------------
 * Hammer.js was used thought the build of this component,
 * special thanks to the awesome developers at http://hammerjs.github.io/
 ------------------------------------------------------
 * What to talk about
 ------------------------------------------------------
 • Different directions
 • About return types (angle, dir, coords, CD)
 • Talk about design
 • Input filters
 ------------------------------------------------------
 * Testing
 ------------------------------------------------------
 • Browser testing
 • Adding multi controllers to a single page
 • Unit testing on function
*/

!function( cwc, Hammer ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function GesturePadController( extend )
    {
        cwc.registerPlugin(this, 'GesturePadController');

        this.lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    GesturePadController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller="gesture-pad"'
        }
    };

    /*------------------------------------------------------
    * @object - All controllers
    * @info   - Keep and record of all controllers found
    */
    GesturePadController.prototype.all_controllers = [];

    /*------------------------------------------------------
    * @object - Tracking
    * @info   - Holds the index of the controller in use
    */
    GesturePadController.prototype.tracking = null;

    /*------------------------------------------------------
    * @function - Lookup
    * @info     - Finds all pullbars within the DOM
    */
    GesturePadController.prototype.lookup = function()
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
            this.all_controllers.push({
                pad          : controller,
                instructions : instructions
            });

            /* -- If the movement has been set to pull, then call the users function -- */
            if( this.get_movement_type( c_id ) == 'swipe' )
            {
                mc.add( new Hammer.Swipe({
                    threshold: 0
                }) );

                mc.on("swipe", function( ev ) {
                    cwc.GesturePadController.prototype.on_move( ev );
                });
            }

            else if( this.get_movement_type( c_id ) == 'pan' )
            {
                mc.add(new Hammer.Pan({
                    domEvents: true, threshold: 4, pointers: 0
                } ) );

                mc.on("panmove panstart panend", function( ev ){
                    cwc.GesturePadController.prototype.on_move( ev );
                });
            }
        };

    };

    /*------------------------------------------------------
    * @function - Get movement type
    * @info     - Find the movement type given by user
    */
    GesturePadController.prototype.get_movement_type = function( c_id )
    {
        /* -- get the instructions for the current analog -- */
        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- Check the type of movement -- */
        if( instructions.hasOwnProperty( 'movement-type' ) )
        {
            switch( instructions['movement-type'] )
            {
                case  'pan'  :
                case  'swipe':
                return instructions['movement-type'];
                break;
            }
        }

        return 'swipe';

    };

    /*------------------------------------------------------
    * @function - On Move
    * @info     - User is instructions with controller
    */
    GesturePadController.prototype.on_move = function( ev )
    {
        var c_id = ( ev.target.dataset.cid == undefined )? this.tracking : ev.target.dataset.cid;

        var analog       = this.all_controllers[ c_id ].pad;
        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- Feed back information -- */
        var input_data = cwc.ControllerMaster.prototype.get_input_data(
            ev, 'GesturePadController', instructions
        );

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook(
            'on-move', instructions, input_data
        );

        this.tracking = c_id;

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(GesturePadController, 'GesturePadController');

}( window.cwc, Hammer );

/*------------------------------------------------------
 Analog Controller
 ------------------------------------------------------
 * What to talk about
 ------------------------------------------------------
 • Talk about on tick and pan moments
 • About return types (angle, dir, coords, CD)
 • The two direct type of collusion
 • Involvement when moving collision
 • Talk about design
 ------------------------------------------------------
 * Testing
 ------------------------------------------------------
 • Browser testing
 • Adding multi controllers to a single page
 • Unit testing on function
*/

!function( cwc, Hammer ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function AnalogController( extend )
    {
        cwc.registerPlugin(this, 'AnalogController');

        this.lookup();

    };

    /*------------------------------------------------------
    * @object - Taxonomy
    * @info   - To store all data and class names
    */
    AnalogController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=analog'
        }
    };

    /*------------------------------------------------------
    * @object - All controllers
    * @info   - Keep and record of all controllers found
    */
    AnalogController.prototype.all_controllers = [];

    /*------------------------------------------------------
    * @object - Returned data
    * @info   - All of the information gathered during movement
    * and return back to user
    */
    AnalogController.prototype.returned_input_data = {};

    /*------------------------------------------------------
    * @object - Tracking
    * @info   - Holds the index of the controller in use
    */
    AnalogController.prototype.tracking = null;

    /*------------------------------------------------------
    * @object - Animation frame
    * @info   - Use when tick movement to allow for constant feedback
    */
    AnalogController.prototype.animation_frame = 0;

    /*------------------------------------------------------
    * @function - Pad lookup
    * @info      - Looks thought DOM to gather all controllers
    */
    AnalogController.prototype.lookup = function()
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
            this.all_controllers[ c_id ] = {
                analog        : analog,
                trigger       : trigger,
                instructions  : cwc.ControllerMaster.prototype.fetch_instructions( analog )
            };

        }

    };

    /*------------------------------------------------------
    * @function - On analogue pan
    * @info - Main method this undergoes on controller moment
    */
    AnalogController.prototype.on_analog_pan = function( ev )
    {
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_controllers[ c_id ].analog;
        var trigger      = this.all_controllers[ c_id ].trigger;
        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- Feed back information -- */
        this.returned_input_data = cwc.ControllerMaster.prototype.get_input_data(
            ev, 'AnalogController', instructions
        );

        /* -- Analog container circle -- */
        var analog_c = {
            x: analog.offsetLeft,
            y: analog.offsetTop,
            radius: analog.clientWidth / 2,

        };

        /* -- Trigger container circle -- */
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

        /* -- Collision happening  --*/
        if (dis > analog_c.radius + trigger_c.radius)
        {
            /* --- Collision detection : to fix the a-btn to the side -- */
            var angle = ev.angle;
            var x = analog_c.x + analog_c.radius * Math.cos( angle * (Math.PI / 180) );
            var y = analog_c.y + analog_c.radius * Math.sin( angle * (Math.PI / 180) );

            /* -- add auto class -- */
            analog.classList.add("auto");

            /* -- Move the trigger handle -- */
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

            /* -- Move the trigger handle -- */
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

        /* -- If the moment has been set to pull, then call the users function -- */
        else if( this.get_movment_type() == 'pan' )
        {
            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook( 'pan', instructions, this.returned_input_data );

        }

    };

    /*------------------------------------------------------
    * @function - On pan start
    * @info     - Fired as when controller first interacted
    */
    AnalogController.prototype.on_pan_start = function( c_id, instructions, analog, trigger )
    {
        /* -- Track the object being used -- */
        this.tracking = c_id;

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook(
            'panstart', instructions, null
        );

        if( this.get_movment_type() == 'tick' )
        {
            this.on_tick();
        }

        analog.classList.add("active");

    };

    /*------------------------------------------------------
    * @function - On pan end
    * @info     - Fired as soon as user has finished interacting with controller
    */
    AnalogController.prototype.on_pan_end = function( c_id, instructions, analog, trigger )
    {
        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook(
            'panend', instructions, null
        );

        /* -- Remove any if necessary -- */
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

        /* -- Track the object being used -- */
        this.tracking = null;

    };

    /*------------------------------------------------------
    * @function - Get moment type
    * @info     - Check witch interaction has been set for controller
    */
    AnalogController.prototype.get_movment_type = function(  )
    {
        /* -- get the instructions for the current analogue -- */
        var instructions = this.all_controllers[ this.tracking ].instructions;

        /* -- Check the type of movement -- */
        if( instructions.hasOwnProperty( 'movement-type' ) )
        {
            return instructions['movement-type'];
        }
        else
        {
            return 'pan';
        }

    };

    /*------------------------------------------------------
    * @function - On tick
    * @info - When controller has entered continuous moment
    */
    AnalogController.prototype.on_tick = function( order )
    {
        /* -- destroy the tick  -- */
        if( order === 'destroy' )
        {
            window.cancelAnimationFrame(
                cwc.AnalogController.prototype.animation_frame
            );
        }

        /* -- Start the tick process -- */
        else
        {
            /* -- get the instructions for the current analog -- */
            var instructions = cwc.AnalogController.prototype.all_controllers[
                cwc.AnalogController.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook( 'pan', instructions,
                cwc.AnalogController.prototype.returned_input_data
            );

            /* -- Build the loop -- */
            cwc.AnalogController.prototype.animation_frame = window.requestAnimationFrame(
                cwc.AnalogController.prototype.on_tick
            );
        }

    };

    /*------------------------------------------------------
    * @function - Trigger translate
    * @info - Used to change the css 3D translate state of the controller
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
 GesturePadController
 ------------------------------------------------------
 * Hammer.js was used thought the build of this component,
 * special thanks to the awesome developers at http://hammerjs.github.io/
 ------------------------------------------------------
 * What to talk about
 ------------------------------------------------------
 • Talk about on tick and pan movements
 • About return types (angle, dir, coords, CD)
 • The two different type of collusion
 • Involvement when moving and how circle reacts to collision
 • Talk about design
 ------------------------------------------------------
 * Testing
 ------------------------------------------------------
 • Browser testing
 • Adding multi controllers to a single page
 • Unit testing on function
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
        this.lookup();
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
    * @object - All pullbars
    * @info   - Keep and record of all found pullbar elms
    */
    PullbarController.prototype.all_pullbars = [
    ];

    /*------------------------------------------------------
    * @object - Returned data
    * @info - All of the information goatherd during movement
    */
    PullbarController.prototype.returned_data = {
    };

    /*------------------------------------------------------
    * @object - Request id
    * @info   - request animation frame id
    */
    PullbarController.prototype.request_id = 0;

    /*------------------------------------------------------
    * @object - Tracking
    * @info   - All us to track the current item in use
    */
    PullbarController.prototype.tracking = null;

    /*------------------------------------------------------
    * @function - Lookup
    * @info     - Finds all pullbars within the DOM
    */
    PullbarController.prototype.lookup = function( )
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
    * @info     - Panning options an collision
    */
    PullbarController.prototype.on_pullbars_trigger_pan = function( ev )
    {
        /* -- Set the components and options -- */
        var g_id            = ( event.target.g_id == undefined )? this.tracking : event.target.g_id;
        var pullbar         = this.all_pullbars[ g_id ].pullbar;
        var trigger         = this.all_pullbars[ g_id ].trigger;
        var instructions    = this.all_pullbars[ g_id ].instructions;

        /* -- Get the style information about the components -- */
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

        /* -- Set the data to be returned -- */
        this.returned_data = cwc.ControllerMaster.prototype.get_input_data(
            ev, 'PullbarController'
        );

        if( instructions.hasOwnProperty('viewport-target') )
        {
            this.returned_data.viewport_target = instructions['viewport-target'];
        }

        /* -- collision -- */
        if( threshold.y.top || threshold.y.btm )
        {
            /* -- Check if we in enter frame -- */
            if( this.request_id == 0 )
            {
                /* -- Start the tick process -- */
                this.on_tick();

                /* -- Clear out the timer -- */
                pullbar.classList.add("auto");
            }

        }

        /* -- no collision -- */
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
            cwc.ControllerMaster.prototype.invoke_hook(
                'on-pull', instructions, this.returned_data
            );

        }

        this.start_and_end_toggle( ev.type, g_id, pullbar, trigger )

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
    * @info     - Clear out the timer and reset collision
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
            /* -- get the instructions for the current analog -- */
            var instructions = cwc.PullbarController.prototype.all_pullbars[
                cwc.PullbarController.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook(
                'on-pull',
                instructions,
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

/*------------------------------------------------------
 * Viewport Scroll Display
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function TextCapture( )
    {
        cwc.registerPlugin(this, 'TextCapture');

        /* -- Set the hooks -- */
        this.set_cwc_hooks();

    };

    /*------------------------------------------------------
    * @function - lookup
    * @info - Find elms with data-(textcapture) add the this to object
    */
    TextCapture.prototype.set_cwc_hooks = function()
    {
        /* -- Crete connection fill | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:text-capture-invoked',
          method    : function( prams ) {
            cwc.TextCapture.prototype.create_text_capture(
                prams
            );
        } } );

    };

    /*------------------------------------------------------
    * @function - Create text capture
    * @info - Append a text capture item to the DOM
    */
    TextCapture.prototype.create_text_capture = function( prams )
    {
        /* -- Check elm dose not exist -- */
        if ( ! document.querySelector('#' + prams.name ) )
        {
            var input = document.createElement("textarea");
                input.maxLength = "5000";
                input.cols = "80";
                input.rows = "40";
                input.className  = 'cwc-text-capture';
                input.placeholder = prams.placeholder;

                /* -- Use the name as #id -- */
                input.id = prams.name;

                input.addEventListener("blur", function(){
                    cwc.TextCapture.prototype.text_capture_done( this );
                });

            /* -- Add to the body -- */
            document.body.appendChild(input);

            /* -- Focus into the elm -- */
            document.querySelector('#' + name ).focus();
        }

    };

    /*------------------------------------------------------
    * @function - Text capture done
    * @info - Called when the user has finished inputting text
    */
    TextCapture.prototype.text_capture_done = function( elm )
    {
        /* -- Remove element -- */
        document.body.removeChild( elm );

        /* -- Send the recorded data -- */
        cwc.Hooks.prototype.invoke_clinet_hook({
            hook_name : 'text-capture-done',
            recipient : 'display',
            arguments : {
                name  : elm.id,
                value : elm.value
            }
        });

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(TextCapture, 'TextCapture');

}( window.cwc );

