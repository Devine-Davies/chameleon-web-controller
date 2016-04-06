!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @object - Server Object
    * @info   - Used to handle communication between server
    * and client
    */
    function Server( options )
    {
        /* -- register the plugin -- */
        cwc.registerPlugin(this, 'Server');

        /* -- connect to the host via web sockets -- */
        this.connection_options = options;

    };

    Server.prototype.connection_options = {};

    /*------------------------------------------------------
    * @object - Connection
    * @info   - The connection object to main server
    */
    Server.prototype.connection = null;

    /*------------------------------------------------------
    * @int  - Client id
    * @info - Store the given clients id from the server
    */
    Server.prototype.client_id = null;

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
        var socket = null,
        host = this.connection_options.host,
        port = this.connection_options.port,
        type = this.connection_options.type;

        /* -- We are running on a display clinet -- */
        if( cwc._cwc_type  == 'display' )
        {
            /* -- Create a random connection code -- */
            cwc._cluster_code = cwc._cwc_connection_code(6, 'cwc'); //  'pdc262-cwc'; //
        }

        /* -- We are running on a controller clinet -- */
        else if( cwc._cwc_type  == 'controller' )
        {
            /* -- Cluster code will need to be supplied by user -- */
            cwc._cluster_code = cluster_code;
        }

        /* -- Check the type of connection -- */
        switch ( type )
        {
            case 'ws':
                socket = new WebSocket ( this.build_ws_connection (host, port, type) );
            break;
        }

        /* -- Allow our cwc object to be reatch at the _global scope -- */
        if( socket )
        {
            /* -- Get ready to acsept message back -- */
            this.on_greetings();

            /* -- Set global connection  -- */
            cwc._server_connection = socket;
        }

        /* -- Set appropiat socket evetn's -- */
        if( socket && type == 'ws' )
        {
            this.set_connection_events();
        }

    };

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.build_ws_connection = function( host, port )
    {
        var cluster_code  = cwc._cluster_code;
        var clinet_type   = cwc._cwc_type;
        var clinet_id     = cwc._cwc_connection_code(6, 'cwc-clinet' );

        return 'ws:' + host + ':'+ port +
        '?cluster_code=' + cluster_code +
        '&clinet_type='  + clinet_type;

    };

    /*------------------------------------------------------
    * @object - On greetings
    * @info   - Get ready to accept greetings message from server
    */
    Server.prototype.on_greetings = function()
    {
        cwc.ServerMethod.prototype.create_method({
            action   : 'greetings',
            callback : function ( message ) {
                cwc.Server.prototype.on_greeting_message( message );
            }
        } );

    }

    /*------------------------------------------------------
    * @function - On greeting message
    * @info     - how to react when connection sucsessfull
    */
    Server.prototype.on_greeting_message = function()
    {
        if( cwc._cwc_type  == 'controller' )
        {
            cwc.ClusterCodeCache.prototype.save_cluster_code(
                cwc._cluster_code, cwc._cwc_type
            );
        }

    };

    /*------------------------------------------------------
    * @function - Set connection events
    * @info - onerror, onclose, onopen,onmessage
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
    * @info - on connect open
    */
    Server.prototype.onopen = function( con )
    {

    };

    /*------------------------------------------------------
    * @function - On error
    * @info - on connect error
    */
    Server.prototype.onerror = function()
    {
        console.log('Error connectiong');

    };

    /*------------------------------------------------------
    * @function - On close
    * @info - Server has sent a message
    */
    Server.prototype.onclose = function()
    {
        console.log('closed ');

    };

    /*------------------------------------------------------
    * @function - On message
    * @info - Server has sent a message
    */
    Server.prototype.onmessage = function( data )
    {
        /* -- Message data -- */
        var data = JSON.parse( data.data );

        //console.log( data );

        /* -- Is a valid mesage : return true not valid -- */
        if( cwc.Server.prototype.validate_onmessage( data ) )
        {
            console.log( 'Message not properly formatted' );
        }

        /* -- Message for Display || Controller-- */
        else if( cwc._cwc_type  == data.recipient )
        {
            cwc.ServerMethod.prototype.call_method( data );
        }

        /* -- Message for display & controller -- */
        else if( data.recipient  == 'all' )
        {
            cwc.ServerMethod.prototype.call_method( data );
        }

    };

    /*------------------------------------------------------
    * @function - Send message
    * @info - Send a message to the server from dlient
    */
    Server.prototype.send_message = function( data )
    {
        /* -- Is this a valid mesage : return true not valid -- */
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
    * @function - Validate onmessage
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
            if ( ! data.hasOwnProperty( checks[i] ) )
            {
                console.log('Server message is not properly fromatted.');
                return true;
            }
        }

        return false;

    };

    cwc.plugin(Server, 'Server');

}( window.cwc );