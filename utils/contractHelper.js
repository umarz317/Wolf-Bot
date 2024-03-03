const { getContract, erc20Abi } = require("viem");
const client = require("./client");
const uniswapV2RouterABI = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");
module.exports = {
  getToken: (address) => {
    var contract = getContract({
      address: address,
      abi: erc20Abi,
      client: client.publicClient,
    });
    return contract;
  },
  getRouter: () => {
    var contract = getContract({
      address: process.env.ROUTER_V2,
      abi: uniswapV2RouterABI.abi,
      client: client.walletClient,
    });
    return contract;
  },
};
