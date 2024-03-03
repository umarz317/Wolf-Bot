const { isAddress } = require("viem");
const client = require("./client");
const { Contract } = require("ethers");
const contractHelper = require("./contractHelper");
const { bot } = require("../telegram/bot");

function isValidPrivateKey(pk) {
  if (!pk.startsWith("0x")) {
    pk = "0x" + pk;
  }
  try {
    privateKeyToAddress(pk);
    return true;
  } catch (error) {
    return false;
  }
}

function isValidAddress(address) {
  return isAddress(address) === true ? true : false;
}

async function isERC20(token) {
  //logic needs improvement maybe add interface check for(erc165)
  var contract = contractHelper.getToken(token);
  try {
    await Promise.all([
      contract.read.name(),
      contract.read.symbol(),
      contract.read.decimals(),
    ]);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

function sendMessage(chatID, message) {
  bot.telegram.sendMessage(chatID, message);
}

module.exports = { isValidPrivateKey, isValidAddress, isERC20, sendMessage };
