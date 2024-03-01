const abiV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json");
const client = require("../utils/client");
const { trim } = require("viem");
require("dotenv").config();

function watchPairEvent(tokenToSnipe) {
  client.watchEvent({
    address: process.env.PAIR_V2_FACTORY,
    event: abiV2Factory.abi.filter((abi) => abi.name == "PairCreated")[0],
    onLogs: (logs) => {
      const tokens = getTokensFromEventTopic(logs.topics);
      //add snipeable token check
        if (isPairSnipeable(tokenToSnipe, tokens)) {
            console.log("Pair Created", tokens);
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
