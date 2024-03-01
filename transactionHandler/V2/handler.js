const { Token, ChainId } = require("@uniswap/sdk-core");
const { Pair } = require("@uniswap/v2-sdk");
const { getContract, erc20Abi } = require("viem");
const publicClient = require("../utils/client");    

async function fetchPair(addressToken0,addressToken1){
    var token1 = new Token(ChainId.MAINNET, addressToken0, 18);
    var token0 = new Token(ChainId.MAINNET, addressToken1, 18);
    const pair = Pair.getAddress(token0,token1)
    console.log(pair)
}

async function fetchTokenDecimals(address){
    var contact = getContract({address:address,abi:erc20Abi,client:publicClient})
    var decimals = await contact.read.decimals()
    return decimals
}

// fetchPair("","")
fetchTokenDecimals("0x6982508145454Ce325dDbE47a25d4ec3d2311933")