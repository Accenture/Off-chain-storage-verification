const { isEmpty } = require('lodash');
const contracts = require('../utils/contracts');
const web3 = require('../utils/web3');
const execSync = require('child_process').execSync;
const fs = require('fs');
const fsHandler = require('../utils/fsHandler');
const http = require('http');
const { instance } = require('../constants');
const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()
const sleep = require(`sleep`);


const logger = require('../utils/logger')('Validation');
const FormData = require('form-data');

const identityContract = contracts.getContract('Identity');
const validationFactoryContract = contracts.getContract('ValidationFactory');

function eventListener(){

  validationFactoryContract.events.ValidatorElected({}, async function(error, event){
    let result = event.returnValues
    if (result.validator == web3.eth.defaultAccount){
      logger.log('warn',`${result.validator};Election;Stop;${web3.eth.defaultAccount};Validator`);
      logger.log('info', `Selected validator :${web3.eth.defaultAccount}`);
      let validationContract = contracts.newContract('Validation', result.validation)
      let output = await validationContract.methods
      .storageNodeSelect()
      .send({
        from: web3.eth.defaultAccount,
        gas: 9007199254740991
      })
      .on('transactionHash', txHash => {logger.log('debug', `txHash:${txHash}`)});
      if (!isEmpty(output.events)){
        //logger.log('info', `Returned values :${output.events.StorageNodeSelected.returnValues}`);
        const storageFactoryContract = contracts.getContract('StorageFactory');
        let tdaddress = output.events.StorageNodeSelected.returnValues.trustedDealer;
        let filename = web3.utils.hexToAscii(output.events.StorageNodeSelected.returnValues.file);
        let storageNodes = output.events.StorageNodeSelected.returnValues.storageNodes;
        for(var i=0; i<storageNodes.length; i++){
          let sn = await identityContract.methods.getStorageNode(storageNodes[i]).call();
          let _msgEndPoint = sn[0];
          let _port = conf.server.http_port;
          if (_msgEndPoint.includes(":")){
            let endp = _msgEndPoint.split(":");
            _msgEndPoint = endp[0];
            _port = endp[1];
          }
          logger.log('info', `filename :${filename}`);
          logger.log('debug', `BC filename :${web3.utils.asciiToHex(filename)}`);
          let chunksarray = [];
          let receipt = await validationContract.methods
          .chunksNodeSelect(storageNodes[i])
          .send({
            from: web3.eth.defaultAccount,
            gas: 9007199254740991
          })
          .on('transactionHash', txHash => {logger.log('debug', `txHash:${txHash}`)});
          if (!isEmpty(receipt.events)){
            chunksarray = receipt.events.ChunkSelection.returnValues.chunks;
          }
          let chunks = chunksarray.join("-");
          logger.log('info', `ChunkIndex :${chunks}`);
          var form = new FormData({ maxDataSize: 9007199254740991 });
          form.append('filename', filename);
          form.append('sender', web3.eth.defaultAccount);
          form.append('indexes', chunks);
          form.append('validation', result.validation);
          form.submit({
            host: _msgEndPoint,
            path: '/MSG/Validation/GenProof',
            port: _port
          }, function(err, res) {
            if (err){
              logger.log('debug', `error : ${err}`);
            }
          });
        }
      }
    }
  });
}



async function init(seed){
  let result = {error: "The validation process was not initialized"};
  logger.log('warn',`${seed};Election;Start;${web3.eth.defaultAccount};Oracle`);
  let output = await validationFactoryContract.methods
  .init(web3.utils.asciiToHex(seed))
  .send({
    from: web3.eth.defaultAccount,
    gas: 9007199254740991
  })
  .on('transactionHash', txHash => {logger.log('debug', `txHash:${txHash}`)});
  if (!isEmpty(output.events)){
    result = output.events.ValidatorElected.returnValues;
  }
  return result;
}
/*This function refers to the GenProof function from the original paper*/
async function genProof(filename, sender, indexes, validation){
  let validationContract = contracts.newContract('Validation', validation);
  let owner = await validationContract.methods.getOwner().call();
  if(owner != sender){
    return {error: "You are not the elected validator"};
  }
  let proofarray = [];
  let chalarray = [];
  //Logging the inputs
  logger.log('info', `Sender :${sender}`);
  logger.log('info', `Filename :${filename}`);
  logger.log('info', `ChunkIndex :${indexes}`);
  logger.log('info', `ValidationAddress :${validation}`);
  //Opening the key of the specific chunk
  //let key = fs.readFileSync('app/modules/libpdp/storage/'+ filename +'.c_' + index +'.key');
  let chunksarray = indexes.split("-");
  for(var i=0; i<chunksarray.length; i++){
    let index = chunksarray[i];
    //Challenge Generation
    let sout = execSync('./app/modules/libpdp/libpdp_executable --filename app/modules/libpdp/storage/' + filename +
    ' --block '+ index + ' --challenge --pkstring');
    let chal = JSON.parse(sout);
    chalarray.push(chal.challengestring);
    //Proof Generation
    //logger.log('warn',`${filename}-${indexes};ProofGen;Start;${web3.eth.defaultAccount};StorageNode`);
    let stdout = execSync('./app/modules/libpdp/libpdp_executable --filename app/modules/libpdp/storage/' + filename +
    ' --block ' + index + ' --pkstring --prove --challengestring ' + chal.challengestring)
    let proof = JSON.parse(stdout);
    proofarray.push(proof.proofstring)
  }
  let challengestring = chalarray.join(";");
  let proofstring = proofarray.join(';');
  //mytts.mfs.ensureDirExistsSync('app/modules/libpdp/storage' + instance);
  //fs.writeFileSync('app/modules/libpdp/storage'+ instance +'/'+ filename +'.proof', proofstring);
  //fs.writeFileSync('app/modules/libpdp/storage'+ instance +'/'+ filename +'.chal', challengestring);
  //logger.log('warn',`${filename}-${indexes};ProofGen;Stop;${web3.eth.defaultAccount};StorageNode`);
  //logger.log('debug', `Proof generated :${proofstring}`);
  logger.log('info', `Proof generated :${proofstring.slice(0,50)}`);
  let verifier  = await identityContract.methods.getValidator(sender).call();
  let _msgEndPoint = verifier[0];
  let _port = conf.server.http_port;
  if (_msgEndPoint.includes(":")){
    let endp = _msgEndPoint.split(":");
    _msgEndPoint = endp[0];
    _port = endp[1];
  }

  var form = new FormData({ maxDataSize: 9007199254740991 });
  form.append("chal", challengestring);
  form.append("proofstring", proofstring);
  form.append("indexes", indexes);
  form.append('filename', filename);
  form.append('sender', web3.eth.defaultAccount);
  form.append('validation', validation)
  form.submit({
    host: _msgEndPoint,
    path: '/MSG/Validation/ReceiveProof',
    port: _port
  }, function(err, res) {
    if (err){
      logger.log('debug', `error : ${err}`);
    }
  });
  return {Status : 'Proof generated '};
}


async function receiveProof(sender, filename, indexes, chal, proofstring, validation, callback){
  //logger.log('warn',`${filename}-${indexes};ProveSharing;Start;${web3.eth.defaultAccount};Validator`);
  //Receiving the proof
  const validationContract = contracts.newContract('Validation', validation)
  let state = await validationContract.methods.getState().call();
  logger.log('info', `ValidationState:${state}`);
  if (state > 1){
    callback({error: "StorageNode already submitted a proof"});
    return;
  }
  //Logging the inputs received after receiving the stat
  logger.log('info', `Sender:${sender}`);
  logger.log('info', `Filename:${filename}`);
  logger.log('info', `ChunkIndex:${indexes}`);
  logger.log('info', `Challenge received:${chal}`);
  //logger.log('debug', `Proof received:${proofstring}`);
  logger.log('info', `Proof received :${proofstring.slice(0,50)}`);
  logger.log('info', `ValidationAddress:${validation}`);
  let output = await validationContract.methods
  .receiveProof(sender)
  .send({
    from: web3.eth.defaultAccount,
    gas: 9007199254740991
  })
  .on('transactionHash', txHash => {logger.log('debug', `txHash:${txHash}`)})
  if (!isEmpty(output.events)){
    let valNb = await identityContract.methods.getValNb().call()
    if(valNb == 0){
      callback({error:'Not enough validators in the network'});
      return;
    }
    for (var i = 0; i < valNb; i++){
      let verifierAdd   = await identityContract.methods.getValidatorFromIndex(i).call();
      if (verifierAdd != web3.eth.defaultAccount){
        let verifier  = await identityContract.methods.getValidator(verifierAdd).call();
        let _msgEndPoint = verifier[0];
        let _port = conf.server.http_port;
        if (_msgEndPoint.includes(":")){
          let endp = _msgEndPoint.split(":");
          _msgEndPoint = endp[0];
          _port = endp[1];
        }
        var form = new FormData({ maxDataSize: 9007199254740991 });
        form.append("proofstring", proofstring);
        form.append("indexes", indexes);
        form.append('filename', filename);
        form.append('sender', web3.eth.defaultAccount);
        form.append('chal', chal);
        form.append('validation', validation);
        form.submit({
          host: _msgEndPoint,
          path: '/MSG/Validation/CheckProof',
          port: _port
        }, function(err, res) {
          if (err){
            logger.log('debug', `error : ${err}`);
          }
        });
      }
    }
    callback(output.events.ProofReceived.returnValues);
    return;
  }
  else {
    callback({error: "Proof was not received"});
    return;
  }
}

/*This function refers to the VerifyProof function from the original paper*/
async function checkProof(filename, indexes, proofstring, challengestring, validation, sender){
  //Logging the inputs received
  logger.log('info', `Sender :${sender}`);
  logger.log('info', `Filename :${filename}`);
  logger.log('info', `ChunkIndex :${indexes}`);
  logger.log('info', `Challenge to be checked:${challengestring}`);
  //logger.log('debug', `Proof to be checked:${proofstring}`);
  logger.log('info', `Proof to be checked:${proofstring.slice(0,50)}`);
  logger.log('info', `ValidationAddress :${validation}`);
  let vote = true;
  //let proofdata = fs.readFileSync('app/modules/libpdp/storage'+ proofstring +'/'+ filename +'.proof').toString();
  let proofarray = proofstring.split(";");
  //let chaldata = fs.readFileSync('app/modules/libpdp/storage'+ challengestring +'/'+ filename +'.chal').toString();
  let chalarray = challengestring.split(";");
  let validationContract = contracts.newContract('Validation', validation);
  let owner = await validationContract.methods.getOwner().call();
  if(owner != sender){
    return {error: "Not the elected"};
  }
  let tdaddress = await validationContract.methods.getTrustedDealer().call();
  let td = await identityContract.methods.getTrustedDealer(tdaddress).call();
  let _msgEndPoint = td[0];
  let _port = conf.server.http_port;
  if (_msgEndPoint.includes(":")){
    let endp = _msgEndPoint.split(":");
    _msgEndPoint = endp[0];
    _port = endp[1];
  }
  let chunksarray = indexes.split("-");
  let object = JSON.stringify({"sender": web3.eth.defaultAccount, "filename": filename, "validation": validation})
  let contentType = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(object)
  }
  const myreq = http.request({
    host: _msgEndPoint,
    port: _port,
    path: `/MSG/Validation/GetPubKey`,
    method: `POST`,
    headers: contentType
  }, function(response)
  {

    mytts.mfs.ensureDirExistsSync('app/modules/libpdp/validation')
    mytts.mfs.ensureDirExistsSync('app/modules/libpdp/validation/' + filename + '.keys');
    let pubKey = fs.createWriteStream('app/modules/libpdp/validation/' + filename + '.keys/apdp.pub');
    response.pipe(pubKey);
    pubKey.on(`finish`, () =>
    {
      for(var i=0; i<chunksarray.length; i++){
        let index = chunksarray[i];
        let proof = proofarray[i];
        let chal = chalarray[i];
        fs.writeFileSync('app/modules/libpdp/validation/'+ filename +'.c_' + index, 'MockFile\n'); //TODO change libpdp library to handle verification without the mockfile
        fs.writeFileSync('app/modules/libpdp/validation/'+ filename +'.c_' + index +'.tag.proof', proof + '\n');
        let result = execSync('./app/modules/libpdp/libpdp_executable --filename app/modules/libpdp/validation/' + filename
        + ' --block ' + index + ' --verifyfile --pkstring --challengestring '+ chal)
        res = JSON.parse(result);
        let verify = (res.verify == 'true');
        vote = vote && verify;
        logger.log('warn',`${filename}-${index};Verification;Stop;${web3.eth.defaultAccount};Validator;${verify}`);
        if (i == chunksarray.length){
          logger.log('info', `Vote: ${vote}`);
          voteCast(web3.eth.defaultAccount, vote, validation);
          //logger.log('warn',`${filename}-${indexes}-${vote};Verification;Stop;${web3.eth.defaultAccount};Validator`);
        }
      }
    });
  }).on(`error`, function(err)
  {
    logger.log('debug', `error : ${err}`);
  });
  myreq.write(object)
  myreq.end();
  return {Status : 'Proof checked '};
}

async function voteCast(validator, res, validation){
  let validationContract = contracts.newContract('Validation', validation);
  let result = {error: "The vote was not cast"};
  var vote = (res == 'true');
  let output = await validationContract.methods
  .castVote(vote)
  .send({
    from: web3.eth.defaultAccount,
    gas: 9007199254740991
  })
  .on('transactionHash', txHash => {logger.log('debug', `txHash:${txHash}`)});
  if (!isEmpty(output.events)){
    logger.log('info', `ValidationState :${output.events.VoteCast.returnValues.state}`);
    result = output.events.VoteCast.returnValues;
  }
  return result;
}


eventListener();
module.exports = {
  init,
  eventListener,
  genProof,
  receiveProof,
  checkProof,
  voteCast,
};
