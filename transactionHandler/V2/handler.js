const {
  Token,
  ChainId,
  WETH9,
  CurrencyAmount,
  TradeType,
} = require("@uniswap/sdk-core");
const { Pair, Route, Trade } = require("@uniswap/v2-sdk");
const { getContract, erc20Abi } = require("viem");
const UniswapV2PairABI = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");

const publicClient = require("../../utils/publicClient");
const contractHelper = require("../../utils/contractHelper");

async function fetchTokensAndPair(addressToken0) {
  var decimals0 = await fetchTokenDecimals(addressToken0);
  var token1 = WETH9[ChainId.MAINNET];
  var token0 = new Token(ChainId.MAINNET, addressToken0, decimals0);
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
    const router = contractHelper.getRouter();
    const slippageTolerance = new Percent("50", "10000");
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();
    const path = [token1, token0];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
    const txHash = await router.write.swapExactETHForTokens(
      amountOutMin,
      path,
      account,
      deadline
    );
    return txHash;
  } catch (e) {
    console.log(e);
    console.log("Failed to submit swap tx.");
    return null;
  }
}

async function snipeToken(tokenToSnipe, amountIn, account) {
  const txHash = await submitSwapTx(tokenToSnipe, amountIn, account);
  if(!txHash) return;
  try {
    const txReceipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    if(txReceipt.status==='success') {
      console.log("Transaction successful.");
      //yahan send message to user ky snipe is successful
    }
    else {
      console.log("Transaction failed.");
      //yahan send message to user ky snipe has failed
    }
  } catch (e) {
    console.log(e);
    console.log("Failed to get receipt.");
  }
}

async function fetchTokenDecimals(address) {
  var decimals = await contractHelper.getToken(address).read.decimals();
  return decimals;
}

async function getReserves(address) {
  var contract = getContract({
    address: address,
    abi: UniswapV2PairABI.abi,
    client: publicClient,
  });
  var reserves = await contract.read.getReserves();
  return reserves.slice(0, 2);
}

// fetchPair("0x6982508145454Ce325dDbE47a25d4ec3d2311933");
// getReserves("0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f");
// console.log(BigInt('3519442936847728775884626343900'))
fetchTrade("0x6982508145454Ce325dDbE47a25d4ec3d2311933", "100000000000000000");
