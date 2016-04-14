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
//@codekit-append "_Navigation.js"
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
* @object - TODO
* @OnFail - Would like to pass message down on why it faild
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
        /* -- register the plugin -- */
        cwc.registerPlugin(this, 'Server');

        /* -- connect to the host via web sockets -- */
        this.connection_options = options;

    };

    /*------------------------------------------------------
    * @object - Clinet key
    * @info   - Key given to clinet by server
    */
    Server.prototype.clinet_key = '';

    /*------------------------------------------------------
    * @object - Cluster code
    * @info   - Code used to connect displays
    */
    Server.prototype.cluster_code = '';

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

        /* -- Allow our cwc object to be reatch at the _global scope -- */
        if( socket )
        {
            /* -- Creat callback for class -- */
            this.create_reserved_connection_status_hooks();

            /* -- Set global connection  -- */
            cwc._server_connection = socket;
        }

        /* -- Set appropiat socket evetn's -- */
        if( socket && type == 'ws' )
        {
            this.set_connection_events();
        }

    };

    /*------------------------------------------------------
    * @function - Create hooks
    * @info - Connect to the server
    */
    Server.prototype.create_reserved_connection_status_hooks = function( length )
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          hook_name : 'connection-success',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_success( feedback );
        } } );

        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          hook_name : 'connection-failed',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_faild( feedback );
        } } );

    };

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.gen_cluster_code = function( length  )
    {
        var min = 10000;
        var max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.build_ws_connection = function( host, port )
    {
        var cluster_code  = this.cluster_code;
        var clinet_type   = cwc._cwc_type;

        return 'ws:' + host + ':'+ port +
        '?cluster_code=' + cluster_code +
        '&clinet_type='  + clinet_type;

    };

    /*------------------------------------------------------
    * @function - On connection success
    * @info     - how to react when connection successfull
    */
    Server.prototype.on_connection_success = function( server_feedback )
    {
        console.log( server_feedback );

        if( cwc._cwc_type  == 'controller' )
        {
            try {
                /* -- Invoke the connection success message -- */
                cwc.Hooks.prototype.invoke({
                    hook_name : 'save-client-data',
                    arguments : server_feedback,
                }, true );
            } catch ( e ) {
                console.log('saved faild');
            }
        }

    };

    /*------------------------------------------------------
    * @function - On greeting message
    * @info     - how to react when connection successfull
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
        cwc._server_connection = null;
    };

    /*------------------------------------------------------
    * @function - On message
    * @info - Server has sent a message
    */
    Server.prototype.onmessage = function( recived_package )
    {
        /* -- Message data -- */
        var hook_info = JSON.parse( recived_package.data );

        /* -- Look at reserved -- */
        cwc.Hooks.prototype.invoke({
            hook_name    : hook_info.hook_name,
            arguments    : hook_info.arguments,
            recipient    : hook_info.recipient,
            cwc_metadata : hook_info.cwc_metadata,
        }, true );

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
        /* -- Is this a valid mesage : return true not valid -- */
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

!function( cwc ){
  'use strict';

    function Hooks( )
    {
        cwc.registerPlugin(this, 'Hooks');
    }

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    Hooks.prototype.all_reserved_hooks = {};

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    Hooks.prototype.all_hooks = {};

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    Hooks.prototype.set_reserved_hook = function( prams )
    {
        this.all_reserved_hooks[ prams.hook_name ] = {
            'hook_name': prams.hook_name,
            'method'   : prams.method
        };

    };

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    Hooks.prototype.set_hook = function( prams )
    {
        this.all_hooks[ prams.hook_name ] = {
            'hook_name' : prams.hook_name,
            'method'    : prams.method
        };

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
                console.log('Server message is not properly fromatted.');
                return false;
            }

        }

        return true;

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    Hooks.prototype.invoke_clinet_hook = function( hook_info )
    {
        /* -- Is this a valid mesage : return true not valid -- */
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
    * @function
    * where we invoke custom methods
    */
    Hooks.prototype.invoke = function( hook_info, reserved )
    {
        /* -- check formatting -- */
        if( hook_info.hasOwnProperty( 'hook_name' ) )
        {
            var hooks = ( reserved )? this.all_reserved_hooks : this.all_hooks;

            /* -- Can be called using hook-*(name) usfull on data attr -- */
            var hook_name = hook_info.hook_name.replace('hook-','')

            if( hooks.hasOwnProperty( hook_name ) )
            {
                try {
                    hooks[ hook_name ].method( hook_info.arguments, hook_info.cwc_metadata )
                } catch( e ) {
                    console.log( e );
                }
            }
        }

    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(Hooks, 'Hooks');

}( window.cwc );

/*------------------------------------------------------
 Navigagtion
 ------------------------------------------------------
 To-Do •
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function Navigation( extend )
    {
        cwc.registerPlugin(this, 'Navigation');

        /* -- Update options if are assigned -- */
        this.set_extended_options( extend );

        /* -- Ser for any data attrs in page -- */
        this.reflow();

        if ( this.navgroups_count() > 0 )
        {
            /* -- Add Navigation events -- */
            this.add_window_key_events();

            /* -- Add Server events -- */
            this.add_server_events();
        }

        console.log( this.nav_elms );

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    Navigation.prototype.callbacks = {
        onnav_changed    : function(){},
        onitem_changed   : function(){}
    }

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    Navigation.prototype.taxonomy = {
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
    * @info - away of tracking last and previous nav items
    */
    Navigation.prototype.tracking = {
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
    * @info - Keep and drecord of all found nav elms
    */
    Navigation.prototype.nav_elms = {

    };

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    Navigation.prototype.keys = {
            /* -- ESC -- */
            27 : function(){ },

            /* -- Enter -- */
            13 : function(){ cwc.Navigation.prototype.key_function( 'enter' ) },
            32 : function(){ cwc.Navigation.prototype.key_function( 'enter' ) },

            /* -- W & up -- */
            87 : function(){ cwc.Navigation.prototype.key_function( 'up' ) },
            38 : function(){ cwc.Navigation.prototype.key_function( 'up' ) },

            /* -- S & down -- */
            83 : function(){ cwc.Navigation.prototype.key_function( 'down' ) },
            40 : function(){ cwc.Navigation.prototype.key_function( 'down' ) },

            /* -- A & left -- */
            65 : function(){ cwc.Navigation.prototype.key_function( 'left' ) },
            37 : function(){ cwc.Navigation.prototype.key_function( 'left' ) },

            /* -- D & right -- */
            68 : function(){ cwc.Navigation.prototype.key_function( 'right' ) },
            39 : function(){ cwc.Navigation.prototype.key_function( 'right' ) },

    };

    /*------------------------------------------------------
    * @function - Set extended options
    * @info - Combines the global extend object with this options object
    * allowing further extended options
    */
    Navigation.prototype.set_extended_options = function ( extend )
    {
        if( extend )
        {
            /* -- extend users options classes --- */
            if( extend.hasOwnProperty( 'classes' ) )
            {
                this.taxonomy.classes = Object.assign(
                    this.taxonomy.classes,
                    extend.classes
                );
            }

            /* -- extend users options callbacks --- */
            if( extend.hasOwnProperty( 'callbacks' ) )
            {
                this.callbacks = Object.assign(
                    this.callbacks,
                    extend.callbacks
                );
            }
        }

    };

    /*------------------------------------------------------
    * @function - Navgroups lookup
    * @info - Find elms with data-(group) add the this to object
    */
    Navigation.prototype.reflow = function()
    {
        /* -- Get names -- */
        var nav_groups       = document.querySelectorAll('['+ this.taxonomy.data.group +']');
        var nav_groups_count = nav_groups.length;

        for( var g_id = 0; g_id < nav_groups_count; g_id++ )
        {
            var g_name = nav_groups[ g_id ].dataset.cwcNavgroup;

            /* -- Find all item in group -- */
            var navitems = this.navitems_lookup(
                nav_groups[ g_id ], g_id, g_name
            );

            /* -- Find instructions -- */
            var instructions = this.navgroups_instructions(
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
    Navigation.prototype.navitems_lookup = function( group, g_id, g_name )
    {
        var descendents     = group.getElementsByTagName('*');
        var descendents_len = descendents.length;

        var g_name = group.dataset.cwcNavgroup;

        var items = [
        ];

        var tracking = null;

        for( var i_id = 0; i_id < descendents_len; i_id++ )
        {
            var item = descendents[ i_id ];

            var check = {
                /* -- is elm       -- */
                one : item.nodeType == 1,

                /* -- has nav item -- */
                two : item.hasAttribute( this.taxonomy.data.item ),

                /* -- check to see if user set starting pint -- */
                three : (item.getAttribute( this.taxonomy.data.item ) == this.taxonomy.data.starting)
            };

            if( check.one && check.two )
            {
                /* -- store found items -- */
                var item_obj = {
                    item      : item,
                    overrides : this.item_overrides( item )
                };

                items.push( item_obj );

                /* -- Up date the current group and index -- */
                if( check.three )
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
    * @function - Update nav tracking
    * @info     - Will update the tracking system for next items and groups
    */
    Navigation.prototype.ng_append_item = function( item, g_name )
    {
        /* -- Only add if there -- */
        if( this.nav_elms.hasOwnProperty( g_name ) )
        {
            /* -- store item -- */
            this.nav_elms[ g_name ].navitems.push({
                item      : item,
                overrides : this.item_overrides( item )
            });
        }

    };

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info     - Will update the tracking system for next items and groups
    */
    Navigation.prototype.ng_remove_item = function( index, g_name )
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
    Navigation.prototype.navgroups_instructions = function( group, g_id, g_name )
    {
        var tax = 'data-cwc-instructions'

        /* -- Search for nav end inftructions-- */
        if( group.hasAttribute( tax )  )
        {
            var instructions = JSON.parse(
                group.getAttribute( tax )
            );

            return instructions;
        }

        return null;

    };

    /*------------------------------------------------------
    * @function - Item overrides
    * @info - look to see if there are override instructions for navigation
    *
    */
    Navigation.prototype.item_overrides = function( item )
    {
        var tax = 'data-cwc-overide'

        /* -- look for data-cwc-item-overide -- */
        if( item.hasAttribute( tax )  )
        {
            /* -- Return overrides -- */
            return JSON.parse(
                item.getAttribute( tax )
            );
        }

        return null;
    };

    /*------------------------------------------------------
    * @function - Navgroups count
    * @return - Found nav count
    */
    Navigation.prototype.navgroups_count = function()
    {
        var count = 0;

        for ( var key in this.nav_elms )
            count++;

        return count;

    };

    /*------------------------------------------------------
    * @function - Total items in group
    * @return - count items in grop : defult current group
    */
    Navigation.prototype.total_items_in_group = function( group_name )
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
    * @info - Add window keybinds for Navigation
    * @condishion set - Only if Navitems found
    */
    Navigation.prototype.add_server_events = function()
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          hook_name : 'move-navigation',
          method    : function( feedback ) {
            cwc.Navigation.prototype.invoke_dir( feedback );
        } } );

    }

    /*------------------------------------------------------
    * @function - Add window key events
    * @info - Add window keybinds for Navigation
    * @condishion set - Only if Navitems found
    */
    Navigation.prototype.add_window_key_events = function()
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
    * @info     - page initialization code here the DOM will be available here
    * Only start the process when the dom is ready
    */
    Navigation.prototype.invoke_dir = function( dir, cb )
    {
        var a_enter  = ['enter', 'select'];
        var a_up     = ['up',    'N', 'NE', 'NW'];
        var a_right  = ['right', 'E', 'NE', 'SE'];
        var a_down   = ['down',  'S', 'SE', 'SW'];
        var a_left   = ['left',  'W', 'NW', 'SW'];

        /* -- Select -- */
        if( a_enter.indexOf( dir ) != -1 )
            this.key_function( 'enter' );

        /* -- up -- */
        if( a_up.indexOf( dir ) != -1 )
            this.key_function( 'up' );

        /* -- right -- */
        if( a_right.indexOf( dir ) != -1 )
            this.key_function( 'right' );

        /* -- down -- */
        if( a_down.indexOf( dir ) != -1 )
            this.key_function( 'down' );

        /* -- left -- */
        if( a_left.indexOf( dir ) != -1 )
            this.key_function( 'left' );

        /* -- If cb has been set then call the function -- */
        if( cb )
        {
            cb( this.tracking.current );
        }

    };

    /*------------------------------------------------------
    * @function - Key function
    * @info     - Wehn key has been pressed : action sent here
    * - up      // pass one of the following n* items as an argument
    * - right   // pass one of the following n* items as an argument
    * - down    // pass one of the following n* items as an argument
    * - left    // pass one of the following n* items as an argument
    * - enter   // pass one of the following n* items as an argument
    * - space   // pass one of the following n* items as an argument
    */
    Navigation.prototype.key_function = function( dir )
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

        var instructions = this.nav_elms[ group_name ].instructions;
        var overrides    = this.nav_elms[ group_name ].navitems[ current_item ].overrides;

        /* -- Check to see if item has overids : before moving -- */
        if( overrides != null )
        {
            if( overrides.hasOwnProperty( dir ) )
            {
                /* -- Get the group overrides -- */
                this.analyse_instructions(
                    overrides[ dir ],
                    c_indexs
                );

                return true;
            }
        }

        /* -- Check to see if instructions has been set on navgroup -- */
        if( instructions != null )
        {
             /* -- Has been set and not null -- */
            if( instructions.hasOwnProperty( dir ) )
            {
                this.analyse_instructions(
                    instructions[ dir ],
                    c_indexs
                );

                return true;
            }
        }

    };

    /*------------------------------------------------------
    * @function - Analyse instructions
    * - ni-next                // next nav item
    * - ni-prev                // previous nav item
    * - ng-next                // next nav group
    * - ng-prev                // previous nav group
    * - ng-*(name)             // name of the group you wish to navigation too
    * - hook-*(custom methord) // add custom methord to end of arg, must be set up in custom methords
    */
    Navigation.prototype.analyse_instructions = function( instruction, c_index )
    {
        /* -- Hook -- */
        if( instruction.indexOf('hook-') > -1 )
        {
            cwc.Hooks.prototype.invoke(  {
                hook_name : instruction,
                arguments : this.tracking.current
            } );

        }

        /* -- Move to item -- */
        else if( instruction.indexOf('ni-') > -1 )
        {
            var action = instruction.replace('ni-','');

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
        else if( instruction.indexOf('ng-') > -1 )
        {
            var action = instruction.replace('ng-','');

            /* -- We know the name of the guoup -- */
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
    Navigation.prototype.move_to_new_nav_index = function( g_id )
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
    Navigation.prototype.move_to_nav_name = function( group_name )
    {
        /* -- Check first -- */
        if( ! this.nav_elms.hasOwnProperty( group_name ) ) {
            return;
        }
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
            if( nav_group.instructions.hasOwnProperty('onnaventrance') )
            {
                this.analyse_instructions(
                    nav_group.instructions['onnaventrance']
                );
            }

        }

        /* -- Run callback function for nav change -- */
        this.callbacks.onnav_changed(
            this.tracking.current
        );

    };

    /*------------------------------------------------------
    * @function - Find best item
    * @info     - Find best object to swap
    */
    Navigation.prototype.find_best_item = function( nav_group )
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
    Navigation.prototype.lookup_history_item = function( nav_group )
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
    Navigation.prototype.on_new_item_update = function( index )
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

        var g_name    = this.tracking.current.g_name;
        var overrides = this.nav_elms[ g_name ].navitems[ index ].overrides;

        this.update_nav_tracking({
            g_id   : this.nav_elms[ g_name ].g_id,
            g_elm  : this.nav_elms[ g_name ].container,
            g_name : g_name,

            i_id  : index,
            i_elm : this.nav_elms[ g_name ].navitems[ index ]
        });

        if( overrides != null )
        {
            /* -- Check for entrance hook -- */
            if( overrides.hasOwnProperty('onitementrance') )
            {
                this.analyse_instructions(
                    overrides['onitementrance']
                );
            }
        }

        /* -- Run callback function for item change -- */
        try {
            this.callbacks.onitem_changed(
                this.tracking.current
            );
        }
        catch(err) {
            console.log( err );
            console.log('All Callbacks are functions');
        };

    };

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info - Will update the tracking system for next items and groups
    */
    Navigation.prototype.update_nav_tracking = function( prams )
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
    Navigation.prototype.highlight_group = function()
    {
        if( this.tracking.previous.g_elm )
        {
            this.tracking.previous.g_elm.classList.remove(
                this.taxonomy.classes.group
            );

            /* -- Record the last visited nav item -- */
            this.tracking.previous.i_elm.item.dataset.lastitem = true;
        }

        if( this.tracking.current.g_elm )
        {
            this.tracking.current.g_elm.classList.add(
                this.taxonomy.classes.group
            );
        }

    };

    /*------------------------------------------------------
    * @function - Highlight item
    * @info - Add highlight class to item
    */
    Navigation.prototype.highlight_item = function()
    {
        if( this.tracking.previous.i_elm )
        {
            this.tracking.previous.i_elm.item.classList.remove(
                this.taxonomy.classes.item
            );
        }

        if( this.tracking.current.i_elm )
        {
            this.tracking.current.i_elm.item.classList.add(
                this.taxonomy.classes.item
            );
        }

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(Navigation, 'Navigation');

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
    function ViewportScroll( scrollTargets )
    {
        cwc.registerPlugin(this, 'ViewportScroll');

        if( scrollTargets.length >= 0 )
        {
            /* -- Save the ids -- */
            this.scroll_target_ids = scrollTargets;

            /* -- Add the server events -- */
            this.add_server_events();

            /* -- Cache each of the elements -- */
            this.cache_targets( );
        }

    };

    /*------------------------------------------------------
    * @array - Save the ids
    * @info - Used to store the id's of each of the elments
    */
    ViewportScroll.prototype.scroll_target_ids = [
        'scroll-target'
    ];

    /*------------------------------------------------------
    * @function - Cached scroll target
    * @info - Save sned elemets here
    */
    ViewportScroll.prototype.cached_scroll_target = [
    ];

    /*------------------------------------------------------
    * @function - Cached scroll target
    * @info - Save all of the elements to optimise and seed up perforamce
    */
    ViewportScroll.prototype.cache_targets = function( )
    {
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
    ViewportScroll.prototype.add_server_events = function()
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          hook_name : 'scroll-viewport',
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

        /* -- Try and find posistion -- */
        var pos =  sti.indexOf(
            args.viewport_target
        );

        /* -- Check posistion -- */
        if( pos != -1 )
        {
            /* -- Get all ids sent to class -- */
            var a_elms = this.cached_scroll_target;

            this.check_action(
                a_elms[ pos ],
                args
            );

        }

    };

    /*------------------------------------------------------
    * @function - Check action
    * @info - and that the actions are good.
    */
    ViewportScroll.prototype.check_action = function( elm, args )
    {
        var ammount = 0;

        if( args.direction == 'down'  )
        {
            elm.scrollTop = elm.scrollTop + args.ammount;
        }

        else if( args.direction == 'up'  )
        {
            elm.scrollTop = elm.scrollTop - args.ammount;
        }

        return;

        var duration = (args.type === 'scroll to' )? 600 : 10;

        this.scroll_to(
            elm, ammount, duration
        );

    };

    /*------------------------------------------------------
    * @function - Scrool to with animation
    * @info - Courtesy of abroz && TimWolla on
    * @info - Animation snippt take from :
    * @info - http://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation
    */
    ViewportScroll.prototype.scroll_to = function(element, to, duration) {
        var start = element.scrollTop,
            change = to - start,
            increment = 20;

        var animateScroll = function(elapsedTime) {
            elapsedTime += increment;
            var position = easeInOut(elapsedTime, start, change, duration);
            element.scrollTop = position;
            if (elapsedTime < duration) {
                setTimeout(function() {
                    animateScroll(elapsedTime);
                }, increment);
            }
        };

        function easeInOut(currentTime, start, change, duration) {
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return change / 2 * currentTime * currentTime + start;
            }
            currentTime -= 1;
            return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
        }

        animateScroll(0);

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

        /* -- Set the hook -- */
        this.set_hooks();

        /* -- Find elms -- */
        this.lookup();
    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    TextCapture.prototype.all_text_capture = [
    ];

    /*------------------------------------------------------
    * @function - Set hooks
    * @info - Set hook for Text Capture done from controller
    */
    TextCapture.prototype.set_hooks = function()
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          hook_name : 'text-capture-done',
          method    : function( feedback ) {
            cwc.TextCapture.prototype.on_text_capture_done(
                feedback
            );
        } } );

    };

    /*------------------------------------------------------
    * @function - Text capture done
    * @info - Call when message has recived by server
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

        /* -- Search for nav end inftructions-- */
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

        Hooks.invoke_clinet_hook({
            recipient : 'controller',
            hook_name : 'text-capture-invoked',
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

