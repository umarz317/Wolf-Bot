const { isAddress } = require("viem");
const contractHelper = require("./contractHelper");
const { bot } = require("../telegram/bot");
const { privateKeyToAddress } = require("viem/accounts");

function isValidPrivateKey(pk) {
  if (!pk.startsWith("0x")) {
    pk = "0x" + pk;
  }
  try {
    privateKeyToAddress(pk);
    return true;
  } catch (error) {
    console.log(error);
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

async function fetchTokenDecimals(address) {
  var decimals = await contractHelper.getToken(address).read.decimals();
  return decimals;
}

module.exports = { isValidPrivateKey, isValidAddress, isERC20, sendMessage,fetchTokenDecimals };
