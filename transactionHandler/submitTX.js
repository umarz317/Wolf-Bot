const submitSushiTx = require("./sushi/handler")
const { submitSwapTx } = require("./uni/V2/handler")
const { submitSwapTxV3 } = require("./uni/V3/handler")


module.exports={
    V2:submitSwapTx,
    V3:submitSwapTxV3,
    sushiV2:submitSushiTx,
}