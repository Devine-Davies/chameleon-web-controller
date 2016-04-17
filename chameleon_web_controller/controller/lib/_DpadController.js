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

            /* -- Find all btns associated with controller -- */
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
    * @info - Find all btns associated with controller
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
    * @info - Users is intracting with controller
    */
    DPadController.prototype.button_invoked = function( c_id, a_id )
    {
        var action       = this.all_controllers[ c_id ].actions[ a_id ];
        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- Check to see if action can be indertfyed -- */
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