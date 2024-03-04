const Wallet = require("../models/wallet");
const { privateKeyToAccount } = require("viem/accounts");
const { encrypt, decrypt, generateIV } = require("../utils/keyManagement");
module.exports = {
  createWallet: async (Id, address, pk) => {
    try {
      let wallet = await Wallet.findOne({ id: Id });

      if (wallet) {
        wallet.wallets.push({ address: address, privateKey: encrypt(pk) });
      } else {
        wallet = new Wallet({
          id: Id,
          wallets: [{ address: address, privateKey: encrypt(pk) }],
        });
      }
      await wallet.save();
      console.log("Wallet created successfully!");
      return true;
    } catch (err) {
      console.log("Wallet creation failed!");
      console.log(err);
      return false;
    }
  },
  importWallet: async (id, pk) => {
    try {
      if (!pk.startsWith("0x")) {
        pk = "0x" + pk;
      }
      const walletInstance = new privateKeyToAccount(pk);
      let wallet = await Wallet.findOne({ id: id });
      const existingWallet = wallet
        ? wallet.wallets.find((w) => w.address === walletInstance.address)
        : null;
      if (existingWallet) {
        console.log("Wallet already exists in the database.");
        return {
          success: false,
          message: "Wallet already exists.",
        };
      }

      if (wallet) {
        wallet.wallets.push({
          address: walletInstance.address,
          privateKey: encrypt(pk),
        });
      } else {
        wallet = new Wallet({
          id: id,
          wallets: [
            { address: walletInstance.address, privateKey: encrypt(pk) },
          ],
        });
      }
      await wallet.save();
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
  doesWalletExist: async (id) => {
    const wallet = await Wallet.findOne({ id: id });
    if ((wallet && wallet.wallets.length < 5) || !wallet) {
      return true;
    } else {
      return false;
    }
  },
  getAllWallets: async (id) => {
    const wallets = await Wallet.findOne({id:id});
    return wallets.wallets;
  },
};


