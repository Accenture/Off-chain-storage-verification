const { isEmpty } = require('lodash');
const contracts = require('../utils/contracts');
const fsHandler = require('../utils/fsHandler');
const web3 = require('../utils/web3');
const http = require('http');
const fs = require('fs');
const execSync = require('child_process').execSync;
const FormData = require('form-data');
const secureRandom = require('secure-random');
const sleep = require('sleep');

const mytts = require(`my-team-tools`)
const help = mytts.common
const conf = help.getConf()

const logger = require('../utils/logger')('Storage');

const constantsContract = contracts.getContract('Constants');
const storageFactoryContract = contracts.getContract('StorageFactory');

async function storeFile(pathToFile){
  // Check if the file exists at the path
  if(!fs.existsSync(pathToFile)){
    return {error: "No file in such directory"};
  }
  /*This function refers to the KeyGen function from the original paper*/
  /*var filename;
  var keys;
  var keyGen = execSync('./app/modules/libpdp/libpdp_executable --filename ' + pathToFile +  ' --keys');
  keys =JSON.parse(keyGen);
  logger.log('info', `Key generation : done`);
  filename = keys.pkstring.slice(0, 32);*/
  const filename = secureRandom(16, {type: 'Buffer'}).toString('hex')
  console.log(filename);
  const identityContract = contracts.getContract('Identity');
  let storageNodes = await storageFactoryContract.methods.storageSelection(web3.utils.asciiToHex(filename)).call();
  let m = await constantsContract.methods.getM().call();
  let n =  await constantsContract.methods.getN().call();
  if (storageNodes.length == 0){
    return {error: "Not enough storageNodes in the network to store the file"};
  }

  //Giving the pk as a name of the file and keeping the keys in files
  fs.copyFileSync(pathToFile, 'app/modules/libpdp/data/'+ filename);
  fsHandler.saveObjectToJsonFile('app/modules/libpdp/data/'+ filename +'.id', filename)
  execSync('./app/modules/libpdp/libpdp_executable --filename app/modules/libpdp/data/'  + filename + ' --keys');
  logger.log('warn',`${filename};FragmentFile;Start;${web3.eth.defaultAccount};TrustedDealer`);
  var splitting = execSync('./app/modules/libpdp/libpdp_executable --filename app/modules/libpdp/data/'  + filename + ' --split --numchunks '+ n );
  logger.log('warn',`${filename};FragmentFile;Stop;${web3.eth.defaultAccount};TrustedDealer`);
  logger.log('info', `File Spliting  : done`);
  /*This function refers to the TagBlock function from the original paper*/
  for(var k=0; k<n ; k++){
    //execSync('./app/modules/libpdp/libpdp_executable --filename app/modules/libpdp/data/'  +filename+ '.c_' + k + ' ' + ' --keys');
    execSync('./app/modules/libpdp/libpdp_executable --filename app/modules/libpdp/data/'  + filename + '.c_' + k + ' ' +'--tag  --keystring');
  }
  var values =[];
  //Chunk selection and sending
  for(var i=0; i<storageNodes.length; i++){
    logger.log('warn',`${filename};FragmentSelection;Start;${web3.eth.defaultAccount};TrustedDealer`);
    let chunksSelected = [];
    let output = await storageFactoryContract.methods
    .chunksSelect(storageNodes[i], web3.utils.asciiToHex(filename))
    .send({
      from: web3.eth.defaultAccount,
      gas: 9007199254740991
    })
    .on('transactionHash', txHash => {logger.log('debug', `txHash:${txHash}`)});
    if (!isEmpty(output.events)){
      chunksSelected = output.events.ChunkSelection.returnValues.chunks;
    }
    console.log(chunksSelected.length);
    logger.log('warn',`${filename};FragmentSelection;Stop;${web3.eth.defaultAccount};TrustedDealer`);
    let sn = await identityContract.methods.getStorageNode(storageNodes[i]).call();
    let _msgEndPoint = sn[0];
    let _port = conf.server.http_port;
    if (_msgEndPoint.includes(":")){
      let endp = _msgEndPoint.split(":");
      _msgEndPoint = endp[0];
      _port = endp[1];
    }
    for(var j=0; j<chunksSelected.length; j++){
      values.push({"SNSelected ": storageNodes[i], "Indexs ": chunksSelected[j]});
      var form = new FormData({ maxDataSize: 9007199254740991 });
      form.append('sender', web3.eth.defaultAccount);
      form.append('file', web3.utils.asciiToHex(filename));
      form.append('index', chunksSelected[j]);
      var pathToChunk =  'app/modules/libpdp/data/' + filename + '.c_' + chunksSelected[j] ;
      var pathToTag = 'app/modules/libpdp/data/' + filename + '.c_' + chunksSelected[j] + '.tag';
      var pathTokey = 'app/modules/libpdp/data/' + filename + '.keys/apdp.pub';
      if(!fs.existsSync(pathToChunk) || !fs.existsSync(pathToTag) || !fs.existsSync(pathTokey)){
        return {error: "Missing chunk or tag files in directory"};
      }
      let chunkStream = fs.createReadStream(pathToChunk);
      let tagStream = fs.createReadStream(pathToTag);
      let keyStream =  fs.createReadStream(pathTokey);
      sleep.msleep(30);
      form.append('chunk', chunkStream);
      form.append('tag', tagStream);
      form.append('key', keyStream);
      logger.log('warn',`${filename}.c_${chunksSelected[j]};FragmentTransfer;Start;${web3.eth.defaultAccount};TrustedDealer`);
      form.submit({
        host: _msgEndPoint,
        path: '/MSG/Storage/StoreFile',
        port: _port
      }, function(err, res) {
        if (err) logger.log('debug', `error : ${err}`);
        //console.log(res.statusCode);
      });
      logger.log('warn',`${filename}.c_${chunksSelected[j]};FragmentTransfer;Stop;${web3.eth.defaultAccount};TrustedDealer`);
    }
  }
  return {result: values};
};

var stored = {};
async function saveFile(sender, file, index, chunk, tag, key){
  //store chunk and tag files
  let result = {error: "Error while storing the file"};
  let filename = web3.utils.hexToAscii(file);
  if (!stored[filename]){
    stored[filename] = [];
  }
  stored[filename].push(index);
  var chunkStream = fs.createWriteStream('app/modules/libpdp/storage/' + filename + '.c_' + index);
  chunk.pipe(chunkStream);

  var tagStream = fs.createWriteStream('app/modules/libpdp/storage/' + filename + '.c_' + index + '.tag');
  tag.pipe(tagStream);
  //fs.mkdirSync('app/modules/libpdp/storage/' + filename + '.c_' + index + '.keys');
  mytts.mfs.ensureDirExistsSync('app/modules/libpdp/storage/' + filename + '.keys')
  if (!fs.existsSync('app/modules/libpdp/storage/' + filename + '.keys/apdp.pub')){
    var keyStream = fs.createWriteStream('app/modules/libpdp/storage/' + filename + '.keys/apdp.pub');
    key.pipe(keyStream);
  }
  result = {info: "chunk stored"};
  let constk =  await constantsContract.methods.getK().call();
  if (stored[filename].length == constk){
      let idx = stored[filename][constk - 1];
      //adding to the pool in the smart contract
      let output = await storageFactoryContract.methods
      .addToPool(sender, file, idx)
      .send({
        from: web3.eth.defaultAccount,
        gas: 9007199254740991
      })
      .on('transactionHash', txHash => {logger.log('debug', `txHash:${txHash}`)});
      if (!isEmpty(output.events)){
        result = output.events.FileStored.returnValues;
        console.log(result);
        logger.log('info', `Index :${idx}`);
        logger.log('warn',`${filename}.c_${idx};FragmentTransfer;Stop;${web3.eth.defaultAccount};StorageNode`);
      }
  }
  return result;
}

module.exports = {
  storeFile,
  saveFile
};
