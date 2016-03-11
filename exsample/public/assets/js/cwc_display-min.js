
/* ------------------------------
*  Cwc Display instance
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

/*------------------------------------------------------
* -- Centralised --
*/
//@codekit-append "../../centralised/_functions.js";
//@codekit-append "../../centralised/_Server.js";
//@codekit-append "../../centralised/_ServerMethod.js";
//@codekit-append "../../centralised/_CustomMethod.js";

/*------------------------------------------------------
* -- Display --
*/
//@codekit-append "_Navigation.js"
//@codekit-append "_ViewportScroll.js"


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
        this.navgroups_lookup();

        if ( this.navgroups_count() )
        {
            /* -- Add Navigation events -- */
            this.add_window_key_events();

            /* -- Add Server events -- */
            this.add_server_events();
        }

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
            group_end : 'data-cwc-onnavend',
            group_dir : 'data-cwc-navdir',

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
    Navigation.prototype.all_nav_elms = {
        groups         : [],
        item_overrides : []

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
    Navigation.prototype.navgroups_lookup = function()
    {
        /* -- Get names -- */
        var nav_groups       = document.querySelectorAll('['+ this.taxonomy.data.group +']');
        var nav_groups_count = nav_groups.length;

        for( var g_id = 0; g_id < nav_groups_count; g_id++ )
        {
            /* -- Find all item in group -- */
            var added = this.navitems_lookup(
                nav_groups[ g_id ], g_id
            );

            if( added )
            {
                this.navgroups_instructions(
                    nav_groups[ g_id ], g_id
                );
            };

        };

    };

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info - Will update the tracking system for next items and groups
    */
    Navigation.prototype.navgroups_instructions = function( group, g_id )
    {
        //var tax = this.taxonomy.data.group_end;
        var tax = 'data-cwc-nav-key-instructions'

        /* -- Search for nav end inftructions-- */
        if( group.hasAttribute( tax )  )
        {
            var instructions = JSON.parse(
                group.getAttribute( tax )
            );

            this.all_nav_elms.groups[ g_id ].instructions = instructions;
        }

    };

    /*------------------------------------------------------
    * @function - Navitems lookup
    * @info - Find elms with data-(navitem) add the this to object
    * @return - true : false
    */
    Navigation.prototype.navitems_lookup = function( group, g_id )
    {
        var descendents     = group.getElementsByTagName('*');
        var descendents_len = descendents.length;

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
                items.push( item );

                /* -- Save the item overrides-- */
                this.item_overrides(
                    g_id,

                    /* -- Cannot use i_id out of sync with items (not all our elms) -- */
                    items.length - 1,
                    item
                );

                /* -- Up date the current group and index -- */
                if( check.three )
                {
                    tracking = {
                        g_id   : g_id,
                        g_elm  : group,

                        /* -- Cannot use i_id out of sync with items (not all our elms) -- */
                        i_id  : items.length - 1,
                        i_elm : item,
                    };
                }
            }

        }

        /* -- We have found items ;) -- */
        if( items.length > 1 )
        {
            this.all_nav_elms.groups[ g_id ] = {
                container : group,
                items     : items,
            }

            /* -- user would like to start here -- */
            if( tracking )
            {
                this.update_nav_tracking(
                    tracking
                );
            }

            return true;
        }

        return false;

    };

    /*------------------------------------------------------
    * @function - Item overrides
    * @info - look to see if there are override instructions for navigation
    *
    */
    Navigation.prototype.item_overrides = function( g_id, i_id, item )
    {
        var tax = 'data-cwc-item-overide'

        /* -- look for data-cwc-item-overide -- */
        if( item.hasAttribute( tax )  )
        {
            if(! this.all_nav_elms.item_overrides[ g_id ] )
            {
                this.all_nav_elms.item_overrides[ g_id ] = {};
            }

            /* -- Save overrides -- */
            this.all_nav_elms.item_overrides[ g_id ][i_id] = JSON.parse(
                item.getAttribute( tax )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Navgroups count
    * @return - Found nav count
    */
    Navigation.prototype.navgroups_count = function()
    {
        return this.all_nav_elms.groups.length;

    };

    /*------------------------------------------------------
    * @function - Items in current group count
    * @return - count items in grop : defult current group
    */
    Navigation.prototype.items_in_current_group_count = function( index )
    {
        if( ! index )
        {
            index = this.tracking.current.g_id;
        }

        return this.all_nav_elms.groups[
            index
        ].items.length;

    };

    /*------------------------------------------------------
    * @function - Add window key events
    * @info - Add window keybinds for Navigation
    * @condishion set - Only if Navitems found
    */
    Navigation.prototype.add_server_events = function()
    {
        /* -- Server message -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'move navigation',
            callback : function( action ) {
                cwc.Navigation.prototype.invoke_dir( action );
            }
        } );

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
                // try {
                    $keys[key]()
                    event.preventDefault();
                // }
                // catch(err) {
                //     console.log('Only callback functions');
                // };
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
    * - up    // pass one of the following n* items as an argument
    * - right // pass one of the following n* items as an argument
    * - down  // pass one of the following n* items as an argument
    * - left  // pass one of the following n* items as an argument
    * - enter // pass one of the following n* items as an argument
    * - space // pass one of the following n* items as an argument
    */
    Navigation.prototype.key_function = function( dir )
    {
        var curren_group = this.tracking.current.g_id;
        var curren_item  = this.tracking.current.i_id;

        /* -- Clone the index -- */
        var c_indexs = {
            group : JSON.parse(JSON.stringify( curren_group )),
            item  : JSON.parse(JSON.stringify( curren_item  )),
        }

        var item_overrides = this.all_nav_elms.item_overrides;

        /* -- Check to see if overrides has been set on item -- */
        if( item_overrides.hasOwnProperty( curren_group ) )
        {
            if( item_overrides[curren_group].hasOwnProperty( curren_item ) )
            {
                if( item_overrides[curren_group][ curren_item ][ dir ] )
                {
                    /* -- Get the group overrides -- */
                    this.analyse_instructions(
                        item_overrides[curren_group][ curren_item ][dir],
                        c_indexs
                    );

                    return true;
                }
            }
        }

        /* -- Check to see if instructions has been set on navgroup -- */
        if( this.all_nav_elms.groups[ curren_group ].hasOwnProperty( 'instructions' ) )
        {
            /* -- Get the group instructions -- */
            var instructions = this.all_nav_elms.groups[ curren_group ].instructions;

            /* -- Has been set and not null -- */
            if( instructions.hasOwnProperty( dir ) && instructions[dir] )
            {
                this.analyse_instructions(  instructions[dir], c_indexs )

                return true;
            }
        }

    };

    /*------------------------------------------------------
    * @function - Analyse instructions
    * - ni-next              // next nav item
    * - ni-prev              // previous nav item
    * - ng-next              // next nav group
    * - ng-prev              // previous nav group
    * - ng-*(index)          // index number of the group you wish to navigation too
    * - cm-*(custom methord) // add custom methord to end of arg, must be set up in custom methords
    */
    Navigation.prototype.analyse_instructions = function( instruction, c_index )
    {
        if(  instruction.indexOf('cm-') > -1 )
        {
            var action = instruction.replace('cm-','');
            cwc.CustomMethod.prototype.call_method(  {
                method    : action,
                arguments : this.tracking.current
            } );
        }

        else if( instruction.indexOf('ni-') > -1 )
        {
            var action = instruction.replace('ni-','');

            /* -- The user is trying to update item -- */
            if( action == 'next' || action == 'prev' )
            {
                if((action == 'next'))
                {
                    this.on_new_item_update( c_index.item += 1  );
                }
                else
                {
                    this.on_new_item_update( c_index.item -= 1 );
                }
            }
        }

        /* -- The user is trying to update group -- */
        else if( instruction.indexOf('ng-') > -1 )
        {
            var action = instruction.replace('ng-','');

            /* -- The user is trying to update item -- */
            if( action == 'next' || action == 'prev' )
            {
                if((action == 'next'))
                {
                    this.on_new_nav( c_index.group += 1  );
                }
                else
                {
                    this.on_new_nav( c_index.group -= 1 );
                }
            }

            /* -- Were looking for a int : check constraints -- */
            else if( action > -1 && action < this.navgroups_count( parseInt( action ) ) )
            {
                /* -- Get int and update -- */
                this.on_new_nav(
                    parseInt( action )
                );
            }
        }

    };

    /*------------------------------------------------------
    * @function - On new nav
    * @info     - Change to new nav item
    */
    Navigation.prototype.on_new_nav = function( g_id )
    {
        /* -- Nav constraints -- */
        var constraint = {
            under : (g_id <= -1),
            over  : (g_id == this.navgroups_count()),
        }

        if( constraint.under )
        {
            g_id = this.navgroups_count();
        }

        else if ( constraint.over )
        {
            g_id = 0;
        }

        var new_group = this.all_nav_elms.groups[ g_id ].container;
        var tax       = 'data-cwc-onnaventrance';

        if( new_group.hasAttribute( tax ) )
        {
            var c_item = this.lookup_history_item(
                g_id
            );
        }
        else
        {
            var c_item = this.find_best_item(
                g_id
            );
        }

        /* -- Update the tracking process -- */
        this.update_nav_tracking({
            g_id  : g_id,

            g_elm : this.all_nav_elms.groups[ g_id ].container,

            i_id  : c_item.i_id,

            i_elm : c_item.i_elm
        });

        /* -- Run callback function for nav change -- */
        this.callbacks.onnav_changed(
            this.tracking.current
        );

    };

    Navigation.prototype.find_best_item = function( g_id )
    {
        var current_group = this.all_nav_elms.groups[ g_id ];
        var current_item  = this.tracking.current.i_id;
        var limit         = current_group.items.length;
        var return_obj    = {};

        var i_id          = 0;

        var constraint = {
            higher      : ( current_item < limit ),
            go_higgher  : ( ( limit - current_item ) == 0  ),
            // pick_a_side : will need developing.
        }

        /* -- Logic -- */
        if( constraint.higher  )
        {
            i_id = current_item;
        }

        /* -- Go higgher -- */
        if(  constraint.go_higgher  )
        {
            i_id = limit - 1;
        }

        return return_obj = {
            i_id  : i_id,
            i_elm : current_group.items[ i_id ]
        }

    };

    /*------------------------------------------------------
    * @function - Lookup history item
    * @info     - Change to new nav item
    */
    Navigation.prototype.lookup_history_item = function( g_id )
    {
        var current_group_items = this.all_nav_elms.groups[ g_id ];
        var limit               = current_group_items.items.length;
        var tax                 = 'data-lastitem'

        var return_obj = {};

        for( var i = 0; i < limit; i++ )
        {
            var item = current_group_items.items[i];

            if( item.hasAttribute( tax ) )
            {
                return_obj = {
                    i_id  : i,
                    i_elm : current_group_items.items[i]
                }

                break;
            }
            else
            {
                return_obj = {
                    i_id  : 0,
                    i_elm : current_group_items.items[0]
                }
            }

        }

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
            last  : ( index >= this.items_in_current_group_count( ) )
        }

        if( collision.first )
        {
            index = this.items_in_current_group_count( ) - 1;
        }

        if( collision.last )
        {
            index = 0;
        }

        var g_id = this.tracking.current.g_id;

        this.update_nav_tracking({
            g_id  : g_id,
            g_elm : this.all_nav_elms.groups[ g_id ].container,

            i_id  : index,
            i_elm : this.all_nav_elms.groups[ g_id ].items[ index ]
        });

        /* -- Run callback function for item change -- */
        try {
            this.callbacks.onitem_changed(
                this.tracking.current
            );
        }
        catch(err) {
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
            this.tracking.previous.i_elm.dataset.lastitem = true;
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
            this.tracking.previous.i_elm.classList.remove(
                this.taxonomy.classes.item
            );
        }

        if( this.tracking.current.i_elm )
        {
            this.tracking.current.i_elm.classList.add(
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
        /* -- Server message -- */
        cwc.ServerMethod.prototype.create_method( {
            action   : 'scroll viewport',
            callback : function( args ) {
                cwc.ViewportScroll.prototype.start_scroll_process(
                    args
                );
            }
        } );

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
        //console.log( args );

        var ammount  = elm.scrollTop + (args.ammount || 10)
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
    }


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ViewportScroll, 'ViewportScroll');

}( window.cwc );

