const { createPublicClient, http, createWalletClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { mainnet, polygon, sepolia, goerli } = require("viem/chains");
require("dotenv").config();

const publicClient = createPublicClient({
  chain: goerli,
  transport: http(process.env.RPC),
});
const walletClient = createWalletClient({
  chain: goerli,
  transport: http(process.env.RPC),
  account: privateKeyToAccount(process.env.PK),
});
module.exports = { publicClient, walletClient };
