const {
  encodePacked,
  toHex,
  isAddress,
} = require("viem");
const contractHelper = require("../../utils/contractHelper");
const {
  publicClient,
  getWalletClientFromAccount,
} = require("../../utils/client");
const routeProcessorABI = require("../../abi/routeProcessor.json");
const { Addresses } = require("../../utils/constants");

async function submitSushiTx(amountIn, pair, tokenToSnipe, account) {
  try {
    var to = account.address;
    console.log("account " + to);
    var route = encodeRoute(pair, Addresses.WETH, to);
    console.log("Simulating route...");
    var amountOut = await publicClient.simulateContract({
      address: Addresses.SUSHI_ROUTE_PROCESSOR,
      abi: routeProcessorABI,
      functionName: "processRoute",
      args: [Addresses.NATIVE_TOKEN, amountIn, tokenToSnipe, 0, to, route],
      value: amountIn,
    });
    amountOut = amountOut.result;
    amountOut = parseInt(amountOut);
    var amountOutMin = parseInt(amountOut - amountOut * 0.5);
    var walletClient = await getWalletClientFromAccount(account);
    var sushiRouteProcessor =
      contractHelper.getSushiRouteProcessor(walletClient);
    console.log("Sending transaction...");
    var hash = await sushiRouteProcessor.write.processRoute(
      [
        Addresses.NATIVE_TOKEN,
        amountIn,
        tokenToSnipe,
        amountOutMin,
        to,
        route,
      ],
      { value: amountIn, gas: 300000n }
    );
    console.log("Transaction hash: " + hash);
    return {hash: hash, error: null};
  } catch (e) {
    console.log(e);
    return {hash: null, error: e};
  }
}

function encodeRoute(pair, warpMatic, to) {
  var params = {
    wrap: {
      command: 3,
      pools: 1,
      share: 65535, //large unit16?
      poolType: 2, // for uniswap wrap native (got from contract)
      direction: 1, // ->
      pair: pair,
      wrapMatic: warpMatic,
    },
    route: {
      command: 4,
      wrapMatic: warpMatic,
      poolType: 0, // for uniswap v2
      pair: pair,
      direction: 1, // <-
    },
  };
  var paramsArr = [
    ...Object.values(params.wrap).map((val) => {
      if (!isAddress(val)) {
        return toHex(val);
      } else return val;
    }),
    ...Object.values(params.route).map((val) => {
      if (!isAddress(val)) {
        return toHex(val);
      } else return val;
    }),
    ...[to, toHex(3000)],
  ];
  // COMMENTS FOR FUTURE CHANGES
  var route = encodePacked(
    [
      //WRAPPING PARAMS
      "uint8", // COMMAND CODE
      "uint8", // NUMBER OF POOLS
      "uint16", // SHARE IN POOL
      "uint8", // POOL TYPE
      "uint8", // DIRECTION
      "address", // PAIR
      "address", // WRAP MATIC
      //ROUTE PARAMS
      "uint8", //COMMAND
      "address", // WRAP MATIC
      "uint8", // POOL TYPE
      "address", // PAIR
      "uint8", // DIRECTION
      "address", // TO:DESTINATION
      "uint24", // FEE IN BIPS SETTING (0.3%) CHANGE IN FUTURE
    ],
    paramsArr
  );
  return route;
}
module.exports = submitSushiTx;

//test
// submitSushiTx(
//   500000000000000000n,
//   "0x55ff76bffc3cdd9d5fdbbc2ece4528ecce45047e",
//   "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
//   "0x0f2e359DE7769c155b08DC5342aEA80eb3fC8C64"
// );
// console.log(walletClient)
