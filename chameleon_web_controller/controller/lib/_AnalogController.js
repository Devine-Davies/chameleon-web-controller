/*------------------------------------------------------
 Analog Controller
 ------------------------------------------------------
 * What to talk about
 ------------------------------------------------------
 • Talk about on tick and pan movments
 • About return types (angle, dir, coords, CD)
 • The two dirrent type of collusion
 • Involvment when moving and how circal reacts to colloshion
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
    function AnalogController( extend )
    {
        cwc.registerPlugin(this, 'AnalogController');

        this.lookup();

    };

    /*------------------------------------------------------
    * @object - Taxonomy
    * @info   - To store all data and class names
    */
    AnalogController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            controller : 'data-cwc-controller=analog'
        }
    };

    /*------------------------------------------------------
    * @object - All controllers
    * @info   - Keep and record of all controllers found
    */
    AnalogController.prototype.all_controllers = [];

    /*------------------------------------------------------
    * @object - Returned data
    * @info   - All of the information gathered during movement
    * and return back to user
    */
    AnalogController.prototype.returned_data = {};

    /*------------------------------------------------------
    * @object - Tracking
    * @info   - Holds the index of the controller in use
    */
    AnalogController.prototype.tracking = null;

    /*------------------------------------------------------
    * @object - Animation frame
    * @info   - Use when pluse movemnt
    */
    AnalogController.prototype.animation_frame = 0;

    /*------------------------------------------------------
    * @function - Pad lookup
    * @info - Looks thought DOM to gather all controllers
    */
    AnalogController.prototype.lookup = function()
    {
        /* -- Get names -- */
        var controllers       = document.querySelectorAll('['+ this.taxonomy.data.controller +']');
        var controllers_count = controllers.length;

        for( var c_id = 0; c_id < controllers_count; c_id++ )
        {
            var analog  = controllers[ c_id ];
            var trigger = analog.querySelector("span");

            /* -- Add the id to all elements below -- */
            cwc.ControllerMaster.prototype.tag_all_with_id( analog, c_id );

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( analog );
                mc.add(new Hammer.Pan({
                    domEvents: false, threshold: 4, pointers: 0
                } ) );

            mc.on("pan panstart panend", function( ev ) {
                cwc.AnalogController.prototype.on_analog_pan( ev );
            });

            /* -- Save the group -- */
            this.all_controllers[ c_id ] = {
                analog        : analog,
                trigger       : trigger,
                instructions  : cwc.ControllerMaster.prototype.fetch_instructions( analog )
            };

        }

    };

    /*------------------------------------------------------
    * @function - On analog pan
    * @info - Main methord thst undergos on controller movment
    */
    AnalogController.prototype.on_analog_pan = function( ev )
    {
        var c_id = ( event.target.dataset.cid == undefined )? this.tracking : event.target.dataset.cid;

        var analog       = this.all_controllers[ c_id ].analog;
        var trigger      = this.all_controllers[ c_id ].trigger;
        var instructions = this.all_controllers[ c_id ].instructions;

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- coordinates of x and y -- */
        var coordinate = {
            x : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( delta.x ),
            y : cwc.ControllerMaster.prototype.calculate_axis_as_coordinate( delta.y )
        };

        /* -- cardinal the users is moving in -- */
        var cardinal_direction = cwc.ControllerMaster.prototype.calculate_axis_as_cardinal_direction(
            ev.angle
        );

        /* -- check to see if we are moving to the center or to the endge (in : out) -- */
        var in_out = cwc.ControllerMaster.prototype.get_moving_direction(
            delta
        );

        /* -- Store all the infromation caculaed to return back -- */
        this.returned_data = {
            cardinal_direction : cardinal_direction,
            direction          : cwc.ControllerMaster.prototype.hammer_dirs[ ev.direction ],
            in_out             : in_out,
            coordinate         : coordinate,
            delta              : delta,
            angle              : ev.angle,
            event_type         : ev.type,
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
            cwc.ControllerMaster.prototype.invoke_hook( 'pan', instructions, this.returned_data );
        }

    };

    /*------------------------------------------------------
    * @function - On pan start
    * @info - Fired as when controller first inteacted
    */
    AnalogController.prototype.on_pan_start = function( c_id, instructions, analog, trigger )
    {
        /* -- Track the onbject being used -- */
        this.tracking = c_id;

        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'panstart', instructions, null);

        if( this.get_movment_type() == 'tick' )
        {
            this.on_tick();
        }

        analog.classList.add("active");

    };

    /*------------------------------------------------------
    * @function - On pan end
    * @info - Fired as soon as user has finshed inteacteing with controller
    */
    AnalogController.prototype.on_pan_end = function( c_id, instructions, analog, trigger )
    {
        /* -- check if hook has been applied -- */
        cwc.ControllerMaster.prototype.invoke_hook( 'panend', instructions, null);

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
    * @function - Get movment type
    * @info - Check witch intraction has been set for controller
    */
    AnalogController.prototype.get_movment_type = function(  )
    {
        /* -- get the insrtuctions for the current analog -- */
        var instructions = this.all_controllers[ this.tracking ].instructions;

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
    * @function - On tick
    * @info - When controller has enterd continuous movment
    */
    AnalogController.prototype.on_tick = function( order )
    {
        /* -- destroy the tick  -- */
        if( order === 'destroy' )
        {
            window.cancelAnimationFrame(
                cwc.AnalogController.prototype.animation_frame
            );
        }

        /* -- Start the tick process -- */
        else
        {
            /* -- get the insrtuctions for the current analog -- */
            var instructions = cwc.AnalogController.prototype.all_controllers[
                cwc.AnalogController.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook( 'pan', instructions,
                cwc.AnalogController.prototype.returned_data
            );

            /* -- Build the loop -- */
            cwc.AnalogController.prototype.animation_frame = window.requestAnimationFrame(
                cwc.AnalogController.prototype.on_tick
            );
        }

    };

    /*------------------------------------------------------
    * @function - Trigger translate
    * @info - Used to change the css 3D translate state of the controller
    */
    AnalogController.prototype.trigger_translate = function( prams )
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
    cwc.plugin(AnalogController, 'AnalogController');

}( window.cwc, Hammer );