const { isAddress, formatEther, parseEther } = require("viem");
const contractHelper = require("./contractHelper");
const { bot } = require("../telegram/bot");
const { privateKeyToAddress } = require("viem/accounts");
const { publicClient } = require("./client");

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

async function getPair(address0, client, type) {
// TODO: Add enums for type/make a constants file for all the strings
  if (type === "sushi V2") {
    var contract = contractHelper.getSushiFactoryV2(client);
    var pair = await contract.read.getPair([address0, process.env.WETH]);
    return pair;
  } else if (type === "uni V2") {
    var contract = contractHelper.getUniFactoryV2(client);
    var pair = await contract.read.getPair([address0, process.env.WETH]);
    return pair;
  }
}

function sendMessage(chatID, message) {
  bot.telegram.sendMessage(chatID, message);
}

async function fetchTokenDecimals(address) {
  var decimals = await contractHelper.getToken(address).read.decimals();
  return decimals;
}

async function fetchUserBalance(address) {
  var balance = await publicClient.getBalance({address:address});
  return formatEther(balance);
}

module.exports = {
  fetchUserBalance,
  isValidPrivateKey,
  isValidAddress,
  isERC20,
  sendMessage,
  fetchTokenDecimals,
  getPair,
};
