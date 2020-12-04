const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const io = require('socket.io-client');
const web3 = require('../utils/web3');
const http_port = conf.server.http_port
const https_port = conf.server.https_port
const storeFile = require('../modules/storage.js').storeFile
const http = require(`http`)
const https = require(`https`)
const _fs = require(`fs`)
const _path = require(`path`)
let express = require(`express`)
let website = express.Router()
const logger = require('../utils/logger')('StorageFactory');
module.exports = website

website.post(`/StoreFile`, function(req, res){
	logger.log('info', `Storing the file :${req.body.path}`);
		logger.log('warn',`${req.body.path};FilePost;Start;${web3.eth.defaultAccount};TrustedDealer`);
	storeFile(req.body.path)
	.then(result => {
		if (result.error){
			res.status(500).send(result)
		}
		else{
			res.send(result)
		}
		logger.log('warn',`${req.body.path};FilePost;Stop;${web3.eth.defaultAccount};TrustedDealer`);
	})
})
