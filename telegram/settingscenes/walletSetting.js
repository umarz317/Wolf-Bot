const { Markup, Scenes } = require("telegraf");
const walletSettingScene = new Scenes.BaseScene('walletSettingScene');

walletSettingScene.enter((ctx) => {
  ctx.reply('Wallet Setting Options:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🔧 Wallet Setup', 'walletSetup')],
      [Markup.button.callback('🔄 Transfer Wallet Setup', 'transferWalletSetup')],
      [Markup.button.callback('🔐 Default Wallet', 'defaultWallet')],
      [Markup.button.callback('🌉 Transfer/Bridge Tokens/ETH', 'transferBridgeTokensETH')],
      [Markup.button.callback('🎯 Default Auto Sniper Wallet', 'defaultAutoSniperWallet')],
      [Markup.button.callback('👛 Default Manual Buyer Wallets', 'defaultManualBuyerWallets')],
      [Markup.button.callback('🗑 Delete Wallet', 'deleteWallet')],
      [Markup.button.callback('🔙 Back', 'backTo:settings')],
      [Markup.button.callback('❌ Close', 'close')],
    ])
  );
});
walletSettingScene.action('walletSetup', (ctx) => {
    ctx.scene.enter("import-wallet");
  });
  
  walletSettingScene.action('transferWalletSetup', (ctx) => {
    ctx.reply('Please enter the transfer wallet setup details:');
    ctx.session.nextAction = 'transferWalletSetup';
  });
  
  walletSettingScene.on('text', async (ctx) => {
    if (ctx.session.nextAction) {
      const userInput = ctx.message.text;
        ctx.reply(`Your input for ${ctx.session.nextAction} has been saved.`);
        ctx.session.nextAction = null;
    }
  });
  
  walletSettingScene.action('backTo:settings', (ctx) => ctx.scene.enter('settings'));
  walletSettingScene.action('close', (ctx) => ctx.deleteMessage());
  
  module.exports = { walletSettingScene };
  