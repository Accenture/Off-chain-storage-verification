
const fs = require('fs');
const solc = require('solc');
const isEmpty = require('lodash').isEmpty;
const artifactor = require('./artifactor');
const { deleteFolderRecursive } = require('./fsHandler');
const { CONTRACTS_FOLDER, BUILDS_FOLDER } = require('../constants');

const logger = require('../utils/logger')('solcCompiler');

async function solcCompiler() {
  const input = {};
  const allPromises = [];
  // deleteFolderRecursive(BUILDS_FOLDER);

  let files;
  try {
    files = fs.readdirSync(CONTRACTS_FOLDER);
  } catch (err) {
    logger.log('error', 'fs.readdirSync error: %s', err);
  }

  files.forEach((file) => {
    if (file.endsWith('.sol')) {
      input[file] = fs.readFileSync(`${CONTRACTS_FOLDER}${file}`, 'utf8');
    }
  });
  logger.log(
    'info', !isEmpty(input) ? 'Solidity input successfully prepared' : 'Solidity input is Empty');

  const output = solc.compile({ sources: input }, 1);
  if (output.errors) {
    output.errors.forEach(function(err) {
      if (err.includes("Warning")) {
        logger.log('warn', 'Output Errors: %s', err);
      }
      else{
        logger.log('error', 'Output Errors: %s', err);
        process.exit(1);
      }
    });
  }

  for (const key in output.contracts) {
    if (Object.prototype.hasOwnProperty.call(output.contracts, key)) {
      const contractName = key.substring(key.indexOf(':') + 1);
      const abi = JSON.parse(output.contracts[key].interface);
      const binary = output.contracts[key].bytecode;
      const events = output.contracts[key].allEvents;
      const contractData = {
        contract_name: contractName,
        abi,
        binary,
        events,
      };

      allPromises.push(artifactor.save(contractData, `${BUILDS_FOLDER}${contractName}`)
        .catch(error => logger.log('error', 'Contract artifacts saving failed: %s', error)));
    }
  }
  await Promise.all(allPromises)
    .catch(error => logger.log('error', 'Contract artifacts saving failed: %s', error));
  logger.log('info', 'Contracts successfuly compiled!');
}

module.exports = (async () => await solcCompiler())()
  .catch(error => logger.log('error', 'Contracts compiling was not finished: %s', error));
