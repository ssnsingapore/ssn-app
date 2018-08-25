const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');

const globalConfigPath = path.join(__dirname, 'globalConfig.json');

module.exports = class MongoEnvironment extends NodeEnvironment {
  async setup() {
    console.log('Setup MongoDB Test Environment');

    const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));

    this.global.mongoUri = globalConfig.mongoUri;
    this.global.mongoDBName = globalConfig.mongoDBName;

    await super.setup();
  }

  async teardown() {
    console.log('Teardown MongoDB Test Environment');

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
};
