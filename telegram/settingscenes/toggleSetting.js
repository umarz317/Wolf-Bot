const { Markup, Scenes } = require("telegraf");
const toggleSettingScene = new Scenes.BaseScene('toggleSettingScene');

toggleSettingScene.enter((ctx) => {
  ctx.reply('Toggle Setting Options:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🛡 Anti Rug', 'antiRug')],
      [Markup.button.callback('🔄 First Bundle Backup', 'firstBundleBackup')],
      [Markup.button.callback('⛔ Transfer on Blacklist', 'transferOnBlacklist')],
      [Markup.button.callback('🔁 MaxTx or Revert', 'maxTxOrRevert')],
      [Markup.button.callback('🤪 Degen Mode', 'degenMode')],
      [Markup.button.callback('🔙 Back', 'back')],
      [Markup.button.callback('❌ Close', 'close')],
    ])
  );
});


toggleSettingScene.action('back', (ctx) => {
    ctx.deleteMessage()
  ctx.scene.enter('settings')});

toggleSettingScene.action('close', (ctx) => ctx.deleteMessage());

module.exports = { toggleSettingScene };
