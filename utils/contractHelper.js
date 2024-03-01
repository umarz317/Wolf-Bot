const { getContract } = require('viem');
const publicClient = require('../utils/publicClient')
const uniswapV2RouterABI = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
module.exports = {
    getToken: (address)=>{
        var contract = getContract({
            address: address,
            abi: erc20Abi,
            client: publicClient,
          });
          return contract;
    },
    getRouter:(walletClient) => {
        var contract = getContract({
            address: process.env.ROUTER_V2,
            abi: uniswapV2RouterABI.abi,
            client: walletClient
          });
          return contract;
    }
}