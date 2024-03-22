const User = require("../models/user");
const { privateKeyToAccount } = require("viem/accounts");
const { encrypt } = require("../utils/keyManagement");

module.exports = {
  createUserWallet: async (Id, address, pk) => {
    try {
      let user = await User.findOne({ id: Id });
      if (user) {
        user.wallets.push({ address: address, privateKey: encrypt(pk) });
      } else {
        user = new User({
          id: Id,
          wallets: [{ address: address, privateKey: encrypt(pk) }],
        });
      }
      await user.save();
      console.log("Wallet created successfully!");
      return true;
    } catch (err) {
      console.log("Wallet creation failed!");
      console.log(err);
      return false;
    }
  },
  importUserWallet: async (id, pk) => {
    try {
      if (!pk.startsWith("0x")) {
        pk = "0x" + pk;
      }
      const walletInstance = new privateKeyToAccount(pk);
      let user = await User.findOne({ id: id });
      const existingWallet = user
        ? user.wallets.find((w) => w.address === walletInstance.address)
        : null;
      if (existingWallet) {
        console.log("Wallet already exists in the database.");
        return {
          success: false,
          message: "Wallet already exists.",
        };
      }

      if (user) {
        user.wallets.push({
          address: walletInstance.address,
          privateKey: encrypt(pk),
        });
      } else {
        user = new User({
          id: id,
          wallets: [
            { address: walletInstance.address, privateKey: encrypt(pk) },
          ],
        });
      }
      await user.save();
      console.log(
        `Wallet imported successfully! Public Key: ${walletInstance.address}`
      );
      return { success: true, message: "Wallet imported successfully." };
    } catch (err) {
      console.log("Failed!");
      console.log(err);
      return {
        success: false,
        message: "Failed to import wallet due to an error.",
      };
    }
  },
  doesUserWalletExist: async (id) => {
    const user = await User.findOne({ id: id });
    if ((user && user.wallets.length < 5) || !user) {
      return true;
    } else {
      return false;
    }
  },
  getAllUserWallets: async (id) => {
    const user = await User.findOne({ id: id });
    return user.wallets;
  },
  getAllUsers: async () => {
    const users = await User.find({});
    return users;
  },
  getUser: async (id) => {
    const user = await User.find({id:id});
    return user;
  },
  deleteUserWallet: async (id, indexToDelete) => {
    const user = await User.findOne({ id: id });
    user.wallets.splice(indexToDelete, 1);
    await user.save();
  },
  updateUserSetting: async (userId, settingName, settingValue) => {
    try {
      let previousValue;
      let user = await User.findOne({ id: userId });
      if (!user) {
        user = new User({
          userId: userId,
          settings: [{ name: settingName, value: settingValue }],
        });
      } else {
        const existingSetting = user.settings.findIndex(
          (s) => s.name === settingName
        );
        if (existingSetting !== -1) {
          previousValue = user.settings[existingSetting].value;
          user.settings[existingSetting].value = settingValue;
        } else {
          user.settings.push({ name: settingName, value: settingValue });
        }
      }
      await user.save();
      console.log("Setting updated for user");
      return { previousValue: previousValue };
    } catch (error) {
      console.error("Error updating setting:", error);
    }
  },
  getUserSettingValue: async (userId, settingName) => {
    try {
      const user = await User.findOne({ id: userId });
      if (!user) {
        return null;
      }
      const setting = user.settings.find((s) => s.name === settingName);
      if (!setting) {
        return null;
      }
      return setting.value;
    } catch (error) {
      return null;
    }
  },
};
