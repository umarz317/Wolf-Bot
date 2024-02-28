const Wallet = require("../models/wallet");

module.exports = {
  createWallet: async (id, address, pk) => {
    const wallet = new Wallet({ address: address, privateKey: pk, id: id });
    try {
      await wallet.save();
      console.log("Wallet created successfully!");
      return true;
    } catch (err) {
      console.log("Wallet creation failed!");
      console.log(err);
      return false;
    }
  },
  doesWalletExist:async (id)=>{
    const wallet = await Wallet.findOne({id:id})
    if(wallet){
      return wallet
    }
    else{
      return wallet
    }
  }
};
