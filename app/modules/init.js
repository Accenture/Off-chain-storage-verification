const { isEmpty } = require('lodash');
const contracts = require('../utils/contracts');
const artifactor = require('../utils/artifactor');
const web3 = require('../utils/web3');
const eventListener = require('../modules/validation.js').eventListener
const logger = require('../utils/logger')('Init');

async function saveRootContractAddress(address) {
  const rootBuild = contracts.getBuild('Root');
  rootBuild.networks = { address: address };
  //console.log("something")
  await artifactor
    .save(rootBuild)
    .catch(error => logger.log('error', 'Contract artifacts saving failed: %s', error));
}

async function saveContractAddress(contract, address) {
  const contractBuild = contracts.getBuild(contract);
  contractBuild.networks = { address: address };
  await artifactor
    .save(contractBuild)
    .catch(error => logger.log('error', 'Contract artifacts saving failed: %s', error));
}

async function deployRoot(k, n, l, m, p) {
  const rootContract = contracts.getContract('Root');
  const contract = await contracts.newPublicContract(rootContract, k, n, l, m, p);
  //console.log("deployed")
  await saveRootContractAddress(contract.options.address);

  const constants = await contract.methods.getConstants().call();
  await saveContractAddress("Constants", constants);
  const identity = await contract.methods.getIdentity().call();
  await saveContractAddress("Identity", identity);
  const storageFactory = await contract.methods.getStorageFactory().call();
  await saveContractAddress("StorageFactory", storageFactory);
  const validationFactory = await contract.methods.getValidationFactory().call();
  await saveContractAddress("ValidationFactory", validationFactory);
  eventListener();

  logger.log('info', 'Root Deployed %s', contract.options.address);
  return {
    root: contract.options.address,
    constants: constants,
    identity: identity,
    storageFactory: storageFactory,
    validationFactory: validationFactory
  }
}

function getRootContract() {
  let address = "";
  const rootBuild = contracts.getBuild('Root');
  if (!isEmpty(rootBuild.networks)) {
    address = rootBuild.networks.address;
  }
  return address;
}


async function setID(endpoint, address, role){
  const identityContract = contracts.getContract('Identity');
  let result = {error: "Identity already registrated"};
  if (role == "StorageNode") {
    let output = await identityContract.methods
      .addStorageNode(endpoint, address)
      .send({
        from: web3.eth.defaultAccount,
        gas: 9007199254740991
      })
      .on('transactionHash', txHash => logger.log('debug', `txHash:${txHash}`));
    if (!isEmpty(output.events)){
      result = output.events.StorageNodeAdded.returnValues;
    }
  }
  else if (role == "Validator") {
    let output = await identityContract.methods
      .addValidator(endpoint, address)
      .send({
        from: web3.eth.defaultAccount,
        gas: 9007199254740991
      })
      .on('transactionHash', txHash => logger.log('debug', `txHash:${txHash}`));
    //console.log(output)
    if (!isEmpty(output.events)){
      result = output.events.ValidatorAdded.returnValues;
    }
  }
  else if (role == "TrustedDealer") {
    let output = await identityContract.methods
      .addTrustedDealer(endpoint, address)
      .send({
        from: web3.eth.defaultAccount,
        gas: 9007199254740991
      })
      .on('transactionHash', txHash => logger.log('debug', `txHash:${txHash}`));
    if (!isEmpty(output.events)){
      result = output.events.TrustedDealerAdded.returnValues;
    }
  }
  else {
    result = {error: "This role does not exist in the network. Available roles: TrustedDealer, Validator, StorageNode"}
  }
  return result;
}




module.exports = {
  deployRoot,
  getRootContract,
  setID
};
