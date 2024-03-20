const { createPublicClient, http, createWalletClient } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { polygon, sepolia, base } = require("viem/chains");
require("dotenv").config();
const keyManagement = require("./keyManagement");

const publicClient = createPublicClient({
  // chain: process.env.POLYGON==='true'?polygon:sepolia,
  chain: base,
  // transport: process.env.POLYGON==='true'?http():http(process.env.RPC),
  transport: http(),
});
async function getWalletClientFromAccount(account) {
  const walletClient = createWalletClient({
    // chain: process.env.POLYGON==='true'?polygon:sepolia,
    chain: base,
    // transport: process.env.POLYGON==='true'?http():http(process.env.RPC),
    transport: http(),
    account: privateKeyToAccount(keyManagement.decrypt(account.privateKey)),
  });
  return walletClient;
}
// //test
// function getWalletClientFromPK() {
//   const walletClient = createWalletClient({
//     chain: polygon,
//     transport: http(),
//     account: privateKeyToAccount(process.env.PK),
//   });
//   return walletClient
// }
// const polygonPublicClient = createPublicClient({
//   chain: polygon,
//   transport: http(process.env.RPC),
// });
// async function getWalletClientFromAccountPolygon(account) {
//   const walletClient = createWalletClient({
//     chain: polygon,
//     transport: http(process.env.RPC),
//     account: privateKeyToAccount(keyManagement.decrypt(account.privateKey)),
//   });
//   return walletClient
// }
module.exports = { publicClient, getWalletClientFromAccount };
