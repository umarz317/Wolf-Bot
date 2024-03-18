const { Markup, Scenes } = require("telegraf");
const { WizardScene } = Scenes;
const walletActions = require("../utils/walletActions");
const helpers = require("../utils/helpers");
const snipe = require("../telegram/sniper");
const event = require("../EventListner/PairCreated");
const { walletSettingScene } = require("./settingscenes/walletSetting")
const { gasSettingScene } = require("./settingscenes/gasSetting")
const { chainSettingScene } = require("./settingscenes/chainSetting")
const { buySettingScene, presetSettingScene } = require("./settingscenes/presetSetting")
const { safetySettingScene } = require("./settingscenes/safetySetting")
const { toggleSettingScene } = require("./settingscenes/toggleSetting")
const importWalletScene = new WizardScene(
  "import-wallet",
  (ctx) => {
    ctx.reply(
      "Please enter your private key 🔑\n\n (Make sure not to share it with anyone!):",
      Markup.inlineKeyboard([Markup.button.callback("Cancel", "cancelImport")])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message) {
      ctx.deleteMessage()
      return ctx.scene.current.leave();
    }
    const pk = ctx.message.text;
    if (!helpers.isValidPrivateKey(pk)) {
      ctx.reply(
        "❌ Invalid private key.\n\n Please make sure to enter a valid private key 🔑:"
      );
      return;
    }
    const res = await walletActions.importWallet(ctx.chat.id, pk);
    if (res.success) {
      ctx.reply("✅ " + res.message);
    } else {
      ctx.reply(
        "❌ " +
        res.message +
        "Please make sure to enter a valid private key 🔑:"
      );
      return;
    }
    return ctx.scene.leave();
  }
);

const snipeScene = new WizardScene(
  "snipe",
  (ctx) => {
    ctx.reply("➡️Enter the token address you want to snipe:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const token = ctx.message.text;
    ctx.reply("🔃Checking address.....");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!helpers.isValidAddress(token)) {
      ctx.reply(
        "❌ Invalid token address.\n\nPlease enter a valid token address:"
      );
      return;
    }
    if (!(await helpers.isERC20(token))) {
      ctx.reply(
        "❌ Invalid token address, the address is not a ERC20 token.\n\nPlease enter a valid token address:"
      );
      return;
    }
    ctx.reply("✅ Token address is valid.");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ctx.session.messages = [token];
    ctx.wizard.next();
    ctx.message.text = null;
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
  },
  (ctx) => {
    ctx.reply("➡️Enter the amount you want to snipe:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const amount = ctx.message.text;
    var tmp = ctx.session.messages
    tmp.push(amount)
    ctx.session.messages = tmp
    if (isNaN(amount)) {
      ctx.reply("❌ Invalid amount.\n\nPlease enter a valid amount:");
      return;
    }
    ctx.reply("✅ Snipe setup complete, We'll snipe the token and update you.");

    const wallet = await walletActions.getAllWallets(ctx.chat.id);
    //test
    snipe.V3(ctx.chat.id, ctx.session.messages[0], "0x441a5e1666229b65c655b323bc5128ba1fd44e59", 500, ctx.session.messages[1], wallet[1]);
    // event.watchPairEvent(ctx.chat.id, ctx.session.messages[0],ctx.session.messages[1], wallet[0]);
    // event.watchPairEventV3(ctx.chat.id, ctx.session.messages[0],ctx.session.messages[1], wallet[0])
    ctx.scene.leave();
  }
);

const settingScene = new Scenes.WizardScene(
  'settings',
  (ctx) => {
    ctx.reply('Select a Setting:',
      Markup.inlineKeyboard([
        [Markup.button.callback("⛽ Gas Setting", "gasSetting"),
        Markup.button.callback("💰 Wallet Setting", "walletSetting")],
        [Markup.button.callback("🔒 Safety Setting", "safetySetting"),
        Markup.button.callback("🔄 Toggle Setting", "toggleSetting")],
        [Markup.button.callback("📋 Preset Setting", "initialPresetSetting"),
        Markup.button.callback("🔗 Chain Setting", "chainSetting")],
        [Markup.button.callback('❌ Close', "close")],
      ]).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if(ctx.callbackQuery){
    const action = ctx.callbackQuery.data;
    ctx.deleteMessage();
    ctx.scene.enter(`${action}Scene`);}
  },
);
settingScene.action('close', (ctx) => {
  ctx.deleteMessage();
  ctx.scene.leave();
});

module.exports = { importWalletScene, snipeScene, settingScene, walletSettingScene, gasSettingScene, chainSettingScene, buySettingScene, presetSettingScene, safetySettingScene, toggleSettingScene };
