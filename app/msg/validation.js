const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const io = require('socket.io-client');
const contracts = require('../utils/contracts');
const web3 = require('../utils/web3');
const http_port = conf.server.http_port
const https_port = conf.server.https_port
const genProof = require('../modules/validation.js').genProof
const receiveProof = require('../modules/validation.js').receiveProof
const checkProof = require('../modules/validation.js').checkProof
const voteCast = require('../modules/validation.js').voteCast
const logger = require('../utils/logger')('Validation')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
let express = require('express')
let website = express.Router()


module.exports = website

website.post(`/GenProof`, function(req, res){
	//logger.log('warn',`${req.body.filename}-${req.body.indexes};SNchallenge;Start;${req.body.sender};Validator`);
	logger.log('info', `Generation proof for :${ req.body.filename}`);
	genProof(req.body.filename, req.body.sender, req.body.indexes, req.body.validation)
	.then(result =>{
		if (result.error){
			res.status(500).send(result)
		}
		else{
			res.send(result)
		}
	})
})

website.post(`/GetPubKey`, async function(req, res){
	logger.log('debug', `Getting secret from :${ req.body.sender}`);
	/*let sender = req.body.sender;
	let validation = req.body.validation;
	let validationContract = contracts.newContract('Validation', validation);
	let owner = await validationContract.methods.getOwner().call();
	if(owner != sender){
		return res.status(500).send({error: "You are not the elected validator"});
	}*/
	let filename = req.body.filename;
	//let chunk = req.body.chunk;
	let pathTokey = 'app/modules/libpdp/data/' + filename + '.keys/apdp.pub';
	if(!fs.existsSync(pathTokey)){
		res.status(404).send({error: "File not found"})
	}
	else{
		var rstream = fs.createReadStream(pathTokey.toString());
		rstream.pipe(res);
	}
})

website.post(`/ReceiveProof`, function(req, res){
	logger.log('debug', `Receiving proof for :${req.body.filename}`);
	receiveProof(req.body.sender, req.body.filename, req.body.indexes, req.body.chal, req.body.proofstring, req.body.validation, result => {
		if (result.error){
			res.status(500).send(result)
		}
		else{
			res.send(result)
			//logger.log('warn',`${req.body.filename}-${req.body.indexes};ProofSharing;Stop;${web3.eth.defaultAccount};Validator`);
		}
	})
})

website.post(`/CheckProof`, function(req, res){
	//logger.log('warn',`${req.body.filename}-${req.body.indexes};Verification;Start;${web3.eth.defaultAccount};Validator`);
	logger.log('debug', `Checking proof for :${req.body.filename}`);
	checkProof(req.body.filename, req.body.indexes, req.body.proofstring, req.body.chal, req.body.validation, req.body.sender)
	.then(result =>{
		if (result.error){
			res.status(500).send(result)
		}
		else{
			res.send(result)
		}
	})
})

/*website.post('/ReceiveVote',function(req, res){
	logger.log('debug', `Receiving vote from :${req.body.sender}`);
	voteCast(req.body.sender, req.body.result, req.body.validation)
	.then(result =>{
		if (result.error){
			res.status(500).send(result)
		}
		else{
			res.send(result)
		}
	})
})*/
