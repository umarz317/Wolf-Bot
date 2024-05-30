const { isAddress, formatEther, parseEther } = require("viem");
const contractHelper = require("./contractHelper");
const { bot } = require("../telegram/bot");
const { privateKeyToAddress } = require("viem/accounts");
const { publicClient } = require("./client");
const Moralis = require("moralis").default;

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
    var res = await Promise.all([
      contract.read.name(),
      contract.read.symbol(),
      contract.read.decimals(),
    ]);
    return res;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function getPair(address0, client, type) {
  // TODO: Add enums for type/make a constants file for all the strings
  if (type === "sushi V2") {
    var contract = contractHelper.getSushiFactoryV2(client);
    var pair = await contract.read.getPair([address0, Addresses.WETH]);
    return pair;
  } else if (type === "uni V2") {
    var contract = contractHelper.getUniFactoryV2(client);
    var pair = await contract.read.getPair([address0, Addresses.WETH]);
    return pair;
  }
}

function sendMessage(chatID, message) {
  bot.telegram.sendMessage(chatID, message);
}

async function fetchTokenDecimals(address) {
  var decimals = await contractHelper.getToken(address).read.decimals();
  console.log("Decimals", decimals);
  return decimals;
}

async function fetchUserBalance(address) {
  var balance = await publicClient.getBalance({ address: address });
  return formatEther(balance);
}

async function getUserPositions(address) {
  try {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: "0x2105",
      address: address,
    });
    console.log(response.result);
    return response;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  fetchUserBalance,
  isValidPrivateKey,
  isValidAddress,
  isERC20,
  sendMessage,
  fetchTokenDecimals,
  getPair,
  getUserPositions,
};
