const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const io = require('socket.io-client');
const getAllConstants = require('../modules/constants.js')

const http_port = conf.server.http_port
const https_port = conf.server.https_port

const http = require(`http`)
const https = require(`https`)
const _fs = require(`fs`)
const _path = require(`path`)
let express = require(`express`)
let website = express.Router()

module.exports = website

website.get(`/GetAll`, function(req, res){
	getAllConstants()
	.then(result => {
		console.log(result)
		res.send(result)
	})
})
