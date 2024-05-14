const { WizardScene } = require("telegraf/scenes");
const helpers = require("../../utils/helpers");
const settingsHelpers = require("../helpers");
const { Markup } = require("telegraf");
const client = require("../../utils/client");
const userActions = require("../../utils/userActions");
const manualTrade = require("../handler");
const { isAddressEqual } = require("viem");
const manualSellScene = new WizardScene(
  "manualSell",
  (ctx) => {
    ctx.reply("📈 Manual Sell\n\n🔍 To cancel use /cancel");
    var data = ctx.session.sellData
    ctx.reply(`Selling Token: ${data.name}`)
    ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
  },
  async (ctx) => {
    ctx.reply(
      "Select Swap To Sell On:",
      Markup.inlineKeyboard([
        // [Markup.button.callback("🍣 Sushiswap V2", "swapType-sushi V2")],
        [Markup.button.callback("🦄 Uniswap V2", "swapType-uni V2")],
        // TODO: Implement asking fee or trying to get pair for all fee and then ask user to select
        // [Markup.button.callback("🦄 Uniswap V3", "swapType-uni V3")],
      ])
    );
  },
  async(ctx)=>{
    ctx.reply('➡️ Enter amount to sell:')
    return ctx.wizard.next();
  }
  // async (ctx) => {
  //   const userId = ctx.from.id;
  //   var buttons = await settingsHelpers.getPresetButtons(userId);
  //   ctx.reply(
  //     "Select a Preset amount to Buy or Type:",
  //     Markup.inlineKeyboard([
  //       ...pairChunk(buttons),
  //       [Markup.button.callback("Custom", "preset:custom")],
  //     ])
  //   );
  // },
  ,
  async (ctx) => {
    var amount = ctx.message.text;
    var data = ctx.session.sellData
    if(parseFloat(data.balanceFormatted)<=parseFloat(amount)){
      ctx.reply("Balance Low!")
      ctx.scene.leave()
    }
    ctx.session.amount = amount
    ctx.wizard.next();
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
  },
  async (ctx) => {
    var value = ctx.session.amount;
    ctx.reply("🔃Fetching Pair.....");
    const pair = await helpers.getPair(
      ctx.session.sellData.tokenAddress._value,
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
    const wallet = await userActions.getAllUserWallets(ctx.chat.id);
    console.log(wallet);
    if (!wallet || wallet.length === 0) {
      ctx.reply("❌ No wallets found, Please import/create a wallet first.");
      ctx.scene.leave();
      return;
    }
    var defaultWalletIndex = await userActions.getUserSettingValue(
      ctx.chat.id,
      "defaultManualBuyerWallets"
    );
    defaultWalletIndex = defaultWalletIndex ? defaultWalletIndex : 0;
    console.log(ctx.session.swapType);
    if (ctx.session.swapType === "sushi V2") {
      manualTrade.sushiV2(
        ctx.chat.id,
        ctx.session.sellData.tokenAddress._value,
        pair,
        value,
        wallet[defaultWalletIndex],
        "Sell"
      );
    } else if (ctx.session.swapType === "uni V2") {
      console.log(ctx.session.swapType);
      manualTrade.V2(
        ctx.chat.id,
        ctx.session.sellData.tokenAddress._value,
        value,
        wallet[defaultWalletIndex],
        "Sell"
        ,false
      );
    } else if (ctx.session.swapType === "uni V3") {
      console.log(ctx.session.swapType);
      // manualBuyer.V3(
      //   ctx.chat.id,
      //   ctx.session.messages[0],
      //   pair,
      //   value,
      //   wallet[defaultWalletIndex],
      //   "Buy"
      // );
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
  if(value==="custom"){
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

function pairChunk(arr) {
  var temp = [];
  for (var i = 0; i <= arr.length / 2 + 1; i += 2) {
    temp.push(arr.slice(i, i + 2));
  }
  return temp;
}

manualSellScene.command("cancel", (ctx) => {
  ctx.reply("❌ Cancelled.");
  ctx.scene.leave();
});

module.exports = { manualSellScene };
