/* ------------------------------
*  Chameleon Web Controller
*  - Display Master

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
// @codekit-append "../../centralised/_functions.js";
// @codekit-append "../../centralised/_Server.js";
// @codekit-append "../../centralised/_Hooks.js";

/*------------------------------------------------------
* -- Display --
*/
//@codekit-append "_Navgroup.js"
//@codekit-append "_ViewportScroll.js"
//@codekit-append "_TextCapture.js"

/* ------------------------------
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
        * Set type of plugin
        */
        _cwc_type : 'display',

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
    Server.prototype.server_message = null;

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
    * @function - Check connection settings
    * @info - Check to see if cluster is nneded or not
    */
    Server.prototype.connect = function( cluster_code )
    {
        /* -- controller -- */
        if( ( cwc._cwc_type  == 'controller' ) && ( cluster_code != null ) )
        {
            /* -- Copy the cluster -- */
            this.cluster_code = cluster_code;

            /* -- Try to connect -- */
            this.start_connection();
        }

        /* -- Display -- */
        if( ( cwc._cwc_type  == 'display' ) && ( cluster_code == null ) )
        {
            /* -- Creat code for cluster -- */
            this.cluster_code = this.gen_cluster_code( );

            /* -- Try to connect -- */
            this.start_connection();
        }

    };

    /*------------------------------------------------------
    * @function - Start Connecting
    * @info - Connect to the server
    */
    Server.prototype.start_connection = function()
    {
        /* -- Flush any old connections -- */
        ( cwc._server_connection )? this.onclose() : null;

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
    }

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
        if( this.validate_message( data ) )
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
    Server.prototype.validate_message = function( data )
    {
        if( typeof data === 'object' )
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
                    return false;
                }
            }

            /* -- All good -- */
            return true;
        }
        else
        {
            return false;
        }

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
    Hooks.prototype.set_hook = function( hook_info )
    {
        /* -- Has to be object -- */
        if( typeof hook_info == 'object' )
        {
            /* -- need a hook name and methord -- */
            if( hook_info.hasOwnProperty('hook_name') && hook_info.hasOwnProperty('method') )
            {
                /* -- Name not be be empy -- */
                if( hook_info.hook_name && ( typeof hook_info.method == 'function' ) )
                {
                    /* -- Check to see if for display -- */
                    if ( hook_info.hook_name.includes('cwc:') )
                    {
                        this.create_reserved_hook( hook_info );
                    }
                    else
                    {
                        this.create_clinet_hook( hook_info );
                    }
                }
            }
        }

    };

    /*------------------------------------------------------
    * @function - Create reserved hook
    * @info     - Creates a reserved CWC hook
    */
    Hooks.prototype.create_reserved_hook = function( prams )
    {
        this.all_reserved_hooks[ prams.hook_name ] = {
            'hook_name': prams.hook_name,
            'method'   : prams.method
        };
    }

    /*------------------------------------------------------
    * @function - Create clinte hook
    * @info     - Creates a client hook
    */
    Hooks.prototype.create_clinet_hook = function( prams )
    {
        this.all_hooks[ prams.hook_name ] = {
            'hook_name' : prams.hook_name,
            'method'    : prams.method
        };
    }

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
        /* -- Validate the call -- */
        if( this.validate_invoke( hook_info ) )
        {
            /* -- Get the raw hook name -- */
            var hook_name = hook_info.hook_name;

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

            /* -- Reserved CWC hook  -- */
            else if ( hook_name.includes('cwc:') )
            {
                this.execute(
                    this.all_reserved_hooks,
                    hook_name,
                    hook_info.arguments,
                    hook_info.cwc_metadata
                );

            }
            /* -- is user hook -- */
            else
            {
                /* -- Can be called using hook:*(name) useful on data attr -- */
                var hook_name = hook_info.hook_name.replace('hook:','')

                /* -- Call the hook on this client -- */
                this.execute(
                    this.all_hooks,
                    hook_name,
                    hook_info.arguments,
                    hook_info.cwc_metadata
                );

            }
        }
    };

    /*------------------------------------------------------
    * @function - Validate invoke
    * @info     - Check to see if all is valid
    */
    Hooks.prototype.validate_invoke = function( hook_info )
    {
        /* -- Hook name is not found -- */
        if( typeof hook_info != 'object' )
        {
            console.log('Hook must be in the from of an object.');
            return false;
        }

        /* -- Hook name is not found -- */
        if( ! hook_info.hasOwnProperty( 'hook_name' ) )
        {
            console.log('A hook name in required.');
            return false;
        }

        /*  -- check is strign -- */
        if( typeof hook_info['hook_name'] != 'string' )
        {
            console.log('A hook must in a string format.');
            return false;
        }

        return true;

    };

    /*------------------------------------------------------
    * @function - execute
    * @info - call the hook
    */
    Hooks.prototype.execute = function( hooks, hook_name, args, cwc_metadata  )
    {
        if ( args == undefined)
        {
            hooks[ hook_name ].method( )
        }
        else
        {
            hooks[ hook_name ].method( args, cwc_metadata )
        }

    }

    /* -- Add this new object to the main object -- */
    cwc.plugin(Hooks, 'Hooks');

}( window.cwc );

/*------------------------------------------------------
 Navgroups
 ------------------------------------------------------
 To-Do •
 ------------------------------------------------------
*/
!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function Navgroup( extend )
    {
        cwc.registerPlugin(this, 'Navgroup');

        /* -- Update options if are assigned -- */
        if( extend )
        {
            this.options = Object.assign(
                this.options,
                extend
            );

        }

        /* -- Start the Navgroup process -- */
        this.reflow();

        if ( this.navgroups_count() > 0 )
        {
            /* -- Add Navgroup events -- */
            this.add_window_key_events();

            /* -- Add CWC hooks -- */
            this.cwc_hooks();

        }

        console.log( this.nav_elms );

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    Navgroup.prototype.callbacks = {
        onnav_changed    : function(){},
        onitem_changed   : function(){}
    }

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    Navgroup.prototype.options = {
        active_group_class : 'cwc-selected-group',
        active_item_class  : 'cwc-selected-item',
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    Navgroup.prototype.taxonomy = {
        classes : {
            group : 'cwc-selected-group',
            item  : 'cwc-selected-item',
        },

        /* -- HTML:(data-*) -- */
        data : {
            group     : 'data-cwc-navgroup',
            item      : 'data-cwc-navitem',
            starting  : 'starting-point'
        }

    };

    /*------------------------------------------------------
    * @object - Tracking
    * @info - away of tracking last and previous Navitem
    */
    Navgroup.prototype.tracking = {
        previous : {},

        current : {
            g_id  : 0,
            g_elm : null,

            i_id  : 0,
            i_elm : null
        }

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and record of all found Navitems elms
    */
    Navgroup.prototype.nav_elms = {

    };

    /*------------------------------------------------------
    * @array
    * Place to store all custom method
    */
    Navgroup.prototype.keys = {
            /* -- ESC -- */
            27 : function(){ },

            /* -- Enter -- */
            13 : function(){ cwc.Navgroup.prototype.key_function( 'enter' ) },
            32 : function(){ cwc.Navgroup.prototype.key_function( 'enter' ) },

            /* -- W & up -- */
            87 : function(){ cwc.Navgroup.prototype.key_function( 'up' ) },
            38 : function(){ cwc.Navgroup.prototype.key_function( 'up' ) },

            /* -- S & down -- */
            83 : function(){ cwc.Navgroup.prototype.key_function( 'down' ) },
            40 : function(){ cwc.Navgroup.prototype.key_function( 'down' ) },

            /* -- A & left -- */
            65 : function(){ cwc.Navgroup.prototype.key_function( 'left' ) },
            37 : function(){ cwc.Navgroup.prototype.key_function( 'left' ) },

            /* -- D & right -- */
            68 : function(){ cwc.Navgroup.prototype.key_function( 'right' ) },
            39 : function(){ cwc.Navgroup.prototype.key_function( 'right' ) },

    };

    /*------------------------------------------------------
    * @function - Navgroups lookup
    * @info - Find elms with data-(group) add the this to object
    */
    Navgroup.prototype.reflow = function()
    {
        /* -- Get names -- */
        var nav_groups       = document.querySelectorAll('['+ this.taxonomy.data.group +']');
        var nav_groups_count = nav_groups.length;

        for( var g_id = 0; g_id < nav_groups_count; g_id++ )
        {
            var g_name = nav_groups[ g_id ].dataset.cwcNavgroup;

            /* -- Find all item in group -- */
            var navitems = this.items_lookup(
                nav_groups[ g_id ], g_id, g_name
            );

            /* -- Find instructions -- */
            var instructions = this.retrive_instructions(
                nav_groups[ g_id ], g_id, g_name
            );

            this.nav_elms[ g_name ] = {
                navitems     : navitems,
                instructions : instructions,
                g_id         : g_id,
                container    : nav_groups[ g_id ],
            }
        };

    };

    /*------------------------------------------------------
    * @function - Navitems lookup
    * @info - Find elms with data-(navitem) add the this to object
    * @return - true : false
    */
    Navgroup.prototype.items_lookup = function( group, g_id, g_name )
    {
        var descendants     = group.getElementsByTagName('*');
        var descendants_len = descendants.length;

        var g_name = group.dataset.cwcNavgroup;

        var items = [
        ];

        var tracking = null;

        for( var i_id = 0; i_id < descendants_len; i_id++ )
        {
            var item = descendants[ i_id ];

            var check = {
                /* -- is elm       -- */
                one : item.nodeType == 1,

                /* -- has Navitem -- */
                two : item.hasAttribute( this.taxonomy.data.item )
            };

            if( check.one && check.two )
            {
                /* -- store found items -- */
                var item_obj = {
                    item         : item,
                    instructions : this.retrive_instructions( item )
                };

                /* -- Add the item -- */
                items.push( item_obj );

                /* -- Up date the current group and index -- */
                if( item_obj.instructions.hasOwnProperty( 'starting-point' ) )
                {
                    /* -- user would like to start here -- */
                    this.update_nav_tracking( {
                        g_name : g_name,
                        g_id   : g_id,
                        g_elm  : group,

                        /* -- Cannot use i_id out of sync with items (not all our elms) -- */
                        i_id  : items.length - 1,
                        i_elm : item_obj,
                    } );
                }
            }

        }

        return items;

    };

    /*------------------------------------------------------
    * @function - Ng append item
    * @info     - Will update the tracking system for next items and groups
    */
    Navgroup.prototype.ng_append_item = function( item, g_name )
    {
        /* -- Only add if there -- */
        if( this.nav_elms.hasOwnProperty( g_name ) )
        {
            /* -- store item -- */
            this.nav_elms[ g_name ].navitems.push({
                item         : item,
                instructions : this.retrive_instructions( item )
            });
        }

    };

    /*------------------------------------------------------
    * @function - Ng remove item
    * @info     - Will update the tracking system for next items and groups
    */
    Navgroup.prototype.ng_remove_item = function( index, g_name )
    {
        /* -- Only add if there -- */
        if( this.nav_elms.hasOwnProperty( g_name ) )
        {
            /* -- Remove the item -- */
            this.nav_elms[ g_name ].navitems.splice( index , 1 );

        }

    };

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info - Will update the tracking system for next items and groups
    */
    Navgroup.prototype.retrive_instructions = function( item )
    {
        var tax = 'data-cwc-instructions'

        /* -- Search for nav end instructions -- */
        if( item.hasAttribute( tax )  )
        {
            return JSON.parse(
                item.getAttribute( tax )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Navgroups count
    * @return - Found nav count
    */
    Navgroup.prototype.navgroups_count = function()
    {
        var count = 0;

        for ( var key in this.nav_elms )
            count++;

        return count;

    };

    /*------------------------------------------------------
    * @function - Total items in group
    * @return - count items in group : default current group
    */
    Navgroup.prototype.total_items_in_group = function( group_name )
    {
        group_name = ( ! group_name )? this.tracking.current.g_name : group_name;

        if( this.nav_elms.hasOwnProperty( group_name ) )
        {
            return this.nav_elms[
                group_name
            ].navitems.length;
        };

    };

    /*------------------------------------------------------
    * @function - Add window key events
    * @info - Add window key-binds for Navgroup
    * @conditions set - Only if Navitems found
    */
    Navgroup.prototype.cwc_hooks = function()
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:navgroup-action',
          method    : function( feedback ) {
                cwc.Navgroup.prototype.call_action( feedback.compass_rose );
        } } );

    };

    /*------------------------------------------------------
    * @function - Add window key events
    * @info - Add window key-binds for Navgroup
    * @conditions set - Only if Navitems found
    */
    Navgroup.prototype.add_window_key_events = function()
    {
        var $keys = this.keys;

        window.addEventListener("keydown", function( event )
        {
            var key = event.keyCode || event.which;

            /* -- Find if the key is in our object -- */
            if ( $keys.hasOwnProperty( event.keyCode || event.which ) )
            {
                $keys[key]()
                event.preventDefault();
            }
        });

    };

    /*------------------------------------------------------
    * @function - Invoke key
    * @info     - page initialisation code here the DOM will be available here
    * Only start the process when the DOM is ready
    */
    Navgroup.prototype.call_action = function( dir, cb )
    {
        var a_enter  = ['enter', 'select', 'x'];
        var a_up     = ['up',    'n', 'ne', 'nw'];
        var a_right  = ['right', 'e', 'ne', 'se'];
        var a_down   = ['down',  's', 'se', 'sw'];
        var a_left   = ['left',  'w', 'nw', 'sw'];

        var action   = dir.toLowerCase( dir );

        /* -- Select -- */
        if( a_enter.indexOf( action ) != -1 )
            this.key_function( 'enter' );

        /* -- up -- */
        if( a_up.indexOf( action ) != -1 )
            this.key_function( 'up' );

        /* -- right -- */
        if( a_right.indexOf( action ) != -1 )
            this.key_function( 'right' );

        /* -- down -- */
        if( a_down.indexOf( action ) != -1 )
            this.key_function( 'down' );

        /* -- left -- */
        if( a_left.indexOf( action ) != -1 )
            this.key_function( 'left' );

        /* -- If cb has been set then call the function -- */
        ( isFunctionA( cb ) )? cb( this.tracking.current ) : null ;

    };

    /*------------------------------------------------------
    * @function - Key function
    * @info     : When key has been pressed : action sent here
    * - up      // pass one of the following n* items as an argument
    * - right   // pass one of the following n* items as an argument
    * - down    // pass one of the following n* items as an argument
    * - left    // pass one of the following n* items as an argument
    * - enter   // pass one of the following n* items as an argument
    * - space   // pass one of the following n* items as an argument
    */
    Navgroup.prototype.key_function = function( dir )
    {
        var group_name    = this.tracking.current.g_name;
        var current_group = this.tracking.current.g_id;
        var current_item  = this.tracking.current.i_id;

        /* -- Clone the index -- */
        var c_indexs = {
            group_name : JSON.parse( JSON.stringify( group_name    ) ),
            group      : JSON.parse( JSON.stringify( current_group ) ),
            item       : JSON.parse( JSON.stringify( current_item  ) )
        }

        /* -- Get instruction -- */
        var group_instructions = this.nav_elms[ group_name ].instructions;
        var item_instructions  = this.nav_elms[ group_name ].navitems[ current_item ].instructions;

        /* -- Check to see if item has instructions : before moving -- */
        if( item_instructions != null )
        {
            if( item_instructions.hasOwnProperty( dir ) )
            {
                /* -- Get the item instructions -- */
                this.analyse_instructions(
                    item_instructions[ dir ],
                    c_indexs
                );

                return true;
            }
        }

        /* -- Check to see if instructions has been set on navgroup -- */
        if( group_instructions != null )
        {
             /* -- Has been set and not null -- */
            if( group_instructions.hasOwnProperty( dir ) )
            {
                this.analyse_instructions(
                    group_instructions[ dir ],
                    c_indexs
                );

                return true;
            }
        }

    };

    /*------------------------------------------------------
    * @function - Analyse instructions
    * - ni:next                // next Navitem
    * - ni:prev                // previous Navitem
    * - ng:next                // next Navgroup
    * - ng:prev                // previous Navgroup
    * - ng:(*)                 // name of the group you wish to Navgroup too
    * - hook:*(custom method) // add custom method to end of arg, must be set up in custom methods
    */
    Navgroup.prototype.analyse_instructions = function( instruction, c_index )
    {
        var delimiter = ':';
        var navgroup  = 'ng'   + delimiter;
        var navitem   = 'ni'   + delimiter;
        var hook      = 'hook' + delimiter;

        /* -- Hook -- */
        if( instruction.indexOf( hook ) > -1 )
        {
            cwc.Hooks.prototype.invoke(  {
                hook_name : instruction,
                arguments : this.tracking.current
            } );

        }

        /* -- Move to item -- */
        else if( instruction.indexOf( navitem ) > -1 )
        {
            var action = instruction.replace( navitem ,'');

            if((action == 'next'))
            {
                this.on_new_item_update( c_index.item += 1  );
            }

            else if ( action == 'prev' )
            {
                this.on_new_item_update( c_index.item -= 1 );
            }

        }

        /* -- The user is trying to update group -- */
        else if( instruction.indexOf( navgroup ) > -1 )
        {
            var action = instruction.replace( navgroup ,'');

            /* -- We know the name of the group -- */
            if( this.nav_elms.hasOwnProperty( action ) )
            {
                this.move_to_nav_name( action );
            }

            else if( action == 'next' )
            {
                this.move_to_new_nav_index(
                    c_index.group += 1
                );
            }

            else if ( action == 'prev' )
            {
                this.move_to_new_nav_index(
                    c_index.group -= 1
                );
            }

        };

    };

    /*------------------------------------------------------
    * @function - On new nav
    * @info     - Change to new nav item
    */
    Navgroup.prototype.move_to_new_nav_index = function( g_id )
    {
        /* -- Nav constraints -- */
        var constraint = {
            under : ( g_id < 0 ),
            over  : ( g_id == this.navgroups_count() ),
        }

        if( constraint.under )
        {
            g_id = this.navgroups_count();
        }

        else if ( constraint.over )
        {
            g_id = 0;
        }

        for ( var key in this.nav_elms )
        {
            if( this.nav_elms[ key ].g_id == g_id )
            {
                this.move_to_nav_name( key );
                break;
            }
        }

    };

    /*------------------------------------------------------
    * @function - Move to nav name
    * @info     - Change to new nav item
    */
    Navgroup.prototype.move_to_nav_name = function( group_name )
    {
        /* -- Check to see if the group has been set -- */
        if( ! this.nav_elms.hasOwnProperty( group_name ) ) {
            return;
        }
        /* -- Check to see if we have items -- */
        else if ( this.total_items_in_group( group_name ) == 0 ) {
            return;
        }

        var nav_group = this.nav_elms[ group_name ];
        var c_item    = null;

        if( nav_group.instructions != null )
        {
            /* -- Check for history item -- */
            if( nav_group.instructions.hasOwnProperty('history-item') )
            {
                c_item = this.lookup_history_item(
                    nav_group
                );
            }

        }

        if( c_item == null )
        {
            c_item = this.find_best_item(
                nav_group
            );

        }

        /* -- Update the tracking process -- */
        this.update_nav_tracking({
            g_name  : group_name,
            g_id    : nav_group.g_id,
            g_elm   : nav_group.container,

            i_id    : c_item.i_id,

            i_elm   : c_item.i_elm
        });

        if( nav_group.instructions != null )
        {
            /* -- Check for entrance hook -- */
            if( nav_group.instructions.hasOwnProperty('on-entrance') )
            {
                this.analyse_instructions(
                    nav_group.instructions['on-entrance']
                );
            }

        }

        /* -- Check to see if global hook has been created-- */
        cwc.Hooks.prototype.invoke(  {
            hook_name : 'navgroup-updated',
            arguments : this.tracking.current
        } );

    };

    /*------------------------------------------------------
    * @function - Find best item
    * @info     - Find best object to swap
    */
    Navgroup.prototype.find_best_item = function( nav_group )
    {
        return {
            i_id  : 0,
            i_elm : nav_group.navitems[ 0 ]
        };

    };

    /*------------------------------------------------------
    * @function - Lookup history item
    * @info     - Change to new nav item
    */
    Navgroup.prototype.lookup_history_item = function( nav_group )
    {
        var current_group_items = nav_group['navitems'];

        var limit               = current_group_items.length;
        var tax                 = 'data-lastitem'

        var return_obj = {};

        for( var i = 0; i < limit; i++ )
        {
            var item = current_group_items[i].item;

            if( item.hasAttribute( tax ) )
            {
                return_obj = {
                    i_id  : i,
                    i_elm : current_group_items[i]
                }

                break;
            }
            else
            {
                return_obj = {
                    i_id  : 0,
                    i_elm : current_group_items[0]
                }
            }

        };

        item.removeAttribute( tax )
        return return_obj;

    };

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info - Will update the tracking system for next items and groups
    */
    Navgroup.prototype.on_new_item_update = function( index )
    {
        var collision = {
            first : ( index <= -1 ),
            last  : ( index >= this.total_items_in_group( ) )
        }

        if( collision.first )
        {
            index = this.total_items_in_group( ) - 1;
        }

        if( collision.last )
        {
            index = 0;
        }

        var g_name             = this.tracking.current.g_name;
        var item_instructions  = this.nav_elms[ g_name ].navitems[ index ].instructions;

        this.update_nav_tracking({
            g_id   : this.nav_elms[ g_name ].g_id,
            g_elm  : this.nav_elms[ g_name ].container,
            g_name : g_name,

            i_id  : index,
            i_elm : this.nav_elms[ g_name ].navitems[ index ]
        });

        /* -- Check to see if item has instructions : before moving -- */
        if( item_instructions != null )
        {
            /* -- Check for entrance hook -- */
            if( item_instructions.hasOwnProperty('on-entrance') )
            {
                this.analyse_instructions(
                    item_instructions['on-entrance']
                );
            }
        }

        /* -- Check to see if global hook has been created-- */
        cwc.Hooks.prototype.invoke(  {
            hook_name : 'navitem-updated',
            arguments : this.tracking.current
        } );

    };

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info - Will update the tracking system for next items and groups
    */
    Navgroup.prototype.update_nav_tracking = function( prams )
    {
        /* -- Record previous state -- */
        this.tracking.previous = this.tracking.current;
        this.tracking.current  = prams;

        /* -- Only update when relevant -- */
        if( this.tracking.previous.g_id != this.tracking.current.g_id )
        {
            this.highlight_group();
        }

        this.highlight_item();

    };

    /*------------------------------------------------------
    * @function - Highlight group
    * @info - Add highlight class to group
    */
    Navgroup.prototype.highlight_group = function()
    {
        if( this.tracking.previous.g_elm )
        {
            this.tracking.previous.g_elm.classList.remove(
                this.options.active_group_class
            );

            /* -- Record the last visited nav item -- */
            this.tracking.previous.i_elm.item.dataset.lastitem = true;
        }

        if( this.tracking.current.g_elm )
        {
            this.tracking.current.g_elm.classList.add(
                this.options.active_group_class
            );
        }

    };

    /*------------------------------------------------------
    * @function - Highlight item
    * @info - Add highlight class to item
    */
    Navgroup.prototype.highlight_item = function()
    {
        if( this.tracking.previous.i_elm )
        {
            this.tracking.previous.i_elm.item.classList.remove(
                this.options.active_item_class
            );
        }

        if( this.tracking.current.i_elm )
        {
            this.tracking.current.i_elm.item.classList.add(
                this.options.active_item_class
            );
        }

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(Navgroup, 'Navgroup');

}( window.cwc );

/*------------------------------------------------------
 * Viewport Scroll Display
 *------------------------------------------------------
 * To-Do
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ViewportScroll( scrollTargets )
    {
        cwc.registerPlugin(this, 'ViewportScroll');

        if( scrollTargets.length >= 0 )
        {
            /* -- Cache each of the elements -- */
            this.cache_targets( scrollTargets );

            /* -- add CWC hooks -- */
            this.add_cwc_hooks();
        }

    };

    /*------------------------------------------------------
    * @array - Save the ids
    * @info - Used to store the id's of each of the elements
    */
    ViewportScroll.prototype.scroll_target_ids = [
        'scroll-target'
    ];

    /*------------------------------------------------------
    * @function - Cached scroll target
    * @info - Save send elements here
    */
    ViewportScroll.prototype.cached_scroll_target = [
    ];

    /*------------------------------------------------------
    * @function - Cached scroll target
    * @info - Save all of the elements to optimise and seed up performance
    */
    ViewportScroll.prototype.cache_targets = function( scrollTargets )
    {
        /* -- Save the ids -- */
        this.scroll_target_ids = scrollTargets;

        var sti = this.scroll_target_ids;

        for( var i = 0; i < sti.length; i++ )
        {
            this.cached_scroll_target.push(
                document.querySelector( sti[ i ] )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Add Server events to control class
    * @info - scroll viewport is server event
    */
    ViewportScroll.prototype.add_cwc_hooks = function()
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:scroll-viewport',
          method    : function( feedback ) {
            cwc.ViewportScroll.prototype.start_scroll_process( feedback );
        } } );

    };

    /*------------------------------------------------------
    * @function - Start scroll process
    * @info - check to see if send id lives in out array
    */
    ViewportScroll.prototype.start_scroll_process = function( args )
    {
        /* -- Get all ids sent to class -- */
        var sti = this.scroll_target_ids;


        /* -- Try and find position -- */
        var pos =  sti.indexOf(
            args.viewport_target
        );

        console.log( args.viewport_target );

        /* -- Check position -- */
        if( pos != -1 )
        {
            /* -- Get all ids sent to class -- */
            var a_elms = this.cached_scroll_target;

            this.check_action(
                a_elms[ pos ],
                args.compass_rose
            );

        }

    };

    /*------------------------------------------------------
    * @function - Check action
    * @info - and that the actions are good.
    */
    ViewportScroll.prototype.check_action = function( elm, direction )
    {
        switch( direction.toUpperCase() )
        {
            case 'DOWN' :
            case 'S'    :
            elm.scrollTop = elm.scrollTop + 15;
            break;

            case 'UP' :
            case 'N'    :
            elm.scrollTop = elm.scrollTop - 15;
            break;
        }

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ViewportScroll, 'ViewportScroll');

}( window.cwc );

/*------------------------------------------------------
 * Viewport Scroll Display
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
 • Fix support for scroll animation on tap.
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

        /* -- Set CWC hooks -- */
        this.set_cwc_hooks();

        /* -- Find elms -- */
        this.lookup();
    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and record of all found nav elms
    */
    TextCapture.prototype.all_text_capture = [
    ];

    /*------------------------------------------------------
    * @function - Set CWC hooks
    * @info - Set hook for Text Capture done from controller
    */
    TextCapture.prototype.set_cwc_hooks = function()
    {
        /* -- Crete connection fill | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:text-capture-done',
          method    : function( feedback ) {
            cwc.TextCapture.prototype.on_text_capture_done(
                feedback
            );
        } } );

    };

    /*------------------------------------------------------
    * @function - Text capture done
    * @info - Call when message has received by server
    */
    TextCapture.prototype.on_text_capture_done = function( feedback )
    {
        console.log( this.all_text_capture[ feedback.name ] );
        this.all_text_capture[ feedback.name ].item.value = feedback.value;

    }

    /*------------------------------------------------------
    * @function - lookup
    * @info - Find elms with data-(textcapture) add the this to object
    */
    TextCapture.prototype.lookup = function()
    {
        /* -- Get names -- */
        var lookup       = document.querySelectorAll('[data-cwc-textcapture]');
        var lookup_count = lookup.length;

        for( var i = 0; i < lookup_count; i++ )
        {
            var name = lookup[ i ].dataset.cwcTextcapture;

            /* -- Listen out for event -- */
            lookup[ i ].addEventListener("focus", function(){
                cwc.TextCapture.prototype.run_on_controller(
                    this.dataset.cwcTextcapture
                );
            });

            /* -- Save the item -- */
            this.all_text_capture[ name ] = {
                item         : lookup[ i ],
                instructions : this.instructions( lookup[ i ] )
            };
        };

    };

    /*------------------------------------------------------
    * @function - Instructions
    * @info     - Check for any instructions bound to object
    */
    TextCapture.prototype.instructions = function( item )
    {
        var tax = 'data-cwc-instructions'

        /* -- Search for nav end instructions -- */
        if( item.hasAttribute( tax )  )
        {
            return JSON.parse(
                item.getAttribute( tax )
            );
        }

        return null;

    };

    /*------------------------------------------------------
    * @function - Run on controller
    * @info - When invoked, call the controller
    */
    TextCapture.prototype.run_on_controller = function( name )
    {
        var placeholder = name;

        if( this.all_text_capture[ name ].instructions != null )
        {
            if( this.all_text_capture[ name ].instructions.hasOwnProperty( 'controller-placeholder' ) )
            {
                placeholder = this.all_text_capture[ name ].instructions['controller-placeholder'];
            }
        }

        console.log('here');

        cwc.Hooks.prototype.invoke({
            hook_name : 'c-hook:cwc:text-capture-invoked',
            arguments : {
                name        : name,
                placeholder : placeholder
            }
        });

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(TextCapture, 'TextCapture');

}( window.cwc );

