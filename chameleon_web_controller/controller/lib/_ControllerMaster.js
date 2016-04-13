/*------------------------------------------------------
 * Controller Master
 *------------------------------------------------------
 * Talk About
 -------------------------------------------------------
 • Centralising functions to allow shared code to reduce
   development time from the lack of writing repetitive
   code
 -------------------------------------------------------
*/


!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ControllerMaster( extend )
    {
        cwc.registerPlugin(this, 'ControllerMaster');
    };

    /*------------------------------------------------------
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    ControllerMaster.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'
    };

    /*------------------------------------------------------
    * @object - Last Posistion
    * @info - this will allow to determan
    */
    ControllerMaster.prototype.last_delta_pos = {
        x : 0,
        y : 0
    };

    /*------------------------------------------------------
    * @function - Tag all with id
    * @info - Will update the tracking system for next items and groups
    */
    ControllerMaster.prototype.tag_all_with_id = function ( elm, c_id )
    {
        elm.dataset.cid = c_id;

        var child_elms = elm.getElementsByTagName("*");
        var child_elms_count = child_elms.length;

        for( var i = 0; i < child_elms_count; i ++ )
        {
            var child_elm = child_elms[ i ];
                child_elm.dataset.cid = c_id;
        }
    }

    /*------------------------------------------------------
    * @function - Update nav tracking
    * @info - Will update the tracking system for next items and groups
    */
    ControllerMaster.prototype.fetch_instructions = function( elm )
    {
        var tax = 'data-cwc-instructions';

        /* -- Search for nav end inftructions-- */
        if( elm.hasAttribute( tax )  )
        {
            return JSON.parse(
                elm.getAttribute( tax )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info : angle 0 :  180 is converted 180-360
    * @info : angle 0 : -180 is converted 0-180
    */
    ControllerMaster.prototype.calculate_axis_as_cardinal_direction = function( angle )
    {
        /* -- Negative number -- */
        if( angle < 0 ) { angle = ( 180 - Math.abs( angle ) ); }

        /* -- Posative number -- */
        else { angle = (180 + angle); }

        var directions = ["W", "NW", "N", "NE", "E", "SE", "S", "SW", "W"];
        var d_count    = 360 / (directions.length - 1);

        var index      = Math.floor( ((angle -22.5 ) % 360) / d_count );
        return directions[ index + 1 ];

    };

    /*------------------------------------------------------
    * @function - Calculate axis as coordinate
    * @info - Retuns UE Editor like feedback for controller
    */
    ControllerMaster.prototype.calculate_axis_as_coordinate = function( z )
    {
        var int = Math.round( (z / 100) * 10 ) / 10;
        return this.clamp( (int * 2), -1, 1 );

    };

    /*------------------------------------------------------
    * @function - Clamp
    * @info - restricted the threshold of movemnt
    */
    ControllerMaster.prototype.clamp = function(num, min, max)
    {
      return num < min ? min : num > max ? max : num;
    }

    /*------------------------------------------------------
    * @function - Get moving direction
    * x : ( in || out )
    * y : ( in || out )
    */
    ControllerMaster.prototype.get_moving_direction = function( delta )
    {
        /* -- Find out what direction we are moving in -- */
        function check( z, z1 ) {
            if( ( Math.abs( z ) > Math.abs( z1 ) ) )       { return 'in';     }
            else if( ( Math.abs( z ) == Math.abs( z1 ) ) ) { return 'static'; }
            else                                           { return 'out';    }
        }

        /* -- Get our direction -- */
        var dir = {
            x : check(  Math.abs( this.last_delta_pos.x ), Math.abs( delta.x ) ),
            y : check(  Math.abs( this.last_delta_pos.y ), Math.abs( delta.y ) )
        }

        /* -- Record the movment -- */
        this.last_delta_pos = delta;

        /* -- Return the values -- */
        return dir;

    };

    /*------------------------------------------------------
    * @function - invoke hook
    * @info - used to invoke call back hook functions
    */
    ControllerMaster.prototype.invoke_hook = function( hook, instructions, arg )
    {
        if( instructions.hasOwnProperty( hook ) )
        {
            cwc.Hooks.prototype.invoke(  {
                name      : instructions[ hook ],
                arguments : arg
            } );
        }

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ControllerMaster, 'ControllerMaster');

}( window.cwc );