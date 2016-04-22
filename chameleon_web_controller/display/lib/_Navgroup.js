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