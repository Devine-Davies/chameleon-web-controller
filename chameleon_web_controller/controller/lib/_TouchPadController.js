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
    function TouchPadController( extend )
    {
        cwc.registerPlugin(this, 'TouchPadController');

        this.lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller="touchpad"'
        }
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.all_TouchPadControllers = [];

    /*------------------------------------------------------
    * @object - Tracking
    * @info - Keep and drecord of all found nav elms
    */
    TouchPadController.prototype.tracking = null;

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.lookup = function()
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
            this.all_TouchPadControllers.push({
                pad          : controller,
                instructions : instructions
            });

            /* -- If the movment has been set to pull, then call the users function -- */
            if( this.get_movment_type( c_id ) == 'swipe' )
            {
                mc.add( new Hammer.Swipe({
                    threshold: 0
                }) );

                mc.on("swipe", function( ev ) {
                    cwc.TouchPadController.prototype.on_move( ev );
                });
            }

            else if( this.get_movment_type( c_id ) == 'pan' )
            {
                mc.add(new Hammer.Pan({
                    domEvents: true, threshold: 4, pointers: 0
                } ) );

                mc.on("panmove panstart panend", function( ev ){
                    cwc.TouchPadController.prototype.on_move( ev );
                });
            }
        };

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    */
    TouchPadController.prototype.get_movment_type = function( c_id )
    {
        /* -- get the insrtuctions for the current analog -- */
        var instructions = this.all_TouchPadControllers[ c_id ].instructions;

        /* -- Check the type of movment -- */
        if( instructions.hasOwnProperty( 'movement-type' ) )
        {
            if( instructions['movement-type'] == 'pan' )
            {
                return instructions['movement-type'];
            }
            else
            {
                return 'swipe';
            }
        }
        else
        {
            return 'swipe';
        }

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.on_move = function( ev )
    {
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_TouchPadControllers[ c_id ].pad;
        var instructions = this.all_TouchPadControllers[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.ControllerMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( ev.deltaX ),
            y : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( ev.deltaY )
        };

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.ControllerMaster.prototype.get_moving_direction(
            delta
        );

        cwc.ControllerMaster.prototype.invoke_hook

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'on-touch', instructions, {
            cardinal_direction : cardinal_direction,
            coordinate         : coordinate,
            in_out             : in_out
        } );

        this.tracking = c_id;

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.validate_action = function( type )
    {
        var dirs = {
           8   : 'up',
           4   : 'right',
           16  : 'down',
           2   : 'left',
           500 : 'enter'
        };

        // -- Send the action to the main screen --
        this.send_actions_to_first_screen(
            dirs[ type ]
        );

    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    TouchPadController.prototype.send_actions_to_first_screen = function( action )
    {
        console.log( action );

        cwc.Server.prototype.send_message({
            recipient : 'display',
            action    : 'move navigation',
            arguments : action
        });

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(TouchPadController, 'TouchPadController');

}( window.cwc, Hammer );