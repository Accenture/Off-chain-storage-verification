const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const io = require('socket.io-client');
const init = require('../modules/validation.js').init
const web3 = require('../utils/web3');
const http_port = conf.server.http_port
const https_port = conf.server.https_port
const logger = require('../utils/logger')('validationfactory');
const http = require(`http`)
const https = require(`https`)
const _fs = require(`fs`)
const _path = require(`path`)
let express = require(`express`)
let website = express.Router()

module.exports = website

website.post(`/Init`, function(req, res){
	logger.log('warn',`${req.body.seed};ElectionTrigger;Start;${web3.eth.defaultAccount};Oracle`);
	console.log("Initializing validation with seed=" + req.body.seed)
	init(req.body.seed).
	then(result => {
		if (result.error){
			res.status(500).send(result)
		}
		else{
			res.send(result)
		}
		logger.log('warn',`${req.body.seed};ElectionTrigger;Stop;${web3.eth.defaultAccount};Oracle`);
	})
})
