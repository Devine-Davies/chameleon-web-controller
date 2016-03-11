/*------------------------------------------------------
 * Viewport Scroll Display
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
 • Fix support for scroll animation on tap.
 ------------------------------------------------------
*/


!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ViewportScroll( scrollTargets )
    {
        cwc.registerPlugin(this, 'ViewportScroll');

        if( scrollTargets.length >= 0 )
        {
            /* -- Save the ids -- */
            this.scroll_target_ids = scrollTargets;

            /* -- Add the server events -- */
            this.add_server_events();

            /* -- Cache each of the elements -- */
            this.cache_targets( );
        }

    };

    /*------------------------------------------------------
    * @array - Save the ids
    * @info - Used to store the id's of each of the elments
    */
    ViewportScroll.prototype.scroll_target_ids = [
        'scroll-target'
    ];

    /*------------------------------------------------------
    * @function - Cached scroll target
    * @info - Save sned elemets here
    */
    ViewportScroll.prototype.cached_scroll_target = [
    ];

    /*------------------------------------------------------
    * @function - Cached scroll target
    * @info - Save all of the elements to optimise and seed up perforamce
    */
    ViewportScroll.prototype.cache_targets = function( )
    {
        var sti = this.scroll_target_ids;

        for( var i = 0; i < sti.length; i++ )
        {
            this.cached_scroll_target.push(
                document.querySelector( sti[ i ] )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Add Server events to control class
    * @info - scroll viewport is server event
    */
    ViewportScroll.prototype.add_server_events = function()
    {
        /* -- Server message -- */
        cwc.ServerMethod.prototype.create_method( {
            action   : 'scroll viewport',
            callback : function( args ) {
                cwc.ViewportScroll.prototype.start_scroll_process(
                    args
                );
            }
        } );

    };

    /*------------------------------------------------------
    * @function - Start scroll process
    * @info - check to see if send id lives in out array
    */
    ViewportScroll.prototype.start_scroll_process = function( args )
    {
        /* -- Get all ids sent to class -- */
        var sti = this.scroll_target_ids;

        /* -- Try and find posistion -- */
        var pos =  sti.indexOf(
            args.viewport_target
        );

        /* -- Check posistion -- */
        if( pos != -1 )
        {
            /* -- Get all ids sent to class -- */
            var a_elms = this.cached_scroll_target;

            this.check_action(
                a_elms[ pos ],
                args
            );

        }

    };

    /*------------------------------------------------------
    * @function - Check action
    * @info - and that the actions are good.
    */
    ViewportScroll.prototype.check_action = function( elm, args )
    {
        //console.log( args );

        var ammount  = elm.scrollTop + (args.ammount || 10)
        var duration = (args.type === 'scroll to' )? 600 : 10;

        this.scroll_to(
            elm, ammount, duration
        );

    };

    /*------------------------------------------------------
    * @function - Scrool to with animation
    * @info - Courtesy of abroz && TimWolla on
    * @info - Animation snippt take from :
    * @info - http://stackoverflow.com/questions/8917921/cross-browser-javascript-not-jquery-scroll-to-top-animation
    */
    ViewportScroll.prototype.scroll_to = function(element, to, duration) {
        var start = element.scrollTop,
            change = to - start,
            increment = 20;

        var animateScroll = function(elapsedTime) {
            elapsedTime += increment;
            var position = easeInOut(elapsedTime, start, change, duration);
            element.scrollTop = position;
            if (elapsedTime < duration) {
                setTimeout(function() {
                    animateScroll(elapsedTime);
                }, increment);
            }
        };

        function easeInOut(currentTime, start, change, duration) {
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return change / 2 * currentTime * currentTime + start;
            }
            currentTime -= 1;
            return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
        }

        animateScroll(0);
    }


    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ViewportScroll, 'ViewportScroll');

}( window.cwc );