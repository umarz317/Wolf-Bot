const { createPublicClient, http, createWalletClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { base } = require("viem/chains");
const keyManagement = require("./keyManagement");

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});
async function getWalletClientFromAccount(account) {
  const walletClient = createWalletClient({
    chain: base,
    transport: http(),
    account: privateKeyToAccount(keyManagement.decrypt(account.privateKey)),
  });
  return walletClient;
}
module.exports = { publicClient, getWalletClientFromAccount };
