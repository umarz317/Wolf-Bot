const {
    Token,
    ChainId,
    WETH9,
    CurrencyAmount,
    TradeType,
    Percent
} = require("@uniswap/sdk-core");
const JSBI = require('jsbi')
const { Pool, Route:v3Route, Trade:v3Trade, SwapRouter } = require("@uniswap/v3-sdk");
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
      { value: parseEther(value), gas: 3000000n}
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

async function snipeTokenV3(chat_ID, tokenToSnipe,pair, fee, amountIn, account) {
  amountIn = parseEther(amountIn).toString();
  const txHash = await submitV3SwapTx(tokenToSnipe,pair, fee, amountIn, account);
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
      console.log(account)
      const [trade] = await fetchV3Trade(addressToken0, pair, fee, amountIn);
      const walletClient = await client.getWalletClientFromAccount(account);
      const options = {
          slippageTolerance: new Percent("50", "10000"),
          deadline: Math.floor(Date.now() / 1000) + 60 * 5,
          recipient: account.address,
      }
      const methodParameters = SwapRouter.swapCallParameters([trade], options)
      const tx = {
          data: methodParameters.calldata,
          to: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
          value: methodParameters.value,
          from: account.address,
      }

      const res = await walletClient.sendTransaction(tx)
      return res
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

async function fetchV3Trade(addressToken0, pair, fee, amountIn) {
  var decimals0 = await fetchTokenDecimals(addressToken0);
  const [token0, token1, pool] = await fetchTokensAndPairV3(addressToken0, pair, fee, decimals0);
  const swapRoute = new v3Route(
      [pool],
      token1,
      token0
  )
  const trade = v3Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(
          token1,
          amountIn
      ),
      outputAmount: CurrencyAmount.fromRawAmount(
          token0,
          JSBI.BigInt(100)
      ),
      tradeType: TradeType.EXACT_INPUT,
  })
  return [trade, token0, token1];
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
async function fetchTokensAndPairV3(addressToken0, pair, fee, decimals0) {
  const [liquidity, pooldata] = await getPoolData(pair, fee);
  console.log(liquidity, pooldata)
  var token1 = WETH9[ChainId.GOERLI];
  var token0 = new Token(ChainId.GOERLI, addressToken0, decimals0);
  const pool = new Pool(
      token1,
      token0,
      fee,
      pooldata[0].toString(),
      liquidity.toString(),
      pooldata[1]
  )

  return [token0, token1, pool];
}
async function getPoolData(address, fee) {
  var contract = getContract({
      address: address,
      abi: UniswapV3PairABI.abi,
      client: client.publicClient,
  });
  return [await contract.read.liquidity(), await contract.read.slot0()]
}

module.exports = { snipeToken, testSnipe,snipeTokenV3 };
