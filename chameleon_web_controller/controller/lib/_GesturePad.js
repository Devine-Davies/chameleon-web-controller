/*------------------------------------------------------
 GesturePadController
 ------------------------------------------------------
 * Hammer.js was used thought the build of this component,
 * special thanks to the awesome developers at http://hammerjs.github.io/
 ------------------------------------------------------
 * What to talk about
 ------------------------------------------------------
 • Different directions
 • About return types (angle, dir, coords, CD)
 • Talk about design
 • Input filters
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
    function GesturePadController( extend )
    {
        cwc.registerPlugin(this, 'GesturePadController');

        this.lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    GesturePadController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller="gesture-pad"'
        }
    };

    /*------------------------------------------------------
    * @object - All controllers
    * @info   - Keep and record of all controllers found
    */
    GesturePadController.prototype.all_controllers = [];

    /*------------------------------------------------------
    * @object - Tracking
    * @info   - Holds the index of the controller in use
    */
    GesturePadController.prototype.tracking = null;

    /*------------------------------------------------------
    * @function - Lookup
    * @info     - Finds all pullbars within the DOM
    */
    GesturePadController.prototype.lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        console.log( controllers_count );

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
            this.all_controllers.push({
                controller   : controller,
                instructions : instructions
            });

            /* -- If the movement has been set to pull, then call the users function -- */
            if( this.get_movement_type( c_id ) == 'swipe' )
            {
                mc.add( new Hammer.Swipe({
                    threshold: 0
                }) );

                mc.on("swipe", function( ev ) {
                    cwc.GesturePadController.prototype.on_move( ev );
                });
            }

            else if( this.get_movement_type( c_id ) == 'pan' )
            {
                mc.add(new Hammer.Pan({
                    domEvents: true, threshold: 4, pointers: 0
                } ) );

                mc.on("panmove panstart panend", function( ev ){
                    cwc.GesturePadController.prototype.on_move( ev );
                });
            }
        };

    };

    /*------------------------------------------------------
    * @function - Get movement type
    * @info     - Find the movement type given by user
    */
    GesturePadController.prototype.get_movement_type = function( c_id )
    {
        /* -- get the instructions for the current analog -- */
        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- Check the type of movement -- */
        if( instructions.hasOwnProperty( 'movement-type' ) )
        {
            switch( instructions['movement-type'] )
            {
                case  'pan'  :
                case  'swipe':
                return instructions['movement-type'];
                break;
            }
        }

        return 'swipe';

    };

    /*------------------------------------------------------
    * @function - On Move
    * @info     - User is instructions with controller
    */
    GesturePadController.prototype.on_move = function( ev )
    {
        var c_id = ( ev.target.dataset.cid == undefined )? this.tracking : ev.target.dataset.cid;

        console.log( c_id );

        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- Feed back information -- */
        var input_data = cwc.ControllerMaster.prototype.get_input_data(
            ev, 'GesturePadController', instructions
        );

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook(
            'on-move', instructions, input_data
        );

        this.tracking = c_id;

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(GesturePadController, 'GesturePadController');

}( window.cwc, Hammer );