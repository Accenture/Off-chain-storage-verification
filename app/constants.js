const path = require('path');


const { WEB3_CONFS } = require('./constantsData');

const CONTRACTS_FOLDER = path.join(__dirname, './contracts/');
const BUILDS_FOLDER = path.join(__dirname, './build/');

let instance = 0;

if (Number.isInteger(+process.argv[2])) {
  instance = process.argv[2];
} else if (Number.isInteger(+process.env.NODE)) {
  instance = process.env.NODE;
}

console.debug('Selected instance: ' + instance);
const WEB3_CONF = WEB3_CONFS[instance];


module.exports = {
  CONTRACTS_FOLDER, BUILDS_FOLDER, instance, WEB3_CONFS, WEB3_CONF
};
