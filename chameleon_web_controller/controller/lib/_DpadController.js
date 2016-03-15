/*------------------------------------------------------
 Directional pad
 ------------------------------------------------------
 * What to talk about
 ------------------------------------------------------
 • Diffrent directions
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
    * @obj
    * To store all data and class names
    */
    DPadController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=dpad',
            btn        : 'data-cwc-cbtn',
        }

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    DPadController.prototype.all_DPadControllers = [];

    DPadController.prototype.controller_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var controller = controllers[ c_id ];

            /* -- Find all item in group -- */
            var actions = this.controller_actions_lookup(
                controllers[ c_id ], c_id
            );

            this.all_DPadControllers[ c_id ] = {
                container     : controller,
                actions       : actions,
                instructions  : cwc.ControllerMaster.prototype.fetch_instructions( controller )
            };

        };

    }

   /*------------------------------------------------------
    * @function - Navitems lookup
    * @info - Find elms with data-(navitem) add the this to object
    * @return - true : false
    */
    DPadController.prototype.controller_actions_lookup = function( group, c_id )
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

                mc.on("tap", function( ev ){
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

    DPadController.prototype.button_invoked = function( c_id, a_id )
    {
        var action       = this.all_DPadControllers[ c_id ].actions[ a_id ];
        var instructions = this.all_DPadControllers[ c_id ].instructions;

        /* -- Check to see if action can be indertfyed -- */
        if(! action.hasAttribute( 'data-cwc-cbtn' ) )
            return;

        /* -- Validate action -- */
        switch( action.getAttribute( 'data-cwc-cbtn' ) )
        {
            case 'up'     :
            var info = {
                direction          : 'UP',
                cardinal_direction : 'N',
                angle              : 0,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'right'  :
            var info = {
                direction          : 'RIGHT',
                cardinal_direction : 'E',
                angle              : 90,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'down'   :
            var info = {
                direction          : 'DOWN',
                cardinal_direction : 'S',
                angle              : 180,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'left'   :
            var info = {
                direction          : 'LEFT',
                cardinal_direction : 'W',
                angle              : 270,
                in_out             : { x : 'out', y : 'out' }
            }
            break;

            case 'enter'  :
            info = {
                direction : 'ENTER',
            }
            break;
        }

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'on-tap', instructions, info );
    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(DPadController, 'DPadController');

}( window.cwc, Hammer );