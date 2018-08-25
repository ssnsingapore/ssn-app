module.exports = async function () {
  console.log('Teardown mongod');
  await global.mongoServer.stop();
};
