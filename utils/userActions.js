const { generatePrivateKey, privateKeyToAccount } = require("viem/accounts");
const userController = require("../controllers/userController");

async function generateAndSaveUserWallet(id) {
  const pk = generatePrivateKey();
  const address = privateKeyToAccount(pk).address;
  const success = await userController.createUserWallet(id, address, pk);
  return { address: address, pk: pk, success: success };
}

async function getUser(id){
  return await userController.getUser(id);
}

async function getAllUsers() {
  return await userController.getAllUsers();
}

async function doesUserWalletExist(id) {
  return await userController.doesUserWalletExist(id);
}

async function importUserWallet(id, pk) {
  return await userController.importUserWallet(id, pk);
}

async function getAllUserWallets(id) {
  return await userController.getAllUserWallets(id);
}

async function deleteUserWallet(id, indexToDelete) {
  return await userController.deleteUserWallet(id, indexToDelete);
}

async function updateUserSetting(userId, settingName, settingValue){
  return await userController.updateUserSetting(userId, settingName, settingValue);
}

async function getUserSettingValue(userId, settingName){
  return await userController.getUserSettingValue(userId, settingName);
}

module.exports = {
  getUserSettingValue,
  updateUserSetting,
  deleteUserWallet,
  generateAndSaveUserWallet,
  getAllUserWallets,
  doesUserWalletExist,
  importUserWallet,
  getAllUsers,
  getUser
};
