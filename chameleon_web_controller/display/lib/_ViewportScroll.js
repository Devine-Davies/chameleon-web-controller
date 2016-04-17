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
            /* -- Cache each of the elements -- */
            this.cache_targets( scrollTargets );

            /* -- Add the server events -- */
            this.add_server_events();
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
    ViewportScroll.prototype.cache_targets = function( scrollTargets )
    {
        /* -- Save the ids -- */
        this.scroll_target_ids = scrollTargets;

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
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          hook_name : 'scroll-viewport',
          method    : function( feedback ) {
            cwc.ViewportScroll.prototype.start_scroll_process( feedback );
        } } );

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

        console.log( args.viewport_target );

        /* -- Check posistion -- */
        if( pos != -1 )
        {
            /* -- Get all ids sent to class -- */
            var a_elms = this.cached_scroll_target;

            this.check_action(
                a_elms[ pos ],
                args.compass_rose
            );

        }

    };

    /*------------------------------------------------------
    * @function - Check action
    * @info - and that the actions are good.
    */
    ViewportScroll.prototype.check_action = function( elm, direction )
    {
        var ammount = 15;

        switch( direction.toUpperCase() )
        {
            case 'DOWN' :
            case 'S'    :
            elm.scrollTop = elm.scrollTop + 15;
            break;

            case 'UP' :
            case 'N'    :
            elm.scrollTop = elm.scrollTop - 15;
            break;
        }

        return;

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ViewportScroll, 'ViewportScroll');

}( window.cwc );