const {
  Token,
  ChainId,
  CurrencyAmount,
  TradeType,
  Percent,
} = require("@uniswap/sdk-core");
const { getContract, parseUnits, parseEther } = require("viem");
const UniswapV2PairABI = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const client = require("../../../utils/client");
const { Pair, Route, Trade } = require("@uniswap/v2-sdk");
const contractHelper = require("../../../utils/contractHelper");
const helper = require("../../../utils/helpers");

async function fetchTokensAndPair(addressToken0) {
  var decimals0 = await helper.fetchTokenDecimals(addressToken0);
  var token0 = new Token(ChainId.BASE, addressToken0, decimals0);
  var token1 = new Token(ChainId.BASE, process.env.WETH, 18);
  const pairAddress = Pair.getAddress(token0, token1);
  console.log(pairAddress, "pairAddress");
  var tokens = [token0, token1];
  const reserves = await getReserves(pairAddress);
  tokens = tokens[0].sortsBefore(tokens[1])
    ? [token0, token1]
    : [token1, token0];
  const pair = new Pair(
    CurrencyAmount.fromRawAmount(tokens[0], reserves[0].toString()),
    CurrencyAmount.fromRawAmount(tokens[1], reserves[1].toString())
  );
  return [token0,token1, pair, decimals0];
}

async function fetchTrade(addressToken0, amountIn, buy) {
  const [token0, token1, pair, decimals0] = await fetchTokensAndPair(
    addressToken0
  );
  const route = buy
    ? new Route([pair], token1,token0)
    : new Route([pair], token0,token1);
  const trade = new Trade(
    route,
    buy
      ? CurrencyAmount.fromRawAmount(token1, parseEther(amountIn).toString())
      : CurrencyAmount.fromRawAmount(token0, parseUnits(amountIn,decimals0).toString()),
    TradeType.EXACT_INPUT
  );
  return [trade, token0, token1, decimals0];
}

async function submitSwapTx(addressToken0, amountIn, account, buy = true) {
  try {
    const [trade, token0, token1, decimals0] = await fetchTrade(
      addressToken0,
      amountIn,
      buy
    );
    const walletClient = await client.getWalletClientFromAccount(account);
    const router = contractHelper.getRouter(walletClient);
    const slippageTolerance = new Percent("500", "10000");
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).toExact();
    console.log("Amount out min: ", amountOutMin);
    const path = buy
      ? [token1.address, token0.address]
      : [token0.address, token1.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
    var value = trade.inputAmount.toExact();
    var txHash = "";
    if (buy)
      txHash = await router.write.swapExactETHForTokens(
        [parseUnits(amountOutMin, decimals0), path, account.address, deadline],
        { value: parseEther(value), gas: 3000000n }
      );
    else {
      console.log(value)
      var contract = contractHelper.getTokenWrite(addressToken0,walletClient)
      var allowance = await contract.read.allowance([walletClient.account.address,router.address])
      if(allowance<=parseUnits(value,decimals0)){
        var tx = await contract.write.approve([router.address,parseUnits(Number.MAX_SAFE_INTEGER.toString(),decimals0)])
        var receipt = await client.publicClient.waitForTransactionReceipt({hash:tx})
        if(receipt.status==='success'){
          console.log('Token Approved!')
        }
        else{
          console.log('Token Approval Failed!')
        }
      }
      txHash = await router.write.swapExactTokensForETH([
        parseUnits(value, decimals0),
        parseUnits(amountOutMin),
        path,
        account.address,
        deadline,
      ]);
    }
    return txHash;
  } catch (e) {
    console.log("Failed to submit swap tx.");
    console.log(e.message);
    return {
      error: e.message.split("Details:")[1]
        ? e.message.split("Details:")[1].includes("FROM_FAILED")
          ? "No Approval for Router to Swap"
          : e.message.split("Details:")[1]
        : e.message.split("Details:")[1] || "Failed to submit swap tx.",
    };
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
