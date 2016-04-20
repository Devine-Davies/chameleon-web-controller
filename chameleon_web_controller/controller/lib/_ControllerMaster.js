/*------------------------------------------------------
 * Controller Master
 * ------------------------------------------------------
 * Dependencies
 * ------------------------------------------------------
 * Hammer.js was used thought the build of this component,
 * special thanks to the awesome developers at http://hammerjs.github.io/
 * ------------------------------------------------------
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
    * @info   - Take from the hammer is spec
    */
    ControllerMaster.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'
    };

    /*------------------------------------------------------
    * @object - Last Position
    * @info - this will allow to determine
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
    * @info : Will update the tracking system for next items and groups
    */
    ControllerMaster.prototype.fetch_instructions = function( elm )
    {
        var tax = 'data-cwc-instructions';

        /* -- Search for nav end instructions-- */
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
    ControllerMaster.prototype.calculate_compass_rose = function( angle )
    {
        /* -- Negative number -- */
        if( angle < 0 ) { angle = ( 180 - Math.abs( angle ) ); }

        /* -- Positive number -- */
        else { angle = (180 + angle); }

        var directions = ["W", "NW", "N", "NE", "E", "SE", "S", "SW", "W"];
        var d_count    = 360 / (directions.length - 1);

        var index      = Math.floor( ((angle -22.5 ) % 360) / d_count );
        return directions[ index + 1 ];

    };

    /*------------------------------------------------------
    * @function - Calculate Cartesian coordinates
    * @info - Reruns UE Editor like feedback for controller
    */
    ControllerMaster.prototype.calculate_cartesian_coordinates = function( z )
    {
        var int = Math.round( (z / 100) * 10 ) / 10;
        return this.clamp( (int * 2), -1, 1 );

    };

    /*------------------------------------------------------
    * @function - Clamp
    * @info - restricted the threshold of movement
    */
    ControllerMaster.prototype.clamp = function(num, min, max)
    {
      return num < min ? min : num > max ? max : num;
    }

    /*------------------------------------------------------
    * @function - Calculate axis direction
    * x : ( in || out )
    * y : ( in || out )
    */
    ControllerMaster.prototype.calculate_axis_direction = function( delta )
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

        /* -- Record the moment -- */
        this.last_delta_pos = delta;

        /* -- Return the values -- */
        return dir;

    };

    /*------------------------------------------------------
    * @function - Get input data
    * @info     - builds the return data object to feed back to user
    */
    ControllerMaster.prototype.get_input_data = function( ev, controller_name, instructions )
    {
        var input_data  = {};

        /* -- Check to see if user has restricted retired input data -- */
        var input_r = ( instructions && instructions.hasOwnProperty('input-r') )? instructions['input-r'].split("|") : 'all-input-data';

        /* -- Direction -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("direction") != -1) )
        {
            input_data.direction = cwc.ControllerMaster.prototype.hammer_dirs[ ev.direction ];
        }

        /* -- Delta -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("delta") != -1) )
        {
            input_data.delta = ev.delta;
        }

        /* -- Angle -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("angle") != -1) )
        {
            input_data.angle = ev.angle;
        }

        /* -- Compass Rose -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("compass_rose") != -1) )
        {
            input_data.compass_rose = cwc.ControllerMaster.prototype.calculate_compass_rose(
                ev.angle
            );
        }

        /* -- Cartesian Coordinates -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("cartesian_coordinates") != -1) )
        {
            input_data.cartesian_coordinates = {
                x : cwc.ControllerMaster.prototype.calculate_cartesian_coordinates( ev.deltaX ),
                y : cwc.ControllerMaster.prototype.calculate_cartesian_coordinates( ev.deltaY )
            }
        }

        /* -- Axis Direction -- */
        if( (input_r === 'all-input-data') || (input_r.indexOf("axis_direction") != -1) )
        {
            input_data.axis_direction = cwc.ControllerMaster.prototype.calculate_axis_direction( {
                x : ev.deltaX,
                y : ev.deltaY
            } );
        }

        return input_data;

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
                hook_name : instructions[ hook ],
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