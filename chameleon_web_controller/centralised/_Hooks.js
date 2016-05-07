/*------------------------------------------------------
 Hooks
 ------------------------------------------------------
 * Used for client communication and CWC call back function
 * Developer can also set hooks for complainants callback function
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    function Hooks( )
    {
        cwc.registerPlugin(this, 'Hooks');
    }

    /*------------------------------------------------------
    * @array
    * Place to store all custom method
    */
    Hooks.prototype.all_reserved_hooks = {};

    /*------------------------------------------------------
    * @array
    * Place to store all custom method
    */
    Hooks.prototype.all_hooks = {};

    /*------------------------------------------------------
    * @function
    * Create custom methods
    */
    Hooks.prototype.set_hook = function( prams )
    {
        if( prams.hasOwnProperty('hook_name') && prams.hasOwnProperty('method') )
        {
            /* -- Check to see if for display -- */
            if ( prams.hook_name.includes('cwc:') )
            {
                this.all_reserved_hooks[ prams.hook_name ] = {
                    'hook_name': prams.hook_name,
                    'method'   : prams.method
                };
            }
            else
            {
                this.all_hooks[ prams.hook_name ] = {
                    'hook_name' : prams.hook_name,
                    'method'    : prams.method
                };
            }
        }
        else
        {
            console.log('Hook name and method is required: check cwc git repo for more info on Hooks');
        }

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
                console.log('Server message is not properly formatted.');
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
        /* -- Is this a valid msg : return true not valid -- */
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
    * @function - invoke
    * @info - where we invoke custom methods
    * @d-hook: - will send the hook across server to display
    * @c-hook: - will send the hook across server to controller
    * @cwc:    - reserved hook by cwc can also be used with d-hook && c-hook
    * @hook:   - user created hook
    */
    Hooks.prototype.invoke = function( hook_info )
    {
        console.log( hook_info );

        /* -- Validate the call -- */
        if( this.validate_invoke( hook_info ) )
        {
            /* -- Get the raw hook name -- */
            var hook_name = hook_info.hook_name;

            /* -- Hook is for display -- */
            if ( hook_name.includes('d-hook:') )
            {
               this.invoke_client_hook( {
                    recipient : 'display',
                    hook_name : hook_name.replace("d-hook:", ""),
                    arguments : hook_info.arguments
                } );

            }

            /* -- Check to see is for controller -- */
            else if ( hook_name.includes('c-hook:') )
            {
                this.invoke_client_hook( {
                    recipient : 'controllers',
                    hook_name : hook_name.replace("c-hook:", ""),
                    arguments : hook_info.arguments
                } );

            }

            /* -- Call the hook on this client -- */
            else if ( hook_name.includes('cwc:') )
            {
                this.execute( this.all_reserved_hooks, hook_name, hook_info.arguments, hook_info.cwc_metadata );

            }

            /* -- is user hook -- */
            else
            {
                /* -- Can be called using hook:*(name) useful on data attr -- */
                var hook_name = hook_info.hook_name.replace('hook:','')

                /* -- Call the hook on this client -- */
                this.execute( this.all_hooks, hook_name, hook_info.arguments, hook_info.cwc_metadata );

            }
        }
    };

    /*------------------------------------------------------
    * @function - Validate invoke
    * @info     - Check to see if all is valid
    */
    Hooks.prototype.validate_invoke = function( hook_info )
    {
        /* -- Hook name is not found -- */
        if( typeof hook_info != 'object' )
        {
            console.log('Hook must be in the from of an object.');
            return false;
        }

        /* -- Hook name is not found -- */
        if( ! hook_info.hasOwnProperty( 'hook_name' ) )
        {
            console.log('A hook name in required.');
            return false;
        }

        /*  -- check is strign -- */
        if( typeof hook_info['hook_name'] != 'string' )
        {
            console.log('A hook must in a string format.');
            return false;
        }

        return true;

    };

    /*------------------------------------------------------
    * @function - execute
    * @info - call the hook
    */
    Hooks.prototype.execute = function( hooks, hook_name, args, cwc_metadata  )
    {
        if( hooks.hasOwnProperty( hook_name ) )
        {
            try {
                hooks[ hook_name ].method( args, cwc_metadata )
            } catch( e ) {
                console.log( e );
            }
        }
    }

    /* -- Add this new object to the main object -- */
    cwc.plugin(Hooks, 'Hooks');

}( window.cwc );