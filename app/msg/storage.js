const saveFile = require('../modules/storage.js').saveFile
const logger = require('../utils/logger')('Storage')
let express = require(`express`)
let website = express.Router()

module.exports = website

website.post(`/StoreFile`, function(req, res){
	logger.log('debug', `Saving file :${req.body.file}`);
	logger.log('warn',`${req.body.file};FilePost;Start;${req.body.sender};TrustedDealer`);
	saveFile(req.body.sender, req.body.file, req.body.index, req.body.chunk, req.body.tag, req.body.key)
	.then(result => {
		logger.log('debug', `Result received`);
		if (result.error){
			//log the error AFTER FINISHING THE LOGS
			res.status(500).send(result)

		}
		else{
			logger.log('warn',`${req.body.file};FilePost;Stop;${req.body.sender};TrustedDealer`);
			res.send(result)
		}
	})
})
