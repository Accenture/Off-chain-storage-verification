"use strict";

const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const fs = require(`fs`)
const http = require(`http`)
const https = require(`https`)
const bodyParser = require("body-parser");
const formData = require("express-form-data");


let express = require(`express`)
let server = express()
let website = express.Router({ strict: false })

server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
server.use(bodyParser.json({ limit: '50mb', extended: true }));

const options = {
  uploadDir: 'app/modules/libpdp/data',
  autoClean: true,
  maxFieldsSize: 9007199254740991
};

// parse data with connect-multiparty.
server.use(formData.parse(options));
// clear from the request and delete all empty files (size == 0)
server.use(formData.format());
// change file objects to stream.Readable
server.use(formData.stream());
// union body and files
server.use(formData.union());

//! If not handled previously, trying to serve the requests
//!  as if it was for an existing file
server.use(express.static(`public`, { index: false }))

//! Append a few variables to the express request object
website.use(function(req, res, next)
{
	res.locals.conf = conf
	next()
})


server.use(`/API`, require(`./api/api`).app)
server.use(`/MSG`, require(`./msg/msg`).app)

module.exports = {
	app: server,
	port: conf.server.http_port,
	portssl: conf.server.https_port
}
