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
    CustomMethod.prototype.custom_methods = [];

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    CustomMethod.prototype.create_method = function( prams )
    {
        this.custom_methods.push({
            'name'     : prams.name,
            'method'   : prams.method
        });

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    CustomMethod.prototype.call_method = function( prams )
    {
        var cm_count = this.custom_methods.length;

        for( var i = 0; i < cm_count; i++ )
        {
            var cm = this.custom_methods[ i ];

            if( cm.name === prams.method )
            {
                cm.method(
                    prams.arguments
                );

                return;
            }
        }

        console.log('Methord has not been created : CM');
    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(CustomMethod, 'CustomMethod');

}( window.cwc );