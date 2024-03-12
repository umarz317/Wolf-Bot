const { createPublicClient, http, createWalletClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { mainnet, polygon, sepolia, goerli } = require("viem/chains");
require("dotenv").config();
const keyManagement = require('./keyManagement')

const publicClient = createPublicClient({
  chain: goerli,
  transport: http(process.env.RPC),
});
async function getWalletClientFromAccount(account) {
  const walletClient = createWalletClient({
    chain: goerli,
    transport: http(process.env.RPC),
    account: privateKeyToAccount(keyManagement.decrypt(account.privateKey)),
  });
  return walletClient
}
//test
async function getWalletClientFromPK(account) {
  const walletClient = createWalletClient({
    chain: goerli,
    transport: http(process.env.RPC),
    account: privateKeyToAccount(account.privateKey),
  });
  return walletClient
}
module.exports = { publicClient, getWalletClientFromAccount ,getWalletClientFromPK};
