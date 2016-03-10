/*------------------------------------------------------
 * Viewport Scroll Controller
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
 • Add support for data attr nav dir - up, down, left, right
 • Add support for NO end last and first attr
 • Add support for Enter key for on select
 • Must show testing on Screen
 • Add commit
 -------------------------------------------------------
*/


!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ViewportScroll( extend )
    {
        cwc.registerPlugin(this, 'ViewportScroll');

        /* -- Search for pullbars -- */
        this.lookup_type_pullbars();
    };

    /*------------------------------------------------------
    * @obj
    * To store all data and class names
    */
    ViewportScroll.prototype.taxonomy = {
        /* -- HTML:(data-*) -- */
        data : {
            vs     : 'data-cwc-viewportscroll-btn',
            action : 'data-cwc-action',

            pullbar        : 'data-cwc-viewportscroll-pullbar',
            pullbar_action : 'data-cwc-action',
        }

    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.all_pullbars = [

    ];

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.pullbars_colishion = false;

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.pullbars_auto_scroll_timer = false;

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    ViewportScroll.prototype.tracking = null;

    /*------------------------------------------------------
    * @object - Hammer dirs
    * @info - Take from the hammer js spec
    */
    ViewportScroll.prototype.hammer_dirs = {
        1  : 'none',
        2  : 'left',
        4  : 'right',
        8  : 'up',
        16 : 'down'
    };

    /*------------------------------------------------------
    * @function - Lookup type pullbars
    * @info - panup pandown panleft panright panmove panend panstart
    * @return - true : false
    */
    ViewportScroll.prototype.lookup_type_pullbars = function( )
    {
        var all_pullbars_in_dom      = document.querySelectorAll('['+ this.taxonomy.data.pullbar +']');
        var all_pullbars_in_dom_leng = all_pullbars_in_dom.length;

        for( var a_id = 0; a_id < all_pullbars_in_dom_leng; a_id++ )
        {
            /* -- Get the pullbar and trigger -- */
            var pullbar = all_pullbars_in_dom[ a_id ];
            var trigger = pullbar.querySelector("span");

            /* -- Bind the group id to the trigger -- */
            trigger.g_id = a_id;

            /* -- Build hammer events -- */
            var mc = new Hammer.Manager( trigger );
                mc.add(new Hammer.Pan({
                    threshold: 0, pointers: 0
                }));

            mc.on("panstart panup pandown panend", function( ev ) {
                cwc.ViewportScroll.prototype.on_pullbars_trigger_pan(
                    ev
                );
            });

            /* -- Get instuctions -- */
            var instructions = JSON.parse(
                pullbar.getAttribute( this.taxonomy.data.pullbar )
            );

            /* -- Save the group -- */
            this.all_pullbars[ a_id ] = {
                pullbar          : pullbar,
                trigger          : trigger,
                instructions     : instructions
            };

        }

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    ViewportScroll.prototype.on_pullbars_trigger_pan = function( ev )
    {
        /* -- Get the pullbar id from the elm attr -- */
        var g_id = ( event.target.g_id == undefined )? this.tracking : event.target.g_id;

        var pullbar         = this.all_pullbars[ g_id ].pullbar;
        var trigger         = ev.target;
        var instructions    = this.all_pullbars[ g_id ].instructions;

        var pullbar_style = getComputedStyle(pullbar);
        var trigger_style = getComputedStyle(trigger);

        /* -- Add on start -- */
        if( ev.type === 'panstart' )
        {
            this.tracking = g_id;
            pullbar.classList.add("active");
            return;
        }

        /* -- Remove all -- */
        else if( ev.type === 'panend' )
        {
            /* -- Clear out the timer -- */
            this.pullbar_trigger_reset( pullbar, trigger )
            return;
        }

        var pbh = parseInt(pullbar_style.height, 10),
            pbw = parseInt(pullbar_style.width , 10),
            trh = parseInt(trigger_style.height, 10),
            trw = parseInt(trigger_style.width , 10);

        /* -- deltas of pointer pos -- */
        var delta = {
            x : ev.deltaX,
            y : ev.deltaY
        }

        /* -- threshold -- */
        var threshold = {
            y : {
                top :  (pbh / 2 ) - ( trh / 2 ) + delta.y  <= -( trh / 2 ),
                btm :  ( ( trh / 2 ) + delta.y ) >= ( (pbh / 2 ) + ( trh / 2 ) ),
            }
        }

        /* -- Get the ammount to be scrolled -- */
        var ammount = this.pullbar_get_ammount(
            instructions, this.hammer_dirs[ ev.direction ]
        );

        /* -- Scroll option to send to display -- */
        var scroll_option = {
            viewport_target : instructions.viewport_target,
            direction       : this.hammer_dirs[ ev.direction ],
            ammount         : ammount,
            type            : ev.type
        }

        /* -- Check to see no timer has been set -- */
        if( this.pullbars_colishion === null )
        {
            if( threshold.y.top || threshold.y.btm )
            {
                /* -- Trigger auto scroll  -- */
                this.set_auto_scroll(scroll_option, 20);

                /* -- Clear out the timer -- */
                pullbar.classList.add("auto");
            }

        }

        /* -- Check to see we are not on constratins -- */
        if( (! threshold.y.top) && (! threshold.y.btm) )
        {
            /* -- clear out the scroll if needed -- */
            this.clear_auto_scroll();

            /* -- clear the timer -- */
            pullbar.classList.remove("auto");

            /* -- move the publlbar handle -- */
            this.pullbar_trigger_translate({
                trigger : trigger,
                delta_x : 0,
                delta_y : delta.y
            });

            /* -- Validate the sction -- */
            this.validate_action (scroll_option);

        }

    };

    /*------------------------------------------------------
    * @function - On pullbars trigger pan
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    ViewportScroll.prototype.pullbar_get_ammount = function( instructions, direction )
    {
        var ammount = instructions.ammount || 15;
        var axis    = instructions.axis    || false;

        switch ( direction )
        {
            case 'right' :
            case 'up'    :
                ammount = (axis !== 'inverted')? ammount : Math.abs(ammount) * -1;
            break;

            case 'left' :
            case 'down' :
                ammount = (axis !== 'inverted')? Math.abs(ammount) * -1 : ammount;
            break;
        }

        return ammount;

    };

    /*------------------------------------------------------
    * @function - Pullbar Trigger Reset
    * @info - Panning opctions an constraints
    * @return - true : false
    */
    ViewportScroll.prototype.pullbar_trigger_reset = function( pullbar, trigger )
    {
        /* -- Clear out the timer -- */
        this.clear_auto_scroll();

        /* -- Move the publlbar handle to start -- */
        this.pullbar_trigger_translate({
            trigger : trigger,
            delta_x : 0,
            delta_y : 0
        });

        /* -- Clear out the timer -- */
        pullbar.classList.remove("active");

        /* -- Clear out the timer -- */
        pullbar.classList.remove("auto");

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
    ViewportScroll.prototype.pullbar_trigger_translate = function( prams )
     {
        /* -- Move the publlbar handle -- */
        window.requestAnimationFrame( function(){
            prams.trigger.style.transform = [
                'translate3d(' + prams.delta_x + 'px,' + prams.delta_y + 'px, 0)'
            ]
        });

    };

    /*------------------------------------------------------
    * @function - Set auto scroll
    * @info - Clear out the fimer and reset collishion
    * @prams - viewport_target
    * @prams - direction
    * @prams - type
    */
    ViewportScroll.prototype.set_auto_scroll = function( prams, time )
    {
        this.pullbars_colishion = true;

        this.pullbars_auto_scroll_timer = setInterval(function(){
            cwc.ViewportScroll.prototype.validate_action (
                prams
            );
        }, time);

    };

    /*------------------------------------------------------
    * @function - Clear auto scroll
    * @info - Clear out the fimer and reset collishion
    */
     ViewportScroll.prototype.clear_auto_scroll = function()
     {
        if( this.pullbars_colishion !== null )
        {
            this.pullbars_colishion = null;
            clearInterval( this.pullbars_auto_scroll_timer );
        }

     };

     ViewportScroll.prototype.scroll_to = function( prams )
     {
        this.validate_action({
            viewport_target : prams.viewport_target,
            direction       : prams.direction,
            ammount         : prams.ammout || false,
            type            : 'scroll to'
        });

     };

     ViewportScroll.prototype.validate_action = function( args )
     {
        /* -- Validate action -- */
        switch( args.direction )
        {
            case 'up'     :
            case 'right'  :
            case 'down'   :
            case 'left'   :
            this.send_actions_to_first_screen( args );
            break;

        }

     };

     ViewportScroll.prototype.send_actions_to_first_screen = function( args )
     {
        cwc.Server.prototype.send_message({
            recipient : 'display',
            action    : 'scroll viewport',
            arguments : args
        });

     };


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ViewportScroll, 'ViewportScroll');

}( window.cwc );



