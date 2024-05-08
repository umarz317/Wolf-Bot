const { Markup, Scenes } = require("telegraf");
const { onMessage, onSelectingOption } = require("../../helpers");

const gasSettingScene = new Scenes.BaseScene("gasSettingScene");
gasSettingScene.enter((ctx) => {
  ctx.reply(
    "Gas Setting Options:",
    Markup.inlineKeyboard([
      [Markup.button.callback("⚡ Auto Snipe Tip", "autoSnipeTip")],
      // [Markup.button.callback('🔁 First Bundle Backup Tip', 'firstBundleBackupTip')],
      [Markup.button.callback("💸 Manual Buy Gwei", "buyGwei")],
      // [Markup.button.callback('✅ Approve Gwei', 'approveGwei')],
      // [Markup.button.callback('💰 Sell Gwei', 'sellGwei')],
      // [Markup.button.callback('🛡 Anti Rug Gwei', 'antiRugGwei')],
      // [Markup.button.callback('🔒 Buy Limit Order Gwei', 'buyLimitOrderGwei')],
      // [Markup.button.callback('📊 Mempool Gwei Limit', 'mempoolGweiLimit')],
      [
        Markup.button.callback("🔙 Back", "back"),
        Markup.button.callback("❌ Close", "close"),
      ],
    ])
  );
});

const gasSettingsOptions = {
  autoSnipeTip: {
    format: '"0.1"',
    unit: "ETH",
    min: 0.001,
    defaultValue: 0.01,
    name: "Auto Snipe Tip",
  },
  firstBundleBackupTip: {
    format: '"0.1"',
    unit: "ETH",
    min: 0.001,
    defaultValue: 0.01,
    name: "First Bundle Backup Tip",
  },
  buyGwei: {
    format: '"10"',
    unit: "Gwei",
    min: 1,
    defaultValue: 15,
    name: "Buy Gwei",
  },
  approveGwei: {
    format: '"10"',
    unit: "Gwei",
    min: 5,
    defaultValue: 10,
    name: "Approve Gwei",
  },
  sellGwei: {
    format: '"10"',
    unit: "Gwei",
    min: 1,
    defaultValue: 15,
    name: "Sell Gwei",
  },
  antiRugGwei: {
    format: '"10"',
    unit: "Gwei",
    min: 10,
    defaultValue: 0,
    name: "Anti Rug Gwei",
  },
  gasLimit: {
    format: '"300000"',
    unit: "",
    min: 3000000,
    defaultValue: 3000000,
    name: "Gas Limit",
  },
  buyLimitOrderGwei: {
    format: '"10"',
    unit: "Gwei",
    min: 0,
    defaultValue: 10,
    name: "Buy Limit Order Gwei",
  },
  mempoolGweiLimit: {
    format: '"10"',
    unit: "Gwei",
    min: 0,
    defaultValue: 0,
    name: "Mempool Gwei Limit",
  },
};

Object.keys(gasSettingsOptions).forEach((option) => {
  gasSettingScene.action(option, async (ctx) => {
    onSelectingOption(ctx, option, gasSettingsOptions);
  });
});

gasSettingScene.on("message", (ctx) => {
  onMessage(ctx, gasSettingsOptions);
});

gasSettingScene.action("back", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("settings");
});
gasSettingScene.action("close", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.leave();
});

module.exports = { gasSettingScene };
