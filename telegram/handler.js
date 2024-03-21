const submitTX = require("../transactionHandler/submitTX");
const { parseEther, formatEther } = require("viem");
const client = require("../utils/client");
const { bot } = require("./bot");

module.exports = {
  V2: async (chat_ID, tokenToSnipe, amountIn, account, type) => {
    amountIn = parseEther(amountIn).toString();
    const txHash = await submitTX.V2(tokenToSnipe, amountIn, account);
    if (!txHash) return;
    bot.telegram.sendMessage(
      chat_ID,
      `Tx submitted: ${txHash}`
    )
    try {
      const txReceipt = await client.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      if (txReceipt.status === "success") {
        console.log("Transaction successful.");
        bot.telegram.sendMessage(
          chat_ID,
          `✅ ${type} Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      } else {
        console.log("Transaction failed.");
        bot.telegram.sendMessage(
          chat_ID,
          `❌ ${type} Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      }
    } catch (e) {
      console.log(e);
      console.log("Failed to get receipt.");
    }
  },
  V3: async(
    chat_ID,
    tokenToSnipe,
    pair,
    fee,
    amountIn,
    account,
    type
  ) => {
    amountIn = parseEther(amountIn).toString();
    const txHash = await submitTX.V3(
      tokenToSnipe,
      pair,
      fee,
      amountIn,
      account
    );
    if (!txHash) return;
    bot.telegram.sendMessage(
      chat_ID,
      `Tx submitted: ${txHash}`
    )
    try {
      console.log("Waiting for receipt.");
      const txReceipt = await client.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("Got receipt.");
      if (txReceipt.status === "success") {
        console.log("Transaction successful.");
        bot.telegram.sendMessage(
          chat_ID,
          `✅ ${type} Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      } else {
        console.log("Transaction failed.");
        bot.telegram.sendMessage(
          chat_ID,
          `❌ ${type} Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      }
    } catch (e) {
      console.log(e);
      console.log("Failed to get receipt.");
    }
  },
  sushiV2: async(
    chat_ID,
    tokenToSnipe,
    pair,
    amountIn,
    account
  ) => {
    amountIn = parseEther(amountIn)
    const txHash = await submitTX.sushiV2(
      amountIn,
      pair,
      tokenToSnipe,
      account
    );
    if (txHash.error){
      var errMsg = txHash.error.message.split('Details:')
      bot.telegram.sendMessage(
        chat_ID,
        `❌ ${type} Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
          amountIn
        )}\n\n🔗 Reason: ${errMsg[1].split('Version:')[0]}`
      );
      return
    };
    bot.telegram.sendMessage(
      chat_ID,
      `Tx submitted: ${txHash.hash}`
    )
    try {
      console.log("Waiting for receipt.");
      const txReceipt = await client.publicClient.waitForTransactionReceipt({
        hash: txHash.hash,
      });
      console.log("Got receipt.");
      if (txReceipt.status === "success") {
        console.log("Transaction successful.");
        bot.telegram.sendMessage(
          chat_ID,
          `✅ ${type} Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      } else {
        console.log("Transaction failed.");
        bot.telegram.sendMessage(
          chat_ID,
          `❌ ${type} Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      }
    } catch (e) {
      console.log(e);
      console.log("Failed to get receipt.");
    }
  },
};
