//process.env.PORT || 5000

var WebSocketServer = require("ws").Server;
var http    = require("http");
var express = require("express");
var app     = express();
var port    = 5000;

var all_clients = [];

// Routing
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app)
server.listen(port)

/* -- Me testing global vars -- */
console.log( "---------------------------------")
console.log("http server listening on %d", port)
console.log( "---------------------------------")


/* ----------------------------------
 * Web Chameleon Controller Server
 * ----------------------------------
*/
var cwc = require("cwc_server");
var server = new cwc.cwc.Server({
 	type : 'ws',
 	server : new WebSocketServer({server: server})
});


















