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
        this.all_reserved_hooks[ prams.hook_name ] = {
            'hook_name': prams.hook_name,
            'method'   : prams.method
        };

    };

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    Hooks.prototype.set_hook = function( prams )
    {
        this.all_hooks[ prams.hook_name ] = {
            'hook_name' : prams.hook_name,
            'method'    : prams.method
        };

    };

    /*------------------------------------------------------
    * @function - Validate hook
    * @info     - Validate the hook being sent
    */
    Hooks.prototype.validate_hook = function( data )
    {
        var checks = [
        /* -- Hook to run          -- */ 'hook_name',
        /* -- recipient of message -- */ 'recipient',
        /* -- Arguments included   -- */ 'arguments',
        ];

        for( var i = 0; i < checks.length; i++ )
        {
            /* -- If property was not found : return true -- */
            if ( ! data.hasOwnProperty( checks[ i ] ) )
            {
                console.log('Server message is not properly fromatted.');
                return false;
            }

        }

        return true;

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    Hooks.prototype.invoke_clinet_hook = function( hook_info )
    {
        /* -- Is this a valid mesage : return true not valid -- */
        if( this.validate_hook( hook_info ) )
        {
            if( cwc._server_connection )
            {
                if( cwc._server_connection.readyState == 1 )
                {
                    cwc._server_connection.send( JSON.stringify(
                        hook_info
                    ) );
                }
            }
        }

    };

    /*------------------------------------------------------
    * @function
    * where we invoke custom methods
    */
    Hooks.prototype.invoke = function( hook_info, reserved )
    {
        /* -- check formatting -- */
        if( hook_info.hasOwnProperty( 'hook_name' ) )
        {
            var hooks = ( reserved )? this.all_reserved_hooks : this.all_hooks;

            /* -- Can be called using hook-*(name) usfull on data attr -- */
            var hook_name = hook_info.hook_name.replace('hook-','')

            if( hooks.hasOwnProperty( hook_name ) )
            {
                try {
                    hooks[ hook_name ].method( hook_info.arguments, hook_info.cwc_metadata )
                } catch( e ) {
                    console.log( e );
                }
            }
        }

    };

    /* -- Add this new object to the main object -- */
    cwc.plugin(Hooks, 'Hooks');

}( window.cwc );