const mongoose = require("mongoose");

const {Schema} = mongoose

const walletSchema = new Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    privateKey: {
        type: String,
        required: true,
        unique: true
    },
    id: {
        type: String,
        required: true,
        unique: true
    }
})

const Wallet = mongoose.model('Wallet',walletSchema)

module.exports = Wallet