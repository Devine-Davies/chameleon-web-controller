!function( cwc ){
  'use strict';

    function CustomMethod( )
    {
        cwc.registerPlugin(this, 'CustomMethod');
    }

    /*------------------------------------------------------
    * @array
    * Place to store all custom methord
    */
    CustomMethod.prototype.custom_methods = [
    ];

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    CustomMethod.prototype.create_method = function( prams )
    {
        this.custom_methods[ prams.name ] = {
            'method' : prams.method
        };

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    CustomMethod.prototype.call_method = function( prams )
    {
        if( "arguments" in prams )
        {
            this.custom_methods[ prams.method ].method(
                prams.arguments
            );
        }
        else
        {
            this.custom_methods[ prams.method ].method(
            );
        }

    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(CustomMethod, 'CustomMethod');

}( window.cwc );