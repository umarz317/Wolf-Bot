const { Token, ChainId, WETH9 } = require("@uniswap/sdk-core");
const { getContract, parseEther, formatEther, parseGwei } = require("viem");
const UniswapV3PairABI = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const client = require("../../../utils/client");
const contractHelper = require("../../../utils/contractHelper");
const helper = require("../../../utils/helpers");

async function submitSwapTxV3(addressToken0, pair, fee, amountIn, account) {
  try {
    var decimals0 = await helper.fetchTokenDecimals(addressToken0);
    const [token0, token1] = await fetchTokensAndPair(
      addressToken0,
      pair,
      decimals0
    );
    const walletClient = await client.getWalletClientFromAccount(account);
    var slippageTolerance = 0.10;
    var deadline = Math.floor(Date.now() / 1000) + 60 * 5;
    var recipient = account.address;
    const router = contractHelper.getRouterV3(walletClient);
    const amountout = await router.simulate.exactInputSingle(
      [
        {
          tokenIn: token1.address,
          tokenOut: token0.address,
          fee: fee,
          recipient: recipient,
          deadline: deadline,
          amountIn: amountIn,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0,
        },
      ],
      //value should be bigint!
      { value: parseEther(formatEther(amountIn)) }
    );
    const amount = parseInt(amountout.result);
    var amountOutMinimum = parseInt(
      amount - (amount * slippageTolerance) / 100
    ).toString();
    console.log("Sending Snipe TX")
    const txHash = await router.write.exactInputSingle(
      [
        {
          tokenIn: token1.address,
          tokenOut: token0.address,
          fee: fee,
          recipient: recipient,
          deadline: deadline,
          amountIn: amountIn,
          //manage slippage better
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0,
        },
      ],
      //value should be bigint!
      { value: parseEther(formatEther(amountIn)), maxPriorityFeePerGas: parseGwei('10'), }
    );
    console.log("Snipe Tx hash: ", txHash);
    return txHash;
  } catch (e) {
    console.log(e);
    console.log("Failed to submit swap tx.");
    return null;
  }
}


async function fetchTokensAndPair(addressToken0, pair, decimals0) {
  const [liquidity] = await getPoolData(pair);
  console.log(liquidity);
  var token1 = new Token(ChainId.SEPOLIA, "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", 18);
  var token0 = new Token(ChainId.SEPOLIA, addressToken0, decimals0);
  return [token0, token1];
}

async function getPoolData(address) {
  var contract = getContract({
    address: address,
    abi: UniswapV3PairABI.abi,
    client: client.publicClient,
  });
  return [await contract.read.liquidity()];
}

module.exports = { submitSwapTxV3 };
