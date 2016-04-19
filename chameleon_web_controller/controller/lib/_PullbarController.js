/*------------------------------------------------------
 Pull bar Controller
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

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function PullbarController( extend )
    {
        cwc.registerPlugin(this, 'PullbarController');

        /* -- Search for pullbars -- */
        this.lookup();
    };

    /*------------------------------------------------------
    * @object - Taxonomy
    * @info   - all the data attr of pullbar info
    */
    PullbarController.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            pullbar        : 'data-cwc-controller=pullbar',
        }

    };

    /*------------------------------------------------------
    * @object - All pullbars
    * @info   - Keep and record of all found pullbar elms
    */
    PullbarController.prototype.all_pullbars = [
    ];

    /*------------------------------------------------------
    * @object - Returned data
    * @info - All of the infromation gatherd during movement
    */
    PullbarController.prototype.returned_data = {
    };

    /*------------------------------------------------------
    * @object - Request id
    * @info   - reuest animation frame id
    */
    PullbarController.prototype.request_id = 0;

    /*------------------------------------------------------
    * @object - Tracking
    * @info   - All us to track the current item in use
    */
    PullbarController.prototype.tracking = null;

    /*------------------------------------------------------
    * @function - Lookup
    * @info     - Finds all pullbars within the dom
    */
    PullbarController.prototype.lookup = function( )
    {
        var all_pullbars_in_dom      = document.querySelectorAll('['+ this.taxonomy.data.pullbar +']');
        var all_pullbars_in_dom_leng = all_pullbars_in_dom.length;

        for( var a_id = 0; a_id < all_pullbars_in_dom_leng; a_id++ )
        {
            /* -- Get the pullbar and trigger -- */
            var pullbar = all_pullbars_in_dom[ a_id ];
            var trigger = pullbar.querySelector("span");

            /* -- Add the id to all elements below -- */
            cwc.ControllerMaster.prototype.tag_all_with_id( pullbar, a_id );

            /* -- Bind the group id to the trigger -- */
            trigger.g_id = a_id;

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( trigger );
                mc.add(new Hammer.Pan({
                    threshold: 0, pointers: 0
                }));

            mc.on("panstart panup pandown panend", function( ev ) {
                cwc.PullbarController.prototype.on_pullbars_trigger_pan(
                    ev
                );
            });

            /* -- Save the group -- */
            this.all_pullbars[ a_id ] = {
                pullbar          : pullbar,
                trigger          : trigger,
                instructions     : cwc.ControllerMaster.prototype.fetch_instructions( pullbar )
            };

        }

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info     - Panning options an collishion
    */
    PullbarController.prototype.on_pullbars_trigger_pan = function( ev )
    {
        /* -- Set the components and options -- */
        var g_id            = ( event.target.g_id == undefined )? this.tracking : event.target.g_id;
        var pullbar         = this.all_pullbars[ g_id ].pullbar;
        var trigger         = this.all_pullbars[ g_id ].trigger;
        var instructions    = this.all_pullbars[ g_id ].instructions;

        /* -- Get the style infromation about the componants -- */
        var style = {
            pbh : pullbar.clientHeight,
            pbw : pullbar.clientWidth,

            trh : trigger.clientHeight,
            trw : trigger.clientWidth,
        };

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        };

        /* -- threshold -- */
        var threshold = {
            y : {
                top :  (style.pbh / 2 ) - ( style.trh / 2 ) + delta.y  <= -( style.trh / 2 ),
                btm :  (style.pbh / 2 ) + ( style.trh / 2 ) <=  delta.y + (style.trh / 2 ),
            }
        }

        /* -- Set the data to be returned -- */
        this.returned_data = cwc.ControllerMaster.prototype.get_input_data(
            ev, 'PullbarController'
        );

        if( instructions.hasOwnProperty('viewport-target') )
        {
            this.returned_data.viewport_target = instructions['viewport-target'];
        }

        /* -- Collishion -- */
        if( threshold.y.top || threshold.y.btm )
        {
            /* -- Check if we in enter frame -- */
            if( this.request_id == 0 )
            {
                /* -- Start the tick process -- */
                this.on_tick();

                /* -- Clear out the timer -- */
                pullbar.classList.add("auto");
            }

        }

        /* -- no collishion -- */
        else if( (! threshold.y.top) && (! threshold.y.btm) )
        {
            /* -- Start the tick process -- */
            if( this.request_id > 0 )
            {
                this.on_tick('destroy');
            }

            /* -- clear the timer -- */
            pullbar.classList.remove("auto");

            /* -- move the publlbar handle -- */
            this.pullbar_trigger_translate({
                trigger : trigger,
                delta_x : 0,
                delta_y : delta.y
            });

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook(
                'on-pull', instructions, this.returned_data
            );

        }

        this.start_and_end_toggle( ev.type, g_id, pullbar, trigger )

    };

    /*------------------------------------------------------
    * @function - Start and end toggle
    * @info     - Called to check if the pan process has started or ended
    */
    PullbarController.prototype.start_and_end_toggle = function( type, g_id, pullbar, trigger )
    {
        /* -- Add on start -- */
        if( type === 'panstart' )
        {
            this.tracking = g_id;
            pullbar.classList.add("active");
        }

        /* -- Remove all -- */
        else if( type === 'panend' )
        {
            /* -- Start the tick process -- */
            this.on_tick('destroy');

            /* -- Move the publlbar handle to start -- */
            this.pullbar_trigger_translate({
                trigger : trigger,
                delta_x : 0,
                delta_y : 0
            });

            /* -- Clear out the timer -- */
            pullbar.classList.remove("auto");

            /* -- Clear out the timer -- */
            pullbar.classList.remove("active");
        }

    };

    /*------------------------------------------------------
    * @function - Pullbar trigger translate
    * @info     - Clear out the fimer and reset collishion
    */
    PullbarController.prototype.pullbar_trigger_translate = function( prams )
    {
        /* -- Move the publlbar handle -- */
        window.requestAnimationFrame( function(){
            prams.trigger.style.transform = [
                'translate3d(' + prams.delta_x + 'px,' + prams.delta_y + 'px, 0)'
            ]
        });

    };

    /*------------------------------------------------------
    * @function - On tick
    * @info     - When pull bar has is pulsating
    */
    PullbarController.prototype.on_tick = function( order )
    {
        /* -- destroy the tick  -- */
        if( order == 'destroy' )
        {
            window.cancelAnimationFrame(
                cwc.PullbarController.prototype.request_id
            );

            cwc.PullbarController.prototype.request_id = 0;
        }

        /* -- Start the tick process -- */
        else
        {
            /* -- get the insrtuctions for the current analog -- */
            var instructions = cwc.PullbarController.prototype.all_pullbars[
                cwc.PullbarController.prototype.tracking
            ].instructions;

            /* -- check if hook has been applied -- */
            cwc.ControllerMaster.prototype.invoke_hook(
                'on-pull',
                instructions,
                cwc.PullbarController.prototype.returned_data
            );

            /* -- Build the loop -- */
            cwc.PullbarController.prototype.request_id = requestAnimationFrame(
                cwc.PullbarController.prototype.on_tick
            );
        }

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(PullbarController, 'PullbarController');

}( window.cwc );