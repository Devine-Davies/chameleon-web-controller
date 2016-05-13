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
    function QuickButtons( extend )
    {
        cwc.registerPlugin(this, 'QuickButtons');

        this.lookup();
    };

    /*------------------------------------------------------
    * @object - All controllers
    * @info   - Keep and record of all controllers found
    */
    QuickButtons.prototype.all_buttons = {};

    /*------------------------------------------------------
    * @function - Lookup
    * @info     - Finds all pullbars within the DOM
    */
    QuickButtons.prototype.lookup = function()
    {
        /* -- Get names -- */
        var buttons       = document.querySelectorAll('[data-cwc-quickbutton]');
        var buttons_count = buttons.length;

        for( var id = 0; id < buttons_count; id++ )
        {
            var button      = buttons[ id ];
            var button_name = button.getAttribute('data-cwc-quickbutton')

                button.c_id = id;

            var instructions = cwc.ControllerMaster.prototype.fetch_instructions( button );

            var mc = new Hammer.Manager( button );
                mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
                mc.add(new Hammer.Tap());

                mc.on("tap", function( ev ) {
                    cwc.QuickButtons.prototype.button_invoked( ev.target );
                });

            /* -- Add the touch pad -- */
            this.all_buttons[ button_name ] = {
                buttons      : button,
                instructions : instructions
            };
        };

        console.log('Quick Btuttons');
        console.log( this.all_buttons );

    };
    /*------------------------------------------------------
    * @function - On Move
    * @info     - User is instructions with controller
    */
    QuickButtons.prototype.button_invoked = function( elm )
    {
        var button = cwc.ControllerMaster.is_elm(
            elm, 'data-cwc-quickbutton'
        );

        var button_name = button.getAttribute( 'data-cwc-quickbutton' );

        console.log( button_name );

        var instructions = this.all_buttons[ button_name ].instructions;
            console.log( instructions );

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook(
            'on-tap', instructions, 'Quick button'
        );

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(QuickButtons, 'QuickButtons');

}( window.cwc, Hammer );