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