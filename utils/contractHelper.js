const { getContract, erc20Abi } = require("viem");
const client = require("./client");
const uniswapV2RouterABI = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");
const V3SwapRouterABI  = require('@uniswap/swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json')
const sushiRouteProcessorABI = require("../abi/routeProcessor.json")
const sushiFactoryV2ABI = require("../abi/v2sushiFactory.json")

module.exports = {
  getToken: (address) => {
    var contract = getContract({
      address: address,
      abi: erc20Abi,
      client: client.publicClient,
    });
    return contract;
  },
  getRouter: (walletClient) => {
    var contract = getContract({
      address: process.env.ROUTER_V2,
      abi: uniswapV2RouterABI.abi,
      client: walletClient,
    });
    return contract;
  },
  getRouterV3: (walletClient) => {
    var contract = getContract({
      address: process.env.V3_ROUTER,
      abi: V3SwapRouterABI.abi,
      client: walletClient,
    });
    return contract;
  },
  getSushiFactoryV2: (client) => {
    var contract = getContract({
      address: process.env.V2_FACTORY_SUSHI,
      abi: sushiFactoryV2ABI,
      client: client,
    });
    return contract;
  },
  getSushiRouteProcessor: (client) => {
    var contract = getContract({
      address: process.env.SUSHI_ROUTE_PROCESSOR,
      abi: sushiRouteProcessorABI,
      client: client,
    });
    return contract;
  }
};
