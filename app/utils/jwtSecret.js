import crypto from 'crypto';
import path from 'path';
import { saveObjectToJsonFile, readObjectFromJsonFile } from './fsHandler';

const logger = require('../utils/logger')('jwtSecret');

function generateRandom48Bytes() {
  return new Promise((resolve) => {
    crypto.randomBytes(48, async (err, buffer) => {
      resolve(buffer.toString('hex'));
    });
  });
}

async function saveSessionSecret(secret) {
  const pathToSessionConfig = path.join(__dirname, '../gen/sessionConfig.json');
  let sessionConfig = await readObjectFromJsonFile(pathToSessionConfig)
    .catch((error) => {
      logger.log('debug', 'No sessionConfig.json file : %s', error);
    });
  if (!sessionConfig) {
    sessionConfig = {};
  }
  sessionConfig.jwtSecret = secret;
  await saveObjectToJsonFile(pathToSessionConfig, sessionConfig);
}

export async function generateAndSaveJwtSecret() {
  const secret = await generateRandom48Bytes();
  await saveSessionSecret(secret);
}

export default (async () => generateAndSaveJwtSecret())();
