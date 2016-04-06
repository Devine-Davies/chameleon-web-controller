var WebSocketServer = require("ws").Server;
var http    = require("http");
var express = require("express");
var ip 		= require('ip');

var app     = module.exports = express();
	app.use( express.static(__dirname + '/public') );
	app.get('/', function(req, res){
	  res.sendfile(__dirname + '/boom.html');
	  console.log('boom ');
	});
	app.listen( port );

/* -- Set in Package.js-- */
var port    = process.env.npm_package_config_port;

var server = http.createServer(app)
    server.listen(port)

/* -- Me testing global vars -- */
console.log( "----------------------------------");
console.log('Server listening at http://' +  (ip.address()) + ':' + port);
console.log( "----------------------------------");
console.log( " - Tap top left to kill on tap pad ");
console.log( "----------------------------------");

/* ----------------------------------
 * Web Chameleon Controller Server
 * ----------------------------------
 */
var cwc    = require("cwc_server");
var server = new cwc.cwc.Server({
 	type   : 'ws',
 	server : new WebSocketServer({server: server})
});










