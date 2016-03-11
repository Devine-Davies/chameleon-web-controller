/*------------------------------------------------------
 Analog Pad
 ------------------------------------------------------
 To-Do •
 ------------------------------------------------------
 •
*/

!function( cwc, Hammer ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function AnalogPad( extend )
    {
        cwc.registerPlugin(this, 'AnalogPad');

        this.pad_lookup();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    AnalogPad.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=analog-pad'
        }
    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.all_analogpads = [];

    /*------------------------------------------------------
    * @object - Returned data
    * @info - All of the infromation gatherd during movement
    * @info -
    */
    AnalogPad.prototype.returned_data = {};

    /*------------------------------------------------------
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    AnalogPad.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'
    };

    /*------------------------------------------------------
    * @object - Tracking
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.tracking = null;

    /*------------------------------------------------------
    * @object - Request id
    * @info - animation request id
    */
    AnalogPad.prototype.request_id = 0;

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    AnalogPad.prototype.pad_lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var analog  = controllers[ c_id ];
            var trigger = analog.querySelector("span");

            /* -- Add the id to all elements below -- */
            cwc.PadMaster.prototype.tag_all_with_id( analog, c_id );

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( analog );
                mc.add(new Hammer.Pan({
                    domEvents: false, threshold: 4, pointers: 0
                } ) );

            mc.on("pan panstart panend", function( ev ) {
                cwc.AnalogPad.prototype.on_analog_pan( ev );
            });

            /* -- Save the group -- */
            this.all_analogpads[ c_id ] = {
                analog        : analog,
                trigger       : trigger,
                instructions  : cwc.PadMaster.prototype.fetch_instructions( analog )
            };

        }

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    AnalogPad.prototype.on_analog_pan = function( ev )
    {
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_analogpads[ c_id ].analog;
        var trigger      = this.all_analogpads[ c_id ].trigger;
        var instructions = this.all_analogpads[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.PadMaster.prototype.calculate_axis_as_coordinate( delta.x ),
            y : cwc.PadMaster.prototype.calculate_axis_as_coordinate( delta.y )
        };

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.PadMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.PadMaster.prototype.get_moving_direction(
            delta
        );

        /* -- Store all the infromation caculaed to return back -- */
        this.returned_data = {
            cardinal_direction : cardinal_direction,
            direction          : this.hammer_dirs[ ev.direction ],
            in_out             : in_out,
            coordinate         : coordinate,
            delta              : delta,
            angle              : ev.angle,
        };

        /* -- analog container circal -- */
        var analog_c = {
            x: analog.offsetLeft,
            y: analog.offsetTop,
            radius: analog.clientWidth / 2,
        };

        var trigger_c = {
            radius: trigger.clientWidth / 2,
            x: delta.x,
            y: delta.y,
            s_x: trigger.offsetLeft,
            s_y: trigger.offsetTop,
        };

        /* --- Collision detection for when moving out of circle -- */
        var dx  = (analog_c.x + analog_c.radius) - (trigger_c.x + trigger_c.radius) - trigger_c.s_x;
        var dy  = (analog_c.y + analog_c.radius) - (trigger_c.y + trigger_c.radius) - trigger_c.s_y;
        var dis = Math.sqrt(dx * dx + dy * dy) + ( trigger_c.radius );

        /* -- Collishion happerning  --*/
        if (dis > analog_c.radius + trigger_c.radius)
        {
            /* --- Collision detection : for fix the triiger againsied the of the analog area -- */
            var angle = ev.angle;
            var x = analog_c.x + analog_c.radius * Math.cos( angle * (Math.PI / 180) );
            var y = analog_c.y + analog_c.radius * Math.sin( angle * (Math.PI / 180) );

            /* -- add auto class -- */
            analog.classList.add("auto");

            /* -- Move the tigger handle -- */
            this.trigger_translate({
                trigger : trigger,
                delta_x : x,
                delta_y : y
            });

        }
        /* -- Move as normal --*/
        else
        {
            /* -- Remove class auto -- */
            analog.classList.remove("auto");

            /* -- Move the tigger handle -- */
            this.trigger_translate({
                trigger : trigger,
                delta_x : delta.x,
                delta_y : delta.y
            });

        }

        /* -- Remove all -- */
        if( ev.type === 'panstart' )
        {
            /* -- Pan has started trigger -- */
            this.on_pan_start(
                c_id,
                instructions,
                analog,
                trigger
            );
        }
        /* -- Remove all -- */
        else if( ev.type === 'panend' )
        {
            /* -- Pan has started trigger -- */
            this.on_pan_end(
                c_id,
                instructions,
                analog,
                trigger
            );
        }
        /* -- If the movment has been set to pull, then call the users function -- */
        else if( this.get_movment_type() == 'pull' )
        {
            /* -- check if hook has been applied -- */
            cwc.PadMaster.prototype.invoke_hook( 'pan', instructions, this.returned_data );
        }

    };

    /*------------------------------------------------------
    * @function - On pan start
    */
    AnalogPad.prototype.on_pan_start = function( c_id, instructions, analog, trigger )
    {
        /* -- Track the onbject being used -- */
        this.tracking = c_id;

        /* -- check if hook has been applied -- */
        cwc.PadMaster.prototype.invoke_hook( 'panstart', instructions, null);

        if( this.get_movment_type() == 'tick' )
        {
            this.on_tick();
        }

        analog.classList.add("active");

    };

    /*------------------------------------------------------
    * @function - On pan end
    */
    AnalogPad.prototype.on_pan_end = function( c_id, instructions, analog, trigger )
    {
        /* -- check if hook has been applied -- */
        cwc.PadMaster.prototype.invoke_hook( 'panend', instructions, null);

        /* -- Remove any if nessary -- */
        analog.classList.remove("active");
        analog.classList.remove("auto");

        /* -- Move the publlbar handle to start -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : 0,
            delta_y : 0
        });

        /* -- Stop the tick if it has been set -- */
        if( this.get_movment_type() == 'tick' )
        {
            this.on_tick('destroy');
        }

        /* -- Track the onbject being used -- */
        this.tracking = null;

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - @http://goo.gl/bQdzfN
    */
    AnalogPad.prototype.get_movment_type = function(  )
    {
        /* -- get the insrtuctions for the current analog -- */
        var instructions = this.all_analogpads[ this.tracking ].instructions;

        /* -- Check the type of movment -- */
        if( instructions.hasOwnProperty( 'movement-type' ) )
        {
            if( instructions['movement-type'] == 'tick' )
            {
                return instructions['movement-type'];
            }
            else
            {
                return 'pull';
            }
        }
        else
        {
            return 'pull';
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - @http://goo.gl/bQdzfN
    */
    AnalogPad.prototype.on_tick = function( order )
    {
        /* -- destroy the tick  -- */
        if( order === 'destroy' )
        {
            window.cancelAnimationFrame( this.request_id );
        }

        /* -- Start the tick process -- */
        else
        {
            /* -- get the insrtuctions for the current analog -- */
            var instructions = cwc.AnalogPad.prototype.all_analogpads[
                cwc.AnalogPad.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.PadMaster.prototype.invoke_hook( 'pan', instructions,
                cwc.AnalogPad.prototype.returned_data
            );

            /* -- Build the loop -- */
            cwc.AnalogPad.prototype.request_id = window.requestAnimationFrame(
                cwc.AnalogPad.prototype.on_tick
            );
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.trigger_translate = function( prams )
    {
        /* -- Move the publlbar handle -- */
        window.requestAnimationFrame( function(){
            prams.trigger.style.transform = [
                'translate3d(' + prams.delta_x + 'px,' + prams.delta_y + 'px, 0)'
            ]
        });

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(AnalogPad, 'AnalogPad');

}( window.cwc, Hammer );
