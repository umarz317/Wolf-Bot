const submitTX = require("../transactionHandler/submitTX");
const { parseEther, formatEther } = require("viem");
const client = require("../utils/client");
const { bot } = require("../telegram/bot");

module.exports = {
  V2: async function snipeToken(chat_ID, tokenToSnipe, amountIn, account) {
    amountIn = parseEther(amountIn).toString();
    const txHash = await submitTX.V2(tokenToSnipe, amountIn, account);
    if (!txHash) return;
    try {
      const txReceipt = await client.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      if (txReceipt.status === "success") {
        console.log("Transaction successful.");
        bot.telegram.sendMessage(
          chat_ID,
          `✅ Snipe Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      } else {
        console.log("Transaction failed.");
        bot.telegram.sendMessage(
          chat_ID,
          `❌ Snipe Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      }
    } catch (e) {
      console.log(e);
      console.log("Failed to get receipt.");
    }
  },
  V3: async function snipeToken(
    chat_ID,
    tokenToSnipe,
    pair,
    fee,
    amountIn,
    account
  ) {
    amountIn = parseEther(amountIn).toString();
    const txHash = await submitTX.V3(
      tokenToSnipe,
      pair,
      fee,
      amountIn,
      account
    );
    if (!txHash) return;
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
          `✅ Snipe Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      } else {
        console.log("Transaction failed.");
        bot.telegram.sendMessage(
          chat_ID,
          `❌ Snipe Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      }
    } catch (e) {
      console.log(e);
      console.log("Failed to get receipt.");
    }
  },
  sushiV2: async function snipeToken(
    chat_ID,
    tokenToSnipe,
    pair,
    amountIn,
    account
  ) {
    amountIn = parseEther(amountIn)
    const txHash = await submitTX.sushiV2(
      amountIn,
      pair,
      tokenToSnipe,
      account
    );
    if (!txHash) return;
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
          `✅ Snipe Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
            amountIn
          )}`
        );
      } else {
        console.log("Transaction failed.");
        bot.telegram.sendMessage(
          chat_ID,
          `❌ Snipe Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
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
