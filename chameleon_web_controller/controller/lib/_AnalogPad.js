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
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    AnalogPad.prototype.is_sending = false;

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.auto_move_timer = false;

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    AnalogPad.prototype.tracking = null;

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
            var analog = controllers[ c_id ];
                analog.c_id = c_id;

            var trigger = analog.querySelector("span");
                trigger.c_id = c_id;

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( analog );
                mc.add(new Hammer.Pan({
                    domEvents: false,
                    threshold: 4, pointers: 0
                } ) );

            mc.on("panstart panmove panend", function( ev ) {
                cwc.AnalogPad.prototype.on_analog_pan( ev );
            });

            /* -- Save the group -- */
            this.all_analogpads[ c_id ] = {
                analog           : analog,
                trigger          : trigger,
                // instructions     : instructions
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
        var c_id = ( event.target.c_id == undefined )? this.tracking : c_id;

        var analog  = this.all_analogpads[ 0 ].analog;
        var trigger = this.all_analogpads[ 0 ].trigger;

        /* -- Remove all -- */
        if( ev.type === 'panstart' )
        {
            this.tracking = c_id;
            analog.classList.add("active");
            return;
        }

        /* -- Remove all -- */
        if( ev.type === 'panend' )
        {
            /* -- Clear out the timer -- */
            this.analog_reset( analog, trigger )
            return;
        }

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

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
        var dx = (analog_c.x + analog_c.radius) - (trigger_c.x + trigger_c.radius) - trigger_c.s_x;
        var dy = (analog_c.y + analog_c.radius) - (trigger_c.y + trigger_c.radius) - trigger_c.s_y;
        var distance = Math.sqrt(dx * dx + dy * dy) + ( trigger_c.radius );

        if (distance > analog_c.radius + trigger_c.radius)
        {
            /* --- Collision detection : for fix the triiger againsied the of the analog area -- */
            var angle = ev.angle;
            var x = analog_c.x + analog_c.radius * Math.cos( angle * (Math.PI / 180) );
            var y = analog_c.y + analog_c.radius * Math.sin( angle * (Math.PI / 180) );

            this.restricted_bounds_movment(
                analog,
                trigger,
                x,
                y
            );

            /* -- Send the action to the main screen -- */
            this.send_actions_to_first_screen(
                this.hammer_dirs[ ev.direction ], 200
            );
        }
        else
        {
            /* -- no collision -- */
            this.within_bounds_movment(
                analog,
                trigger,
                delta.x,
                delta.y,
                this.hammer_dirs[ ev.direction ]
            );
        }

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.analog_reset = function( analog, trigger )
    {
        /* -- Remove any if nessary -- */
        analog.classList.remove("active");
        analog.classList.remove("auto");

        /* -- Remove the last tracking id -- */
        this.tracking = null;

        /* -- Move the publlbar handle to start -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : 0,
            delta_y : 0
        });

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.restricted_bounds_movment = function( analog, trigger, x, y )
    {
        /* -- add auto class -- */
        analog.classList.add("auto");

        /* -- Move the publlbar handle -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : x,
            delta_y : y
        });

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    AnalogPad.prototype.within_bounds_movment = function( analog, trigger, deltaX, deltaY, dir )
    {
        /* -- Remove class auto -- */
        analog.classList.remove("auto");

        /* -- Move the publlbar handle -- */
        this.trigger_translate({
            trigger : trigger,
            delta_x : deltaX,
            delta_y : deltaY
        });

        /* -- Send the action to the main screen -- */
        this.send_actions_to_first_screen(
            dir, 400
        );

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
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
     AnalogPad.prototype.send_actions_to_first_screen = function( action, delay )
     {
        if ( ! this.is_sending )
        {
            this.is_sending = true;

            setTimeout( function(){
                cwc.Server.prototype.send_message({
                    recipient : 'display',
                    action    : 'move navigation',
                    arguments : action
                })

                cwc.AnalogPad.prototype.is_sending = false;
            } , ( delay || 200) )
        }

     };


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(AnalogPad, 'AnalogPad');

}( window.cwc, Hammer );


