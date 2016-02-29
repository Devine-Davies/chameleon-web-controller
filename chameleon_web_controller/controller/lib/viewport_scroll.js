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


!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function EnableDpad( extend )
    {
        cwc.registerPlugin(this, 'EnableDpad');

        this.controller_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    EnableDpad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller',
            btn        : 'data-cwc-cbtn',
        }

    };

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    EnableDpad.prototype.events = {
            /* -- D & right -- */
            68 : function(){  },
            39 : function(){  },

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    EnableDpad.prototype.all_dpads = [];

    EnableDpad.prototype.controller_lookup = function()
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

            this.all_dpads[ c_id ] = {
                container : controllers[ c_id ],
                actions   : actions
            };

        };


        console.log(
            this.all_dpads
        );

    }

   /*------------------------------------------------------
    * @function - Navitems lookup
    * @info - Find elms with data-(navitem) add the this to object
    * @return - true : false
    */
    EnableDpad.prototype.controller_actions_lookup = function( group, c_id )
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

            action.onclick = function(  ){
                 cwc.EnableDpad.prototype.button_invoked(
                    this.c_id,
                    this.a_id
                )
            };

            actions.push( action )
        }

        return actions;

    };

     EnableDpad.prototype.button_invoked = function( c_id, a_id )
     {
        var action = this.all_dpads[c_id].actions[a_id];

        /* -- check to see if user set starting pint -- */
        this.validate_action (
            action.getAttribute( this.taxonomy.data.btn )
        );

     }

     EnableDpad.prototype.validate_action = function( type )
     {
        switch( type )
        {
            case 'up' :
            this.send_actions_to_first_screen( type );
            break;

            case 'right' :
            this.send_actions_to_first_screen( type );
            break;

            case 'down' :
            this.send_actions_to_first_screen( type );
            break;

            case 'left' :
            this.send_actions_to_first_screen( type );
            break;
        }

     }

     EnableDpad.prototype.send_actions_to_first_screen = function( action )
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
    cwc.plugin(EnableDpad, 'EnableDpad');

}( window.cwc );