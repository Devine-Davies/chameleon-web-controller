/*------------------------------------------------------
* @object - TODO
* @OnFail - Would like to pass message down on why it faild
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
        /* -- register the plugin -- */
        cwc.registerPlugin(this, 'Server');

        /* -- connect to the host via web sockets -- */
        this.connection_options = options;

    };

    /*------------------------------------------------------
    * @object - Clinet key
    * @info   - Key given to clinet by server
    */
    Server.prototype.clinet_key = '';

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
    Server.prototype.connect = function( prams )
    {
        /* -- Flush any old connections -- */
        ( cwc._server_connection )? this.onclose() : null;

        /* -- Cluster code setting -- */
        this.cluster_code = ( cwc._cwc_type  == 'controller' )?
        prams['connect-code'] : this.gen_cluster_code( );

        /* -- Crete connection sucsess | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          name      : 'connection-sucsess',
          method    : function( feedback ) {
            ( prams.hasOwnProperty('connection-sucsess') )? prams['connection-sucsess']( feedback ) : null;
        } } );

        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          name      : 'connection-failed',
          method    : function( feedback ) {
            ( prams.hasOwnProperty('connection-failed') )? prams['connection-failed']( feedback ) : null;
        } } );

        var socket = null,
        host = this.connection_options.host,
        port = this.connection_options.port,
        type = this.connection_options.type;

        /* -- We are running on a display clinet -- */
        if( cwc._cwc_type  == 'display' )
        {
            /* -- Create hook | for controller connected CB-Func -- */
            cwc.Hooks.prototype.set_hook( {
              name      : 'controller-connected',
              method    : function( controllers ) {
                ( prams.hasOwnProperty('controller-connected') )? prams['controller-connected']( controllers ) : null;
            } } );

            /* -- Create hook | for controller disconnected CB-Func -- */
            cwc.Hooks.prototype.set_hook( {
              name      : 'controller-disconnected',
              method    : function( controllers ) {
                ( prams.hasOwnProperty('controller-disconnected') )? prams['controller-disconnected']( controllers ) : null;
            } } );
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
            /* -- Creat callback for class -- */
            this.create_reserved_connection_status_hooks();

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
    * @function - Create hooks
    * @info - Connect to the server
    */
    Server.prototype.create_reserved_connection_status_hooks = function( length )
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          name      : 'connection-sucsess',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_sucsess( feedback );
        } } );

        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          name      : 'connection-failed',
          method    : function( feedback ) {
            cwc.Server.prototype.on_connection_faild( feedback );
        } } );

    };

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.gen_cluster_code = function( length  )
    {
        var min = 10000;
        var max = 99999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /*------------------------------------------------------
    * @function - Connect
    * @info - Connect to the server
    */
    Server.prototype.build_ws_connection = function( host, port )
    {
        var cluster_code  = this.cluster_code;
        var clinet_type   = cwc._cwc_type;

        return 'ws:' + host + ':'+ port +
        '?cluster_code=' + cluster_code +
        '&clinet_type='  + clinet_type;

    };

    /*------------------------------------------------------
    * @function - On connection sucsess
    * @info     - how to react when connection sucsessfull
    */
    Server.prototype.on_connection_sucsess = function( server_feedback )
    {
        if( cwc._cwc_type  == 'controller' )
        {
            try {
                cwc.CacheControl.prototype.save_cluster_code(
                    server_feedback.metadata
                );
            } catch ( e ) {
                console.log('saved faild');
            }
        }

    };

    /*------------------------------------------------------
    * @function - On greeting message
    * @info     - how to react when connection sucsessfull
    */
    Server.prototype.on_connection_faild = function()
    {
        /* -- Invoke the connection sucsess message -- */
        cwc.Hooks.prototype.invoke({
            name      : 'connection-failed',
            arguments : this.connection_options,
        });

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
        cwc._server_connection = null;
    };

    /*------------------------------------------------------
    * @function - On message
    * @info - Server has sent a message
    */
    Server.prototype.onmessage = function( sned_package )
    {
        /* -- Message data -- */
        var data = JSON.parse( sned_package.data );

        /* -- Is a valid mesage : return true not valid -- */
        if( cwc.Server.prototype.validate_onmessage( data ) )
        {
            console.log( 'Message not properly formatted' );
        }

        /* -- Message for Display || Controller-- */
        else if( cwc._cwc_type  == data.recipient )
        {
            /* -- Look at reserved -- */
            cwc.Hooks.prototype.invoke({
                name         : data.action,
                arguments    : data.arguments,
                cwc_metadata : data.cwc_metadata,
            }, true );

            /* -- Look for users -- */
            cwc.Hooks.prototype.invoke({
                name         : data.action,
                arguments    : data.arguments,
                cwc_metadata : data.cwc_metadata,
            } );
        }

        /* -- Message for display & controller -- */
        else if( data.recipient  == 'all' )
        {
            cwc.ServerMethod.prototype.call_method( data );
        }

    };

    /*------------------------------------------------------
    * @function - Send message
    * @info     - Send a message to the server from client
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