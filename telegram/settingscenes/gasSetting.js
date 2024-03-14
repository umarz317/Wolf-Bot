const { Markup, Scenes } = require("telegraf");
const gasSettingScene = new Scenes.BaseScene('gasSettingScene');

gasSettingScene.enter((ctx) => {
  ctx.reply('Gas Setting Options:',
    Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Auto Snipe Tip', 'autoSnipeTip')],
      [Markup.button.callback('🔁 First Bundle Backup Tip', 'firstBundleBackupTip')],
      [Markup.button.callback('💸 Buy Gwei', 'buyGwei')],
      [Markup.button.callback('✅ Approve Gwei', 'approveGwei')],
      [Markup.button.callback('💰 Sell Gwei', 'sellGwei')],
      [Markup.button.callback('🛡 Anti Rug Gwei', 'antiRugGwei')],
      [Markup.button.callback('🔒 Buy Limit Order Gwei', 'buyLimitOrderGwei')],
      [Markup.button.callback('📊 Mempool Gwei Limit', 'mempoolGweiLimit')],
      [Markup.button.callback('🔙 Back', 'back'),
      Markup.button.callback('❌ Close', 'close')],
    ])
  );
});
gasSettingScene.action('back', (ctx) => {
  ctx.deleteMessage()
  ctx.scene.enter('settings')});
gasSettingScene.action('close', (ctx) => ctx.deleteMessage());
module.exports = {gasSettingScene};