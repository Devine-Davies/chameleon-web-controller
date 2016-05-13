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
    Server.prototype.client_clusters = {
    };

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
        this.server_info.server.on("connection", function( client )
        {
            var metadata           = cwc.Server.prototype.get_query_params( client.upgradeReq.url );
                metadata.key       = client.upgradeReq.headers['sec-websocket-key'];
                metadata.timestamp = Date.now();

            /* -- Append our own cwc propaties onto the client object -- */
            client.cwc_metadata = metadata;

            /* -- Client has connected -- */
            cwc.Server.prototype.save_client( client );

            /* -- Client has disconnected -- */
            client.onclose = function ( evt )
            {
                cwc.Server.prototype.drop_client(
                    client
                );
            };

            /* -- Server message -- */
            client.onmessage = function ( evt )
            {
                cwc.Server.prototype.process_request(
                    JSON.parse( evt.data ), metadata
                );
            };

        });

    };

    /*------------------------------------------------------
    * @function - Drop client
    * @info - Send client pos to know witch one to drop
    */
    Server.prototype.drop_client = function( client )
    {
        var metadata    = client.cwc_metadata;

        /* -- Check to see if cluster exists -- */
        if( this.client_clusters.hasOwnProperty( metadata.cluster_code ) )
        {
            if( metadata.client_type == 'display'  )
            {
                delete this.client_clusters[ metadata.cluster_code ];
                //console.log( 'Dropping display with key: ' + metadata.key );
            }

            /* -- Deleting client -- */
            else if ( metadata.client_type == 'controller' )
            {
                var controllers = this.client_clusters[ metadata.cluster_code ].controllers;

                /* -- Check to see if the controller exists -- */
                if( controllers.hasOwnProperty( metadata.key ) )
                {
                    /* -- Delete client -- */
                    delete this.client_clusters[ metadata.cluster_code ].controllers[ metadata.key ];
                    //console.log( 'Dropping controller with key: ' + metadata.key );

                    /* -- Send a message to the display stating that a client has disconnected -- */
                    this.client_clusters[ metadata.cluster_code ].display.send( this.format_msg( {
                        sender       : 'server',
                        recipient    : 'display',
                        hook_name    : 'cwc:controller-disconnected',
                        arguments    : this.get_all_controller_in_cluster( metadata.cluster_code ),
                    } ) );
                }
            }
        }

    };

    /*------------------------------------------------------
    * @function - Save client
    * @info - Store the client in the (connected_clients) array,
    * also send a message to the client asking for it's type ( Display/Controller )
    */
    Server.prototype.save_client = function ( client )
    {
        var connected      = false;
        var client_type    = client.cwc_metadata.client_type;

        if( client_type == 'display' )
        {
            connected = this.process_new_cluster(
                client
            );
        }

        else if( client_type == 'controller' )
        {
            connected = this.assign_controller_to_cluster(
                client
            );
        }

        if( ! connected )
        {
            /* -- Send a connection failed message back to client -- */
            client.send( this.format_msg( {
                recipient    : client_type,
                sender       : 'server',
                hook_name    : 'cwc:connection-failed',
                arguments    : 'There was a problem trying to content...'
            } ) );

            /* -- Close client if no cluster to join onto -- */
            client.close();
        }
        else
        {
            /* -- Send a connection successfully message back to client -- */
            client.send( this.format_msg( {
                recipient    : client_type,
                sender       : 'server',
                hook_name    : 'cwc:connection-success',
                arguments    : client.cwc_metadata
            } ) );
        }

    };

    /*------------------------------------------------------
    * @function - Set client type
    * @info     - When the client say hi back with there type
    */
    Server.prototype.get_query_params = function( qs )
    {
        qs = qs.substr( qs.indexOf("?") + 1);
        qs = qs.split('+').join(' ');

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs))
        {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right client
    */
    Server.prototype.process_new_cluster = function( client )
    {
        var cluster_code   = client['cwc_metadata'].cluster_code;

        //console.log('Cluster code: ' + cluster_code);

        /* -- Check to see if cluster is not occupied -- */
        if(! this.client_clusters.hasOwnProperty( cluster_code ) )
        {
            this.client_clusters[ cluster_code ] = {
                'display'     : client,
                'controllers' : {}
            }
        }

        /* -- If so override the old display with the new incoming one -- */
        else
        {
            this.client_clusters[ cluster_code ]['display'] = client;
        }

        return true;

    };

    /*------------------------------------------------------
    * @function - Assign new client to cluster
    * @info     - Will add the client to a required cluster id
    */
    Server.prototype.assign_controller_to_cluster = function( client )
    {
        var cluster_code   = client['cwc_metadata'].cluster_code;
        var controller_key = client['cwc_metadata'].key;

        /* -- Check to see if cluster exists -- */
        if( this.client_clusters.hasOwnProperty( cluster_code ) )
        {
            /* -- Save the client -- */
            this.client_clusters[ cluster_code ].controllers[ controller_key ] = client;
            //console.log('Controller connected to : ' + cluster_code );

            /* -- Send a message to the display stating that a client has connected -- */
            this.client_clusters[ cluster_code ].display.send( this.format_msg( {
                sender       : 'server',
                recipient    : 'display',
                hook_name    : 'cwc:controller-connected',
                arguments    : this.get_all_controller_in_cluster( cluster_code ),
            } ) );

            return true;
        }

        return false;

    };

    /*------------------------------------------------------
    * @function - Get all controller keys in cluster
    * @info     - Will add the client to a required cluster id
    */
    Server.prototype.get_all_controller_in_cluster = function( cluster_code )
    {
        /* -- Check to see if cluster exsists -- */
        if( this.client_clusters.hasOwnProperty( cluster_code ) )
        {
            var c_clients         = this.client_clusters[ cluster_code ].controllers;
            var clients_metadata  = [];

            for (var controller_key in c_clients)
            {
                var metadata = c_clients[ controller_key ].cwc_metadata;

                clients_metadata.push( metadata );
            }

            return clients_metadata;
        }

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right client
    */
    Server.prototype.process_request = function( sent_package, metadata )
    {
        /* -- Add the clients meta-data to the code -- */
        sent_package['cwc_metadata'] = metadata;

        // if( sent_package.recipient == "" )
        // {

        // }

        /* -- Whom the message shall be sent to -- */
        switch( sent_package.recipient )
        {
            case  'server' :
                this.server_message( sent_package );
            break;

            case 'display' :
                this.send_message_to_display( sent_package );
            break;

            case 'controllers' :
                this.send_message_controllers( sent_package );
            break;

            case 'controller' :
                this.send_message_controllers( sent_package );
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
    Server.prototype.send_message_to_display = function( sent_package )
    {
        try {
            this.client_clusters[ sent_package.cwc_metadata.cluster_code ]['display'].send( this.format_msg(
                 sent_package
            ) );
        }
        catch (e) {
            //console.log('Could not send message...');
        }

    };

    /*------------------------------------------------------
    * @function - Send message controllers
    * @info     - Sending message to all controllers
    */
    Server.prototype.send_message_controllers = function( sent_package )
    {
        var c_client       = this.client_clusters[ sent_package.cwc_metadata.cluster_code ].controllers;
        var format_package = this.format_msg( sent_package );

        for( var index in c_client )
        {
            var controller = c_client[ index];
                controller.send(
                    format_package
                );
        }

    };

    /*------------------------------------------------------
    * @function - Format message
    * @info     - Use JSON across servers
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