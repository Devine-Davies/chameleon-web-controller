---
layout       : feature-doc
title        : "Connecting"
date         : 2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

f_image      : "images/server-events@2x.png"
categories   : general
tax          : general
---
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
<!--more-->

## Introduction
Both the `cwc_display` and `cwc_controller` have built in server events, allowing each screen to interact with the node `cwc server` (Setup link). When either the `cwc_display` or `cwc_controller` are installed you can then define each of the following setting:

| Setting  | Type     | Vales                                         |
| -------- | -------- | ----------------------------------------------|
| host     | sting    | http://localhost.com                          |
| port     | int      | 5000                                          |
| type     | sting    | 'ws'                                          |

{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Server Object
* @info   - Establishing a connection to the server
*/
var server = new cwc.Server({
    host : 'http://localhost.com',
    port : 5000,
    type : 'ws'
});
{% endhighlight %}

>At this time, Chameleon Web Controller only has support for WebSocket. In newer releases of the system we hope to support other Node Sockets implementations.

## Connecting a client
Whence the `cwc.Server` object is initiated, calling the `connect` method on the object will allow the clinet to connect. The `connect` method has supported for predefining hooks for when the server is talking to the clinet.

| Object         | Settings                | Type | Invoked by server                                         |
| -----          | ------------------      | ---- | --------------------------------------------------------- |
| cwc_c && cwc_d | connection-success      | Hook | Called when the clinet has sucsessfuly connected          |
| cwc_c && cwc_d | connection-failed       | Hook | Called when the clinet has failed to connecte             |
| cwc_controller | cluster-code            | int  | Cluster you wish to join                                  |
| cwc_display    | controller-connected    | Hook | Called when the clinet has connect to display             |
| cwc_display    | controller-disconnected | Hook | Called when the clinet has connect to display             |

Below is an continuation of the pervious example, this snippt outline how to connect both the `display` and `controller` to a cluster group.

{% highlight javascript linenos %}
/*------------------------------------------------------
* @methord - cwc.Server Connect methord
* @info   - cwc_display.js example
*/
server.connect({
  'connection-sucsess'      : function ( data        ){ console.log( data ); },
  'connection-failed'       : function ( data        ){ console.log( data ); },
  'controller-connected'    : function ( controllers ){ console.log( data ); },
  'controller-disconnected' : function ( controllers ){ console.log( data ); }
});

/*------------------------------------------------------
* @methord - cwc.Server Connect methord
* @info   - cwc_controller.js example
*/
server.connect({
  'cluster-code'            : 00000, // only required by controller
  'connection-sucsess'      : function ( data        ){ console.log( data ); },
  'connection-failed'       : function ( data        ){ console.log( data ); },
});
{% endhighlight %}

>Only the cluster-code is required when trying to connect a controller. Otherwise the `cluster-code` is auto generated by the display.

When the functions listed are invoked by the server, feedback information is passed back. The table below outlines the infromation recived by the server.

| Keys          | Vales                                                     |
| ------------- | --------------------------------------------------------- |
| clinet_type   | The type of clinet `display` or `Controller`              |
| cluster_code  | The cluster code of the group connected to                |
| key           | the key given to the client by the server                 |
| timestamp     | The time (in milliseconds) the connection was established |

>When trying to acsess this infromatrion from the `controller-connected` and `controller-disconnected` events, infromation is presented in an `array` formatt.

## Display and Controllers messaging
In order to pass messages between a the Display and Controllers "or via verser" a `hook` must be initiated first, in order to react to the message. More about hooks can be found here

The 'cwc.Server' object provides a `send_message` methord for messaging the desired client. With every message sent the following must be provided.

| Keys          | Type     | Vales                                                            |
| ------------- | -------- | --------------                                                   |
| recipient     | sting    | To whome the message should be sent to `display` or `Controller` |
| action        | sting    | The methord you wish to invoke                                   |
| arguments     | *        | Any values that will need to be passed along with the message    |

>`JSON.stringify` is applied to all arguments being passed to the server and deconstructed by clients.

### Display client
{% highlight javascript linenos %}
/*------------------------------------------------------
* @Hook - cwc.Hooks Connect methord
* @info - Create a hook to that can be called from all controller
*/
hooks.set_hook( {
  name   : 'called-from-controller',
  method : function( prams ) { console.log( prams ); } // { one : 121, two : 212 }
});

/*------------------------------------------------------
* @methord - Send message
* @info    - Send a message to all connected controllers
*/
server.send_message({
    recipient : 'controllers',
    action    : 'called-from-display',
    arguments : 'Hello from Display'
});
{% endhighlight %}

### Controller client
{% highlight javascript linenos %}
/*------------------------------------------------------
* @Hook - cwc.Hooks Connect methord
* @info - Create a hook to that can be called from the display
*/
hooks.set_hook( {
  name   : 'called-from-display',
  method : function( prams ) { console.log( prams ); } //Hello from Display
});

/*------------------------------------------------------
* @methord - Send message
* @info    - Send a message to all connected controllers
*/
server.send_message({
    recipient : 'display',
    action    : 'called-from-controller',
    arguments : { one : 121, two : 212 }
});
{% endhighlight %}

## More snippets

### Looping through controllers
The snippit below can be used with both the `controller-connected` and `controller-disconnected` events to retrieve each clinet individually

{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Server Object
* @info   - Establishing a connection to the server
*/
var server = new cwc.Server({
    host : 'http://localhost.com',
    port : 5000,
    type : 'ws'
});

/*------------------------------------------------------
* @methord - cwc.Server Connect methord
* @info    - cwc_display.js example
*/
server.connect({
  'connection-sucsess'      : function ( data ){ console.log( data ); },
  'connection-failed'       : function ( data ){ console.log( data ); },
  'controller-connected'    : function ( controllers ){ controllers_loop( data ); },
  'controller-disconnected' : function ( controllers ){ controllers_loop( data ); }
});

/*------------------------------------------------------
* @function - Controllers loop
* @info     - Callback function for controller-connected && controller-disconnected
*/
function controllers_loop( controllers )
{
    for( var i = 0; i < controllers.length; i++ )
    {
        var controller = controllers[ i ];

        console.log( controller );
    }
};
{% endhighlight %}