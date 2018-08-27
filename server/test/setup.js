const path = require('path');
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const MongodbMemoryServer = require('mongodb-memory-server');

const globalConfigPath = path.join(__dirname, 'globalConfig.json');

const mongoServer = new MongodbMemoryServer.MongoMemoryServer();

module.exports = async function () {
  const mongoConfig = {
    mongoDBName: 'jest',
    mongoUri: await mongoServer.getConnectionString(),
  };

  // Write global config to disk because all tests run in different contexts.
  fs.writeFileSync(globalConfigPath, JSON.stringify(mongoConfig));

  // Set reference to mongod in order to close the server during teardown.
  global.mongoServer = mongoServer;
};
