const { submitSwapTx } = require("./V2/handler")
const { submitSwapTxV3 } = require("./v3/handler")

module.exports={
    V2:submitSwapTx,
    V3:submitSwapTxV3
}