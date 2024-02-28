const { createPublicClient, http } = require('viem')
const {mainnet, polygon} = require('viem/chains')

const publicClient = createPublicClient({chain:polygon, transport:http('https://ethereum-mainnet.core.chainstack.com/e0a359b59bf807c0b22afe531de8886b')})

module.exports = publicClient