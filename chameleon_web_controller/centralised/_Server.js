/*------------------------------------------------------
 Server
 ------------------------------------------------------
 * Handles connection process
 ------------------------------------------------------
*/
!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @object - Server Object
    * @info   - Used to handle communication between server
    * and client
    */
    function Server( options )
    {
        /* -- register the plug-in -- */
        cwc.registerPlugin(this, 'Server');

        /* -- connect to the host via web sockets -- */
        this.connection_options = options;

    };

    /*------------------------------------------------------
    * @object - Client key
    * @info   - Key given to client by server
    */
    Server.prototype.client_key = '';

    /*------------------------------------------------------
    * @object - Cluster code
    * @info   - Code used to connect displays
    */
    Server.prototype.cluster_code = '';

    /*------------------------------------------------------
    * @object - Connection options
    * @info   - Options passed by the client
    */
    Server.prototype.connection_options = {

    };

    /*------------------------------------------------------
    * @object - Connection
    * @info   - The connection object to main server
    */
    Server.prototype.connection = null;


    /*------------------------------------------------------
    * @int  - Cluster code
    * @info - For the group we want to connect to or on.
    */
    Server.prototype.cluster_code = null;

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.connect = function( cluster_code )
    {
        /* -- Flush any old connections -- */
        ( cwc._server_connection )? this.onclose() : null;

        /* -- Cluster code setting -- */
        if( ( cwc._cwc_type  == 'controller' ) && ( cluster_code != null ) )
        {
            this.cluster_code = cluster_code;
        }
        else
        {
            this.cluster_code = this.gen_cluster_code( );
        }

        var socket = null,
        host = this.connection_options.host,
        port = this.connection_options.port,
        type = this.connection_options.type;

        /* -- Check the type of connection -- */
        switch ( type )
        {
            case 'ws':
                socket = new WebSocket ( this.build_ws_connection (host, port, type) );
            break;
        }

        /* -- If connected -- */
        if( socket )
        {
            /* -- Create callback for class -- */
            this.create_reserved_connection_status_hooks();

            /* -- Set global connection  -- */
            cwc._server_connection = socket;
        }

        /* -- Set appropriate socket events -- */
        if( socket && type == 'ws' )
        {
            this.set_connection_events();
        }

    };

    /*------------------------------------------------------
    * @function - Create hooks
    * @info     - Connect to the server
    */
    Server.prototype.create_reserved_connection_status_hooks = function( length )
    {
        /* -- Crete connection fill | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:connection-success',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_success( feedback );
        } } );

        /* -- Crete connection fill | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:connection-failed',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_faild( feedback );
        } } );

    };

    /*------------------------------------------------------
    * @function - Connect
    * @info     - Connect to the server
    */
    Server.prototype.gen_cluster_code = function( length  )
    {
        var min = 10000;
        var max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /*------------------------------------------------------
    * @function - Connect
    * @info     - Connect to the server
    */
    Server.prototype.build_ws_connection = function( host, port )
    {
        var cluster_code  = this.cluster_code;
        var client_type   = cwc._cwc_type;

        return 'ws:' + host + ':'+ port +
        '?cluster_code=' + cluster_code +
        '&client_type='  + client_type;

    };

    /*------------------------------------------------------
    * @function - On connection success
    * @info     - how to react when connection successful
    */
    Server.prototype.on_connection_success = function( server_feedback )
    {
        /* -- Check to see if the developer has set hook-- */
        cwc.Hooks.prototype.invoke({
            hook_name : 'connection-success',
            arguments : server_feedback,
        } );

        /* -- Save the data -- */
        if( cwc._cwc_type  == 'controller' )
        {
            /* -- save the connection data -- */
            cwc.Hooks.prototype.invoke({
                hook_name : 'cwc:save-client-data',
                arguments : server_feedback,
            } );
        }

    };

    /*------------------------------------------------------
    * @function - On greeting message
    * @info     - how to react when connection successful
    */
    Server.prototype.on_connection_faild = function()
    {
        /* -- Invoke the connection success message -- */
        cwc.Hooks.prototype.invoke({
            hook_name      : 'connection-failed',
            arguments : this.connection_options,
        });

    };

    /*------------------------------------------------------
    * @function - Set connection events
    * @info     - onerror, onclose, onopen, onmessage
    */
    Server.prototype.set_connection_events = function()
    {
        /* -- Set us the event handleres -- */
        cwc._server_connection.onerror = function(){
            cwc.Server.prototype.onerror(
            );
        };

        cwc._server_connection.onclose = function(){
            cwc.Server.prototype.onclose(
            )
        };

        cwc._server_connection.onopen = function(  ){
            cwc.Server.prototype.onopen(
                this.connection
            )
        };

        cwc._server_connection.onmessage = function ( data ) {
            cwc.Server.prototype.onmessage(
                data
            );
        };

    };

    /*------------------------------------------------------
    * @function - On open
    * @info     - on connect open
    */
    Server.prototype.onopen = function( con )
    {

    };

    /*------------------------------------------------------
    * @function - On error
    * @info     - on connect error
    */
    Server.prototype.onerror = function()
    {
        console.log('Error connecting');

    };

    /*------------------------------------------------------
    * @function - On close
    * @info     - Server has sent a message
    */
    Server.prototype.onclose = function()
    {
        cwc._server_connection = null;
    };

    /*------------------------------------------------------
    * @function - On message
    * @info     - Server has sent a message
    */
    Server.prototype.onmessage = function( revived_package )
    {
        /* -- Message data -- */
        var hook_info = JSON.parse( revived_package.data );

        /* -- Look for users -- */
        cwc.Hooks.prototype.invoke({
            hook_name    : hook_info.hook_name,
            arguments    : hook_info.arguments,
            recipient    : hook_info.recipient,
            cwc_metadata : hook_info.cwc_metadata,
        } );

    };

    /*------------------------------------------------------
    * @function - Send message
    * @info     - Send a message to the server from client
    */
    Server.prototype.send_message = function( data )
    {
        /* -- Is this a valid message : return true not valid -- */
        if( ! this.validate_onmessage( data ) )
        {
            if( cwc._server_connection )
            {
                if( cwc._server_connection.readyState == 1 )
                {
                    cwc._server_connection.send( JSON.stringify(
                        data
                    ) );
                }
            }
        }

    };

    /*------------------------------------------------------
    * @function - Validate on-message
    * @info - Validate the message from the server
    */
    Server.prototype.validate_onmessage = function( data )
    {
        var checks = [
            /* -- This is the method we wish to run -- */
            'action',

            /* -- Whome the message is for -- */
            'recipient',

            /* -- Arguments to be passed to method -- */
            'arguments',
        ];

        for( var i = 0; i < checks.length; i++ )
        {
            /* -- If property was not found : return true -- */
            if ( ! data.hasOwnProperty( checks[ i ] ) )
            {
                console.log('Server message is not properly fromatted.');
                return true;
            }
        }

        return false;

    };

    cwc.plugin(Server, 'Server');

}( window.cwc );