var WebSocketServer = require("ws").Server;
var http     = require("http");
var https    = require("https");
var express  = require("express");
var ip 		 = require('ip');
var fs       = require('fs');

/* -- Set in Package.js-- */
var port    = process.env.npm_package_config_port;

var app     = module.exports = express();
	app.use( express.static(__dirname + '/public') );

var options = {
    host  : ip.address(),
    port  : port,
    path  : express.static(__dirname + '/public') ,
    method: 'GET',
    key   : fs.readFileSync('hacksparrow-key.pem'),
    cert  : fs.readFileSync('hacksparrow-cert.pem')
};

//var server = https.createServer( options, app ).listen( port );
var server = http.createServer( app ).listen( port );


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










