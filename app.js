"use strict";

try
{
	require(`my-team-tools`)
}
catch(e)
{
	console.error(`my-team-tools is not installed`)
	process.exit(0)
}

const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const fs = require(`fs`)

let server = require(`./app/server`)
let httpserver = require('http').Server(server.app)
let sslwebserv = require('https').Server({
	key: fs.readFileSync(`app/certs/key.pem`),
	cert: fs.readFileSync(`app/certs/cert.pem`)
}, server.app)



let ssl = conf.server.ssl
if (ssl == "false") {
	let iosocket = require(`./app/socket-io`)(httpserver)
	let ws_listener = httpserver.listen(server.port, function()
	{
		console.log(`This app is now listening on port`, server.port)
	})
} else {
	let iosocket = require(`./app/socket-io`)(sslwebserv)
	let ws_listenersecure = sslwebserv.listen(conf.server.https_port, function()
	{
		console.log(`This app is now listening on port`, server.portssl)
	})
}
