const mongoose = require("mongoose");
const { Schema } = mongoose;
const {settingSchema} = require("./setting")
const walletEntrySchema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const walletSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  wallets: [walletEntrySchema],
  settings: [settingSchema],
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
