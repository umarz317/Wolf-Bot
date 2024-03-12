const abiV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json");
const abiV3Factory = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
const {ChainId,WETH9} = require("@uniswap/sdk-core");
const client = require("../utils/client");
const { trim, getAddress } = require("viem");
const transactionHandler = require("../transactionHandler/V2/handler");
require("dotenv").config();

function watchPairEvent(chat_ID,tokenToSnipe, amount, account) {
  client.publicClient.watchEvent({
    address: process.env.PAIR_V2_FACTORY,
    event: abiV2Factory.abi.filter((abi) => abi.name == "PairCreated")[0],
    onLogs: (logs) => {
      console.log('Pair created!')
      console.log(logs)
      const tokens = getTokensFromEventTopic(logs[0].topics);
      if (isPairSnipeable(tokenToSnipe, tokens)) {
        console.log('Pair snipeable!')
        transactionHandler.snipeToken(chat_ID,tokenToSnipe, amount, account);
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
}
function watchPairEventV3(chat_ID, tokenToSnipe, amount, account) {
  const weth = WETH9[ChainId.GOERLI].address
  client.publicClient.watchEvent({
      address: process.env.V3_FACTORY,
      event: abiV3Factory.abi.filter((abi) => abi.name == "PoolCreated")[0],
      args: {
          token0: weth < tokenToSnipe ? weth : tokenToSnipe,
          token1: weth < tokenToSnipe ? tokenToSnipe : weth
      },
      onLogs: (logs) => {
          console.log('V3 Pair created!')
          console.log(logs)
          console.log('Pair snipeable!')
          transactionHandler.snipeTokenV3(chat_ID, tokenToSnipe, logs[0].args.pool, logs[0].args.fee, amount, account);
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
  tokens = tokens.map((token) => getAddress(token));
  return tokens.includes(snipeToken);
}

async function testEvent(chat_ID, amount, tokenToSnipe) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  transactionHandler.testSnipe(chat_ID, amount, tokenToSnipe);
}

module.exports = { watchPairEvent, testEvent,watchPairEventV3};