var ChainList = artifacts.require("./KYC.sol");

module.exports = function(deployer) {
  deployer.deploy(ChainList);
}
