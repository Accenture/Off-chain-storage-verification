const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const io = require('socket.io-client');
const deploy = require('../modules/init.js').deployRoot
const getRoot = require('../modules/init.js').getRootContract
const setID = require('../modules/init.js').setID

const http_port = conf.server.http_port
const https_port = conf.server.https_port

const http = require(`http`)
const https = require(`https`)
const _fs = require(`fs`)
const _path = require(`path`)
let express = require(`express`)
let website = express.Router()


module.exports = website

website.post(`/Deploy`, function(req, res){
	console.log(req.body)
	deploy(req.body.k, req.body.n, req.body.l, req.body.m, req.body.p)
	.then(result => {
			console.log(result)
			res.send(result)
		})
})

website.get(`/GetRoot`, function(req, res){
	console.log("Getting Root Contract")
	let address = getRoot();
	if (address == ""){
		res.status(404).send({error: "ROOT is not deployed"})
	}
	else{
		res.send({root: address})
	}
})

website.post(`/SetId`, function(req, res){
	console.log("SetId")
	setID(req.body.endpoint, req.body.address, req.body.role)
	.then(result =>{
		console.log(result)
		if (result.error){
			res.status(500).send(result)
		}
		else{
			res.send(result)
		}
	})

})
