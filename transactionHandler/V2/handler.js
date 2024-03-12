const {
  Token,
  ChainId,
  WETH9,
  CurrencyAmount,
  TradeType,
  Percent
} = require("@uniswap/sdk-core");
const {
  getContract,
  erc20Abi,
  parseUnits,
  parseEther,
  formatEther,
} = require("viem");
const UniswapV2PairABI = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const UniswapV3PairABI = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const client = require("../../utils/client");
const { bot } = require("../../telegram/bot");

const { Pair, Route, Trade } = require("@uniswap/v2-sdk");
const contractHelper = require("../../utils/contractHelper");

async function fetchTokensAndPair(addressToken0) {
  var decimals0 = await fetchTokenDecimals(addressToken0);
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

async function snipeToken(chat_ID, tokenToSnipe, amountIn, account) {
  amountIn = parseEther(amountIn).toString();
  const txHash = await submitSwapTx(tokenToSnipe, amountIn, account);
  if (!txHash) return;
  try {
    const txReceipt = await client.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    if (txReceipt.status === "success") {
      console.log("Transaction successful.");
      bot.telegram.sendMessage(
        chat_ID,
        `✅ Snipe Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
          amountIn
        )}`
      );
    } else {
      console.log("Transaction failed.");
      bot.telegram.sendMessage(
        chat_ID,
        `❌ Snipe Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
          amountIn
        )}`
      );
    }
  } catch (e) {
    console.log(e);
    console.log("Failed to get receipt.");
  }
}

async function snipeTokenV3(chat_ID, tokenToSnipe, pair, fee, amountIn, account) {
  amountIn = parseEther(amountIn).toString();
  const txHash = await submitV3SwapTx(tokenToSnipe, pair, fee, amountIn, account);
  if (!txHash) return;
  try {
    const txReceipt = await client.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    if (txReceipt.status === "success") {
      console.log("Transaction successful.");
      bot.telegram.sendMessage(
        chat_ID,
        `✅ Snipe Successful\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
          amountIn
        )}`
      );
    } else {
      console.log("Transaction failed.");
      bot.telegram.sendMessage(
        chat_ID,
        `❌ Snipe Failed\n\n🎯 Token: ${tokenToSnipe}\n\n💰 Amount: ${formatEther(
          amountIn
        )}`
      );
    }
  } catch (e) {
    console.log(e);
    console.log("Failed to get receipt.");
  }
}

async function submitV3SwapTx(addressToken0, pair, fee, amountIn, account) {
  try {
    var decimals0 = await fetchTokenDecimals(addressToken0);
    const [token0, token1] = await fetchTokensAndPairV3(addressToken0, pair, decimals0);
    const walletClient = await client.getWalletClientFromAccount(account);
    var slippageTolerance = 0.5;
    var deadline = Math.floor(Date.now() / 1000) + 60 * 5;
    var recipient = account.address;
    const router = contractHelper.getRouterV3(walletClient);

    const amountout = await router.simulate.exactInputSingle([{
      tokenIn: token1.address,
      tokenOut: token0.address,
      fee: fee,
      recipient: recipient,
      deadline: deadline,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    }], 
    { value: amountIn})
    const amount = parseInt(amountout.result)
    var amountOutMinimum =(parseInt(amount-(amount*slippageTolerance/100))).toString();
    console.log(amount,amountOutMinimum,amountIn)
    const txHash = await router.write.exactInputSingle([{
      tokenIn: token1.address,
      tokenOut: token0.address,
      fee: fee,
      recipient: recipient,
      deadline: deadline,
      amountIn: amountIn,
      amountOutMinimum: amountOutMinimum,
      sqrtPriceLimitX96: 0
    }], 
    { value: amountIn})
    return txHash;

  } catch (e) {
    console.log(e);
    console.log("Failed to submit swap tx.");
    return null;
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
    client: client.publicClient,
  });
  var reserves = await contract.read.getReserves();
  return reserves.slice(0, 2);
}

async function testSnipe(chat_ID, amount, tokenSniped) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  bot.telegram.sendMessage(
    chat_ID,
    `✅ Snipe Test Successful\n\n🎯 Token: ${tokenSniped}\n\n💰 Amount: ${formatEther(
      amount
    )}`
  );
}
async function fetchTokensAndPairV3(addressToken0, pair, decimals0) {
  const [liquidity] = await getPoolData(pair);
  console.log(liquidity)
  var token1 = WETH9[ChainId.GOERLI];
  var token0 = new Token(ChainId.GOERLI, addressToken0, decimals0);
  return [token0, token1];
}
async function getPoolData(address) {
  var contract = getContract({
    address: address,
    abi: UniswapV3PairABI.abi,
    client: client.publicClient,
  });
  return [await contract.read.liquidity()]
}

module.exports = { snipeToken, testSnipe, snipeTokenV3 };
