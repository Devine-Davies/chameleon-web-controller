!function( cwc ){
  'use strict';

    function Hooks( )
    {
        cwc.registerPlugin(this, 'Hooks');
    }

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    Hooks.prototype.all_reserved_hooks = {};

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    Hooks.prototype.all_hooks = {};

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    Hooks.prototype.set_reserved_hook = function( prams )
    {
        this.all_reserved_hooks[ prams.name ] = {
            'name'     : prams.name,
            'method'   : prams.method
        };

    };

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    Hooks.prototype.set_hook = function( prams )
    {
        this.all_hooks[ prams.name ] = {
            'name'     : prams.name,
            'method'   : prams.method
        };

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    Hooks.prototype.invoke = function( prams, reserved )
    {
        var hooks = ( reserved )? this.all_reserved_hooks : this.all_hooks;

        try {
            hooks[ prams.name ].method( prams.arguments, prams.cwc_metadata )
        } catch( e ) {
            console.log( e );
        }

    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(Hooks, 'Hooks');

}( window.cwc );