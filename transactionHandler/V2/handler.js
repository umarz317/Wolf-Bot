const {
  Token,
  ChainId,
  WETH9,
  CurrencyAmount,
  TradeType,
  Percent,
} = require("@uniswap/sdk-core");
const {
  getContract,
  parseUnits,
  parseEther,
} = require("viem");
const UniswapV2PairABI = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const client = require("../../utils/client");
const { Pair, Route, Trade } = require("@uniswap/v2-sdk");
const contractHelper = require("../../utils/contractHelper");
const helper = require("../../utils/helpers");

async function fetchTokensAndPair(addressToken0) {
  var decimals0 = await helper.fetchTokenDecimals(addressToken0);
  var token1 = WETH9[ChainId.GOERLI];
  var token0 = new Token(ChainId.GOERLI, addressToken0, decimals0);
  const pairAddress = Pair.getAddress(token0, token1);
  var tokens = [token0, token1];
  const reserves = await getReserves(pairAddress);
  tokens = tokens[0].sortsBefore(tokens[1])
    ? [token0, token1]
    : [token1, token0];
  const pair = new Pair(
    CurrencyAmount.fromRawAmount(token0, reserves[0].toString()),
    CurrencyAmount.fromRawAmount(token1, reserves[1].toString())
  );
  return [token0, token1, pair];
}

async function fetchTrade(addressToken0, amountIn) {
  const [token0, token1, pair] = await fetchTokensAndPair(addressToken0);
  const route = new Route([pair], token1, token0);
  const trade = new Trade(
    route,
    CurrencyAmount.fromRawAmount(token1, amountIn),
    TradeType.EXACT_INPUT
  );
  return [trade, token0, token1];
}

async function submitSwapTx(addressToken0, amountIn, account) {
  try {
    const [trade, token0, token1] = await fetchTrade(addressToken0, amountIn);
    const walletClient = await client.getWalletClientFromAccount(account);
    const router = contractHelper.getRouter(walletClient);
    const slippageTolerance = new Percent("50", "10000");
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();
    const path = [token1.address, token0.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
    const value = trade.inputAmount.toExact();
    const txHash = await router.write.swapExactETHForTokens(
      [parseUnits(amountOutMin), path, account.address, deadline],
      { value: parseEther(value), gas: 3000000n }
    );
    return txHash;
  } catch (e) {
    console.log(e);
    console.log("Failed to submit swap tx.");
    return null;
  }
}

async function getReserves(address) {
  var contract = getContract({
    address: address,
    abi: UniswapV2PairABI.abi,
    client: client.publicClient,
  });
  var reserves = await contract.read.getReserves();
  return reserves.slice(0, 2);
}


module.exports = { submitSwapTx };

