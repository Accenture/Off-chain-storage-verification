const { isEmpty } = require('lodash');
const web3 = require('../utils/web3');
const { BUILDS_FOLDER } = require('../constants');

const logger = require('../utils/logger')('contracts');

const Contracts = {
  EMPTY_ADDRESS: '0x0000000000000000000000000000000000000000',

  getBuild(name) {
    delete require.cache[require.resolve(`${BUILDS_FOLDER}${name}.json`)];
    // eslint-disable-next-line import/no-dynamic-require, global-require
    this[name] = require(`${BUILDS_FOLDER}${name}.json`);
    return this[name];
  },

  getContract(name, forceFsReload = true) {
    if (!this[name] || forceFsReload) {
      this.getBuild(name);
    }

    if (!this[`${name}Contract`] || forceFsReload) {
      let contract;
      if (!isEmpty(this[name].networks)) {
        contract = new web3.eth.Contract(this[name].abi, this[name].networks.address);
      } else {
        contract = new web3.eth.Contract(this[name].abi);
      }
      contract.options.data = this[name].bytecode;
      this[`${name}Contract`] = contract;
    }
    return this[`${name}Contract`];
  },

  newContract(name, address) {
    if (!this[name]) {
      this.getBuild(name);
    }
    return new web3.eth.Contract(this[name].abi, address);
  },

  async newPublicContract(contractObject, ...contractArguments) {
    const newContract = await contractObject
      .deploy({
        arguments: contractArguments,
      })
      .send({
        from: web3.eth.defaultAccount,
        gas: 9007199254740991,
      })
      .on('transactionHash', txHash => logger.log('debug', `newPublicContract: txHash:${txHash}`));
    logger.log('debug', `newPublicContract: ${newContract.options.address}`);
    return newContract;
  },

  async newPrivateContract(contractObject, privateFor, ...contractArguments) {
    const newContract = await contractObject
      .deploy({
        arguments: contractArguments,
      })
      .send({
        from: web3.eth.defaultAccount,
        gas: 9007199254740991,
        privateFor,
      })
      .on('transactionHash', txHash => logger.log('debug', `newPrivateContract: txHash:${txHash}`));
    logger.log('debug', `newPrivateContract: ${newContract.options.address}`);
    return newContract;
  },
};

module.exports = Contracts;
