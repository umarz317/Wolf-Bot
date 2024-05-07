const abiV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json");
const abiV3Factory = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
const {ChainId,WETH9} = require("@uniswap/sdk-core");
const client = require("../utils/client");
const { trim, getAddress } = require("viem");
const snipe = require("../telegram/handler"); 
// require("dotenv").config();

function watchPairEvent(chat_ID,tokenToSnipe, amount, account) {
  client.publicClient.watchEvent({
    address: process.env.PAIR_V2_FACTORY,
    event: abiV2Factory.abi.filter((abi) => abi.name == "PairCreated")[0],
    onLogs: (logs) => {
      console.log('Pair created!')
      const tokens = getTokensFromEventTopic(logs[0].topics);
      if (isPairSnipeable(tokenToSnipe, tokens)) {
        console.log('Pair snipeable!')
        snipe.V2(chat_ID,tokenToSnipe, amount, account,"Snipe");
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });
}
function watchPairEventV3(chat_ID, tokenToSnipe, amount, account) {
  const weth = WETH9[ChainId.BASE].address
  client.publicClient.watchEvent({
      address: process.env.V3_FACTORY,
      event: abiV3Factory.abi.filter((abi) => abi.name == "PoolCreated")[0],
      args: {
          token0: tokenToSnipe,
          token1: weth
      },
      onLogs: (logs) => {
          console.log('V3 Pair created!')
          console.log('Pair snipeable!')
          snipe.V3(chat_ID, tokenToSnipe, logs[0].args.pool, logs[0].args.fee, amount, account,"Snipe");
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

module.exports = { watchPairEvent,watchPairEventV3};