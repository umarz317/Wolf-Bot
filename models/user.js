const {walletSchema} = require("./wallet");
const {settingSchema} = require('./setting');
const { Schema, default: mongoose } = require("mongoose");

const userSchema = new Schema({
    id: {
      type: String,
      required: true,
      unique: true,
    },
    wallets: [walletSchema],
    settings: [settingSchema],
  });
  
const User = mongoose.model("Wallet", userSchema);

module.exports = User;