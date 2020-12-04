const Artifactor = require('truffle-artifactor');
const { BUILDS_FOLDER } = require('../constants');

const artifactor = new Artifactor(BUILDS_FOLDER);

module.exports = artifactor;
