const { WizardScene } = require("telegraf/scenes");
const helpers = require("../../utils/helpers");
const settingsHelpers = require('../helpers')
const { Markup } = require("telegraf");
const client = require("../../utils/client");
const userActions = require('../../utils/userActions')
const manualBuyer = require("../handler")
const manualBuyScene = new WizardScene(
  "manualBuy",
  (ctx) => {
    ctx.reply("📈 Manual Buy\n\n🔍 To cancel use /cancel");
    ctx.reply("➡️ Enter the token address you want to Buy:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    var token = ctx.message.text;
    ctx.session.messages = [token];
    ctx.reply("🔃Checking address.....");
    token = ctx.session.messages[0];
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!helpers.isValidAddress(token)) {
      ctx.reply(
        "❌ Invalid token address.\n\nPlease enter a valid token address:",
        Markup.inlineKeyboard([
          Markup.button.callback("❌ Cancel Buy", "cancelBuy"),
        ])
      );
      return;
    }
    if (!(await helpers.isERC20(token))) {
      ctx.reply(
        "❌ Invalid token address, the address is not a ERC20 token.",
        Markup.inlineKeyboard([
          Markup.button.callback("❌ Cancel Buy", "cancelBuy"),
        ])
      );
      return;
    }
    ctx.reply("✅ Token address is valid.");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ctx.reply(
      "Select Swap Type:",
      Markup.inlineKeyboard([
        [Markup.button.callback("🍣 Sushiswap V2", "swapType-sushi V2")],
        [Markup.button.callback("🦄 Uniswap V2", "swapType-uni V2")],
// TODO: Implement asking fee or trying to get pair for all fee and then ask user to select
        // [Markup.button.callback("🦄 Uniswap V3", "swapType-uni V3")],
      ])
    );
  },
  async (ctx) => {
    const userId = ctx.from.id;
    var buttons = await settingsHelpers.getPresetButtons(userId);
    ctx.reply(
      "Select a Preset amount to Buy:",
      Markup.inlineKeyboard([...pairChunk(buttons)])
    );
  }
);

manualBuyScene.action("cancelBuy", (ctx) => {
  ctx.reply("❌ Buy Cancelled.");
  ctx.scene.leave();
});

manualBuyScene.action(/^preset/, async (ctx) => {
  const value = ctx.callbackQuery.data.split(":")[1];
  ctx.reply("🔃Fetching Pair.....");
  const pair = await helpers.getPair(
    ctx.session.messages[0],
    client.publicClient,
    ctx.session.swapType
  );
  if (pair === undefined) {
    ctx.reply("❌ Pair not found.",Markup.inlineKeyboard([Markup.button.callback("❌ Cancel Buy", "cancelBuy")]));
    return;
  }
  ctx.reply("✅ Pair found.");
  const wallet = await userActions.getAllUserWallets(ctx.chat.id);
  console.log(wallet)
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
  console.log(ctx.session.swapType)
  if (ctx.session.swapType === "sushi V2") {
    manualBuyer.sushiV2(
      ctx.chat.id,
      ctx.session.messages[0],
      pair,
      value,
      wallet[defaultWalletIndex],
      "Buy"
    );
  } else if (ctx.session.swapType === "uni V2") {
    console.log(ctx.session.swapType)
    manualBuyer.V2(
      ctx.chat.id,
      ctx.session.messages[0],
      pair,
      value,
      wallet[defaultWalletIndex],
      "Buy"
    );
  } else if (ctx.session.swapType === "uni V3") {
    console.log(ctx.session.swapType)
    // manualBuyer.V3(
    //   ctx.chat.id,
    //   ctx.session.messages[0],
    //   pair,
    //   value,
    //   wallet[defaultWalletIndex],
    //   "Buy"
    // );
  }
  ctx.reply("✅ Buy setup complete, We'll buy the token and update you.");
  ctx.scene.leave();
});

manualBuyScene.action(/^swapType/, (ctx) => {
  ctx.session.swapType = ctx.callbackQuery.data.split('-')[1];
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

manualBuyScene.command("cancel", (ctx) => {
  ctx.reply("❌ Cancelled.");
  ctx.scene.leave();
});

module.exports = { manualBuyScene };
