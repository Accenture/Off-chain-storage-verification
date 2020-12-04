const contracts = require('../utils/contracts');
const web3 = require('../utils/web3');

const logger = require('../utils/logger')('Constants');

async function getAllConstants(){
  const constantsContract = contracts.getContract('Constants');
  let result = await constantsContract.methods.getAll().call()
  return result
}

module.exports = getAllConstants
