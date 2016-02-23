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