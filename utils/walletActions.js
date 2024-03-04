const { generatePrivateKey, privateKeyToAccount } = require("viem/accounts");
const mongoose = require("mongoose");
const walletController = require("../controllers/walletController");

var db = mongoose.connection;

async function generateAndSaveWallet(id) {
  const pk = generatePrivateKey();
  const address = privateKeyToAccount(pk).address;
  //added logic to save account and pk to db
  const success = await walletController.createWallet(id, address, pk);
  console.log(success);
  return { address: address, pk: pk, success: success };
}

async function doesWalletExist(id) {
  return await walletController.doesWalletExist(id);
}

async function getAllWallets(id) {
  return await walletController.getAllWallets(id);
}

async function importWallet(id, pk) {
  return await walletController.importWallet(id, pk);
}

module.exports = { generateAndSaveWallet, doesWalletExist, importWallet,getAllWallets };
