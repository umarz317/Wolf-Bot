const { WizardScene } = require("telegraf/scenes");
const helpers = require("../../utils/helpers");
const { Markup } = require("telegraf");
const client = require("../../utils/client");
const userActions = require("../../utils/userActions");
const manualTrade = require("../handler");
const { isAddressEqual } = require("viem");
const manualSellScene = new WizardScene(
  "manualSell",
  (ctx) => {
    ctx.reply("📈 Manual Sell\n\n🔍 To cancel use /cancel");
    var data = ctx.session.sellData;
    ctx.reply(`Selling Token: ${data.name}`);
    ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
  },
  async (ctx) => {
    ctx.reply(
      "Select Swap To Sell On:",
      Markup.inlineKeyboard([
        // TODO: Implement sell for sushiswapv2
        // [Markup.button.callback("🍣 Sushiswap V2", "swapType-sushi V2")],
        [Markup.button.callback("🦄 Uniswap V2", "swapType-uni V2")],
        // TODO: Implement asking fee or trying to get pair for all fee and then ask user to select
        // [Markup.button.callback("🦄 Uniswap V3", "swapType-uni V3")],
      ])
    );
  },
  (ctx) => {
    ctx.reply("➡️ Enter amount to sell:");
    return ctx.wizard.next();
  },
  (ctx) => {
    var amount = ctx.message?.text;
    var data = ctx.session.sellData;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      ctx.reply("❌ Invalid amount.\n\nPlease enter a valid amount:");
      return;
    }
    if (parseFloat(amount) > parseFloat(data.balanceFormatted)) {
      ctx.reply("Balance Low!");
      return ctx.scene.leave();
    }
    ctx.session.amount = amount;
    ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
  },
  async (ctx) => {
    var value = ctx.session.amount;
    ctx.reply("🔃Fetching Pair.....");
    const pair = await helpers.getPair(
      ctx.session.sellData.tokenAddress,
      client.publicClient,
      ctx.session.swapType
    );
    console.log("Pair", pair);
    if (
      pair === undefined ||
      isAddressEqual(pair, "0x0000000000000000000000000000000000000000")
    ) {
      ctx.reply(
        "❌ Pair not found.",
        Markup.inlineKeyboard([
          Markup.button.callback("❌ Cancel Sell", "cancelSell"),
        ])
      );
      return;
    }
    ctx.reply("✅ Pair found.");
    const wallet = await userActions.getAllUserWallets(ctx.from.id);
    if (!wallet || wallet.length === 0) {
      ctx.reply("❌ No wallets found, Please import/create a wallet first.");
      ctx.scene.leave();
      return;
    }
    var defaultWalletIndex = await userActions.getUserSettingValue(
      ctx.from.id,
      "defaultWallet"
    );
    defaultWalletIndex = wallet[defaultWalletIndex] ? defaultWalletIndex : 0;
    console.log(ctx.session.swapType);
    if (ctx.session.swapType === "sushi V2") {
      manualTrade.sushiV2(
        ctx.chat.id,
        ctx.session.sellData.tokenAddress,
        pair,
        value,
        wallet[defaultWalletIndex],
        "Sell"
      );
    } else if (ctx.session.swapType === "uni V2") {
      console.log(ctx.session.swapType);
      manualTrade.V2(
        ctx.chat.id,
        ctx.session.sellData.tokenAddress,
        value,
        wallet[defaultWalletIndex],
        "Sell",
        false
      );
    } else if (ctx.session.swapType === "uni V3") {
      console.log(ctx.session.swapType);
      //TODO: Implement uniswap-v3 sell
    }
    ctx.reply("✅ Sell setup complete, We'll Sell the token and update you.");
    ctx.scene.leave();
  }
);

manualSellScene.action("cancelSell", (ctx) => {
  ctx.reply("❌ Sell Cancelled.");
  ctx.scene.leave();
});

manualSellScene.action(/^preset/, async (ctx) => {
  const value = ctx.callbackQuery.data.split(":")[1];
  ctx.session.value = value;
  if (value === "custom") {
    ctx.reply("➡️ Enter the amount you want to Sell:");
    return ctx.wizard.next();
  }
  ctx.wizard.next();
  return ctx.wizard.steps[ctx.wizard.cursor](ctx);
});

manualSellScene.action(/^swapType/, (ctx) => {
  ctx.session.swapType = ctx.callbackQuery.data.split("-")[1];
  ctx.wizard.next();
  return ctx.wizard.steps[ctx.wizard.cursor](ctx);
});

manualSellScene.command("cancel", (ctx) => {
  ctx.reply("❌ Cancelled.");
  ctx.scene.leave();
});

module.exports = { manualSellScene };
