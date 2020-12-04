const Web3 = require('web3');
const { WEB3_CONF } = require('../constants');

//const option = `http://${WEB3_CONF['HOST_LINUX']}:${WEB3_CONF.PORT}`;
const option = `ws://${WEB3_CONF['HOST_LINUX']}:${WEB3_CONF.PORT}`;

console.log(option);
//var version = Web3.version.api;
//console.log(version); // "0.2.0"
const web3 = new Web3(new Web3.providers.WebsocketProvider(option));
//const web3 = new Web3(new Web3.providers.HttpProvider(option));

web3.eth.defaultAccount = WEB3_CONF.ETH_KEY;

module.exports = web3;
