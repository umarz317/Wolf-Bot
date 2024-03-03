const abiV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json");
const client = require("../utils/client");
const { trim } = require("viem");
const transactionHandler = require("../transactionHandler/V2/handler");
const { set } = require("mongoose");
require("dotenv").config();

function watchPairEvent(tokenToSnipe, amount, account) {
  client.watchEvent({
    address: process.env.PAIR_V2_FACTORY,
    event: abiV2Factory.abi.filter((abi) => abi.name == "PairCreated")[0],
    onLogs: (logs) => {
      const tokens = getTokensFromEventTopic(logs.topics);
      if (isPairSnipeable(tokenToSnipe, tokens)) {
        transactionHandler.snipeToken(tokenToSnipe, amount, account);
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
}

function getTokensFromEventTopic(topics) {
  return topics.slice(1).map((topic) => trim(topic));
}

function isPairSnipeable(snipeToken, tokens) {
  return tokens.includes(snipeToken);
}

async function testEvent(chat_ID, amount, tokenToSnipe) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  transactionHandler.testSnipe(chat_ID, amount, tokenToSnipe);
}

module.exports = { watchPairEvent, testEvent };
