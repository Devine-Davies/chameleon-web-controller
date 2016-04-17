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
        console.log( prams );

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
    * @function - Invoke client hook
    * where we invoke custom methods
    */
    Hooks.prototype.invoke_client_hook = function( hook_info )
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
    Hooks.prototype.invoke = function( hook_info )
    {
        if( ! hook_info.hasOwnProperty( 'hook_name' ) )
        {
            console.log('A hook name in required');
            return;
        }

        /* -- Get the raw hook name -- */
        var hook_name = hook_info.hook_name

        console.log( hook_info );

        /* -- Hook is for display -- */
        if ( hook_name.includes('d-hook:') )
        {
            cwc.Hooks.prototype.invoke_clinet_hook( {
                recipient : 'display',
                hook_name : hook_name.replace("d-hook:", ""),
                arguments : hook_info.arguments
            } );

        }

        /* -- Check to see if is ment for display -- */
        else if ( hook_name.includes('c-hook:') )
        {
            cwc.Hooks.prototype.invoke_clinet_hook( {
                recipient : 'controllers',
                hook_name : hook_name.replace("c-hook:", ""),
                arguments : hook_info.arguments
            } );

        }

        /* -- Check to see if is ment for display -- */
        else
        {
            /* -- Look at reserved || -- Look for users -- */
            var hooks  = ( hook_name.includes('cwc:') )? this.all_reserved_hooks : this.all_hooks;

            /* -- Can be called using hook:*(name) usfull on data attr -- */
            var hook_name = hook_info.hook_name.replace('hook:','')

                /* -- Can be called using hook:*(name) usfull on data attr -- */
                hook_name = hook_info.hook_name.replace('cwc:','')

                console.log( hook_name );

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