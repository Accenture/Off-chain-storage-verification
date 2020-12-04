"use strict";

const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const fs = require(`fs`)
const http = require(`http`)
const https = require(`https`)


let express = require(`express`)
let server = express()
let website = express.Router({ strict: false })

module.exports = {
	app: server,
	port: conf.server.http_port,
	portssl: conf.server.https_port
}
//! If not handled previously, trying to serve the requests
//!  as if it was for an existing file
server.use(express.static(`public`, { index: false }))

//! Append a few variables to the express request object
// mxpress.prodmode_init(website)
website.use(function(req, res, next)
{
	res.locals.conf = conf
	next()
})


server.use(`/Init`, require(`./init`))
server.use(`/StorageFactory`, require(`./storagefactory`))
server.use(`/ValidationFactory`, require(`./validationfactory`))
server.use(`/Constants`, require(`./constants`))
