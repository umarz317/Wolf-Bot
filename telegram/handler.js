const submitTX = require("../transactionHandler/submitTX");
const { parseEther, formatEther, parseGwei } = require("viem");
const client = require("../utils/client");
const userActions = require("../utils/userActions");
const { bot } = require("./bot");

// Applies the user's "Manual Buy Gwei" setting as the priority fee; otherwise viem estimates gas.
async function getGasOpts(chat_ID, type) {
  if (type !== "Buy") return {};
  const buyGwei = await userActions.getUserSettingValue(chat_ID, "buyGwei");
  return buyGwei != null ? { maxPriorityFeePerGas: parseGwei(String(buyGwei)) } : {};
}

function toWei(amount) {
  try {
    const wei = parseEther(String(amount));
    return wei > 0n ? wei : null;
  } catch {
    return null;
  }
}

function sendFailure(chat_ID, type, token, amount, reason) {
  bot.telegram.sendMessage(
    chat_ID,
    `❌ ${type} Failed\n\n🎯 Token: ${token}\n\n💰 Amount: ${amount}\n\n🔗 Reason: ${reason}`
  );
}

module.exports = {
  V2: async (chat_ID, tokenToSnipe, amountIn, account, type, buy = true) => {
    const gasOpts = await getGasOpts(chat_ID, type);
    const txHash = await submitTX.V2(tokenToSnipe, amountIn, account, buy, gasOpts);
    if (txHash.error) {
      bot.telegram.sendMessage(
        chat_ID,
        `❌ ${type} Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${amountIn}\n\n Reason: ${txHash.error}`
      );
      return;
    }
    bot.telegram.sendMessage(chat_ID, `Tx submitted: ${txHash}`);
    try {
      const txReceipt = await client.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      if (txReceipt.status === "success") {
        console.log("Transaction successful.");
        bot.telegram.sendMessage(
          chat_ID,
          `✅ ${type} Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${
            amountIn
          }`
        );
      } else {
        console.log("Transaction failed.");
        bot.telegram.sendMessage(
          chat_ID,
          `❌ ${type} Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${
            amountIn
          }`
        );
      }
    } catch (e) {
      console.log(e);
      console.log("Failed to get receipt.");
    }
  },
  V3: async (chat_ID, tokenToSnipe, pair, fee, amountIn, account, type) => {
    const rawAmount = amountIn;
    amountIn = toWei(amountIn);
    if (amountIn === null) {
      sendFailure(chat_ID, type, tokenToSnipe, rawAmount, "Invalid amount");
      return;
    }
    const txHash = await submitTX.V3(
      tokenToSnipe,
      pair,
      fee,
      amountIn,
      account
    );
    if (txHash.error) {
      sendFailure(chat_ID, type, tokenToSnipe, rawAmount, txHash.error);
      return;
    }
    bot.telegram.sendMessage(chat_ID, `Tx submitted: ${txHash}`);
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
  sushiV2: async (chat_ID, tokenToSnipe, pair, amountIn, account, type) => {
    const rawAmount = amountIn;
    amountIn = toWei(amountIn);
    if (amountIn === null) {
      sendFailure(chat_ID, type, tokenToSnipe, rawAmount, "Invalid amount");
      return;
    }
    const gasOpts = await getGasOpts(chat_ID, type);
    const txHash = await submitTX.sushiV2(
      amountIn,
      pair,
      tokenToSnipe,
      account,
      gasOpts
    );
    if (txHash.error) {
      const details = (txHash.error.message || "").split("Details:")[1];
      sendFailure(
        chat_ID,
        type,
        tokenToSnipe,
        rawAmount,
        details
          ? details.split("Version:")[0]
          : txHash.error.shortMessage || "Failed to submit swap tx."
      );
      return;
    }
    bot.telegram.sendMessage(chat_ID, `Tx submitted: ${txHash.hash}`);
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
