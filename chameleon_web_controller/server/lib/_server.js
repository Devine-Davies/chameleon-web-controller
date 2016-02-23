!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function Server( extend )
    {
        cwc.registerPlugin(this, 'Server');

        this.server_info = extend;

        this.start_connection( );

    };

    /*------------------------------------------------------
    * @object - The server were connected to
    */
    Server.prototype.server_info = null;

    /*------------------------------------------------------
    * @Array - Connected clients
    * @info - Save all the connected clients here
    */
    Server.prototype.connected_clients = [
    ];

    /*------------------------------------------------------
    * @function - Start connection
    * @info - Starts the server
    */
    Server.prototype.start_connection = function()
    {
        switch ( this.server_info.type )
        {
            case 'ws' :
            this.websocket_server_handler(
            );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Set extended options
    * @info - Combines the global extend object with this options object
    * allowing further extended options
    */
    Server.prototype.websocket_server_handler = function( )
    {
        this.server_info.server.on("connection", function( ws )
        {
            var client_pos = Server.prototype.connected_clients.length;

            /* -- Client has connected -- */
            cwc.Server.prototype.save_client(
                ws
            );

            /* -- Client has disconnected -- */
            ws.close = function ( evt )
            {
                cwc.Server.prototype.drop_client(
                    client_pos
                );
            };

            /* -- Server message -- */
            ws.onmessage = function ( evt )
            {
                cwc.Server.prototype.process_request(
                    JSON.parse( evt.data )
                );
            };

        });

    };

    /*------------------------------------------------------
    * @function - Drop clinet
    * @info - Send clinet pos to know witch one to drop
    */
    Server.prototype.drop_client = function( client_pos )
    {
        var array = this.connected_clients;

        /* -- Enpy the value : but keep the pos for use of id -- */
        delete array[ client_pos ];

    };

    /*------------------------------------------------------
    * @function - Save client
    * @info - Store the clinet in the (connected_clients) array,
    * also send a message to the clinet asking for it's type ( Display/Controller )
    */
    Server.prototype.save_client = function ( connection )
    {
        var clinet_id = this.connected_clients.length;

        this.connected_clients.push({
            'id'         : clinet_id,
            'type'       : null,
            'connection' : connection
        });

        /* -- Check to see if all have screen types -- */
        connection.send( this.format_msg({
            recipient    : 'all',
            sender       : 'server',
            action       : 'hi',
            arguments    : clinet_id,
        } ) );

    };

    /*------------------------------------------------------
    * @function - Set client type
    * @info - When the client say hi back with there type
    */
    Server.prototype.set_client_type = function( args )
    {
        this.connected_clients[ args.client_id ].type = args.sender;

        // -- Send message back stating that they have connected --
        this.process_request({
            recipient : args.sender, // display || controller
            sender    : 'server',
            action    : 'display_set',
            arguments : '',
        });

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    Server.prototype.process_request = function( message )
    {
        console.log('----------------');
        console.log( message );
        console.log('----------------');

        /* -- Whom the message shall be sent to -- */
        switch( message.recipient )
        {
            case  'server' :
                this.server_message( message );
            break;

            case 'display' :
                this.send_message_to_display( message );
            break;

            case 'controller' :
                this.send_message_controllers( message );
            break;
        }

    };

    /*------------------------------------------------------
    * @function - Server message
    * @info - Message is for the server
    */
    Server.prototype.server_message = function( message )
    {
        cwc.ServerMethod.prototype.call_method(
            message
        );

    };

    /*------------------------------------------------------
    * @function - Send message to display
    * @info - Sending message to all displays
    */
    Server.prototype.send_message_to_display = function( message )
    {
        /* -- Will return an array -- */
        var display_client = this.get_client('display')

        if( display_client != null )
        {
            display_client[0].connection.send( this.format_msg(
                 message
            ));
        }

    };

    /*------------------------------------------------------
    * @function - Send message controllers
    * @info - Sending message to all controllers
    */
    Server.prototype.send_message_controllers = function( message )
    {
        /* -- Will return an array -- */
        var controllers_client = this.get_client('controller')

        var message = this.format_msg( message );

        if( controllers_client != null )
        {
            for( var i = 0; i < controllers_client.length; i++)
            {
                controllers_client[ i ].connection.send(
                    message
                );
            }
        }

    };

    /*------------------------------------------------------
    * @function - Get client
    * @info     - Give a client_type
    * @return   - All found clients
    */
    Server.prototype.get_client = function( client_type )
    {
        var c_clients     = this.connected_clients;
        var c_leng        = c_clients.length;
        var found_clients = [];

        for( var i = 0; i < c_leng; i++ )
        {
            if ( i in c_clients )
            {
                var client = c_clients[ i ];

                if( client.type == client_type )
                {
                    found_clients.push( client );
                }
            }
        }
        return ( found_clients.length > 0 )? found_clients : null;

    };

    /*------------------------------------------------------
    * @function - Format msg
    * @info     - Use json across servers
    */
    Server.prototype.format_msg = function( msg )
    {
        /* -- Might want to check is obj -- */
        return JSON.stringify( msg );

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(Server, 'Server');

}( module.exports.cwc );