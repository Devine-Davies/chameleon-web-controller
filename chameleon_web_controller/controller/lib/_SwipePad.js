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
    function SwipePad( extend )
    {
        cwc.registerPlugin(this, 'SwipePad');

        this.swipe_pad_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    SwipePad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=swipe-pad'
        }

    };


    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    SwipePad.prototype.all_swipe_pad = [];

    SwipePad.prototype.swipe_pad_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var hammertime_h = new Hammer(controllers[ c_id ], {});
            var hammertime_v = new Hammer(controllers[ c_id ], {});

            /* -- Tap -- */
            hammertime_h.on('tap', function(ev) {
                SwipePad.prototype.validate_action( 500 );
            });

            /* -- Add horazontal -- */
            hammertime_h.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
            });

            /* -- Add vertical -- */
            hammertime_v.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
            hammertime_v.on('swipe', function(ev) {
                SwipePad.prototype.validate_action( ev.direction );
            });
        };

    }

     SwipePad.prototype.validate_action = function( type )
     {
        var dirs = {
           8   : 'up',
           4   : 'right',
           16  : 'down',
           2   : 'left',
           500 : 'enter'
        };

        console.log( type )

        // -- Send the action to the main screen --
        this.send_actions_to_first_screen(
            dirs[ type ]
        );

     }

     SwipePad.prototype.send_actions_to_first_screen = function( action )
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
    cwc.plugin(SwipePad, 'SwipePad');

}( window.cwc, Hammer );