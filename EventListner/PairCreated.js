const abiV2Factory = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json");
const abiV3Factory = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
const client = require("../utils/client");
const { getAddress, isAddressEqual } = require("viem");
const snipe = require("../telegram/handler");
const {Addresses} = require('../utils/constants')
//TODO: Implement sushi snipe?
//TODO: Persist pending snipes so they survive restarts.

// Watches V2 and V3 for the first token/WETH pool and buys once, then stops both watchers.
function watchSnipe(chat_ID, tokenToSnipe, amount, account) {
  tokenToSnipe = getAddress(tokenToSnipe);
  let fired = false;
  const unwatchers = [];
  const fire = (buy) => {
    if (fired) return;
    fired = true;
    unwatchers.forEach((unwatch) => unwatch());
    buy();
  };

  unwatchers.push(
    client.publicClient.watchEvent({
      address: Addresses.PAIR_V2_FACTORY,
      event: abiV2Factory.abi.find((abi) => abi.name == "PairCreated"),
      onLogs: (logs) => {
        console.log('Pair created!')
        if (logs.some((log) => isWethPairOf(tokenToSnipe, log.args.token0, log.args.token1))) {
          console.log('Pair snipeable!')
          fire(() => snipe.V2(chat_ID, tokenToSnipe, amount, account, "Snipe"));
        }
      },
      onError: (err) => {
        console.log(err);
      },
    })
  );

  unwatchers.push(
    client.publicClient.watchEvent({
      address: Addresses.V3_FACTORY,
      event: abiV3Factory.abi.find((abi) => abi.name == "PoolCreated"),
      onLogs: (logs) => {
        console.log('V3 Pair created!')
        const log = logs.find((l) => isWethPairOf(tokenToSnipe, l.args.token0, l.args.token1));
        if (log) {
          console.log('Pair snipeable!')
          fire(() => snipe.V3(chat_ID, tokenToSnipe, log.args.pool, log.args.fee, amount, account, "Snipe"));
        }
      },
      onError: (err) => {
        console.log(err);
      },
    })
  );
}

function isWethPairOf(token, token0, token1) {
  return (
    (isAddressEqual(token0, token) && isAddressEqual(token1, Addresses.WETH)) ||
    (isAddressEqual(token1, token) && isAddressEqual(token0, Addresses.WETH))
  );
}

module.exports = { watchSnipe };
