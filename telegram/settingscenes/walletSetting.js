const { Markup, Scenes } = require("telegraf");
const Wallet = require("../../models/wallet");
const walletSettingScene = new Scenes.BaseScene('walletSettingScene');
const {getSettingValue,updateSetting} = require("../helpers")
walletSettingScene.enter((ctx) => {
  ctx.reply('Wallet Setting Options:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🔧 Wallet Setup', 'walletSetup')],
      [Markup.button.callback('🔐 Default Wallet', 'defaultWallet')],
      [Markup.button.callback('🌉 Transfer/Bridge Tokens/ETH', 'transferBridgeTokensETH')],
      [Markup.button.callback('🎯 Default Auto Sniper Wallet', 'defaultAutoSniperWallet')],
      [Markup.button.callback('👛 Default Manual Buyer Wallets', 'defaultManualBuyerWallets')],
      [Markup.button.callback('🗑 Delete Wallet', 'deleteWallet')],
      [Markup.button.callback('🔙 Back', 'back'),
      Markup.button.callback('❌ Close', 'close')],
    ])
  );
});
  walletSettingScene.action('walletSetup', (ctx) => {
    ctx.reply("Wallet Setup", {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("🪪 Create Wallet", "createWallet")],
        [Markup.button.callback("🔑 Import Existing Wallet", "importWallet")],
        [Markup.button.callback('🔙 Back', 'backToWaletSetting'),
        Markup.button.callback('❌ Close', 'close')],
      ]),
    });
  });
  
  walletSettingScene.action('deleteWallet', async (ctx) => {
    ctx.deleteMessage()
    const userId = ctx.from.id;
    const userWallets = await Wallet.findOne({ id: userId });
    if (userWallets && userWallets.wallets.length > 0) {
      const walletButtons = userWallets.wallets.map((wallet, index) => [
        Markup.button.callback(wallet.address, `confirmDelete:${index}`)
      ]);
      ctx.reply('Select a wallet to delete:', Markup.inlineKeyboard(
        [...walletButtons,
        [Markup.button.callback('🔙 Back', 'back'),
        Markup.button.callback('❌ Close', 'close')],]));
    } else {
      ctx.reply('No wallets found.');
    }
  });
  
  walletSettingScene.action(/^confirmDelete:(\d+)$/, async (ctx) => {
    const walletIdToDelete  = parseInt(ctx.match[1]);
    ctx.session.walletIndex =  ctx.session.walletIndex===walletIdToDelete?-1:walletIdToDelete;
    const userId = ctx.from.id;
    const userWallets = await Wallet.findOne({ id: userId });
    try {
      if (userWallets && userWallets.wallets.length > 0) {
        const updatedButtons = userWallets.wallets.map((wallet,index) => 
          [Markup.button.callback(index === ctx.session.walletIndex ? `✅ ${wallet.address}` : wallet.address,`confirmDelete:${index}`)]
        );
        const confirmButton = Markup.button.callback('Confirm Delete', `delete:${walletIdToDelete}`);
        ctx.editMessageText('Select a wallet to delete:', Markup.inlineKeyboard([...updatedButtons,ctx.session.walletIndex!==-1?[confirmButton]:[],
           [Markup.button.callback('🔙 Back', 'deleteWallet'),
           Markup.button.callback('❌ Close', 'close')]],));
      }
    } catch (error) {
      console.log(error)
    }
  });
  walletSettingScene.action(/^delete:(\d+)$/, async (ctx) => {
    ctx.deleteMessage()
    const indexToDelete = parseInt(ctx.match[1]);
    const userId = ctx.from.id;
    const user = await Wallet.findOne({ id: userId });
    user.wallets.splice(indexToDelete, 1);
    await user.save();
    ctx.reply('Wallet deleted successfully.');
  });

  const walletOptions = ['defaultWallet', 'defaultAutoSniperWallet', 'defaultManualBuyerWallets'];

walletOptions.forEach(setting => {
  walletSettingScene.action(setting, async (ctx) => {
    ctx.deleteMessage()
    const userId = ctx.from.id;
    const fromDb = await getSettingValue(userId,setting)
    ctx.session.walletsetting =fromDb
    const userWallets = await Wallet.findOne({ id: userId });
    if (userWallets && userWallets.wallets.length > 0) {
      const walletButtons = userWallets.wallets.map((wallet, index) =>
        [Markup.button.callback(index === ctx.session.walletsetting ? `✅ ${wallet.address}` : wallet.address, `${setting}:${index}`)]
      );
      ctx.reply(`Select a wallet for ${setting}:`, Markup.inlineKeyboard(
        [...walletButtons,
        [Markup.button.callback('🔙 Back', 'backToWaletSetting'),
        Markup.button.callback('❌ Close', 'close')]
      ]));
    } else {
      ctx.reply('No wallets found.');
    }
  });
});
walletOptions.forEach(setting => {
  walletSettingScene.action(new RegExp(`^${setting}:(\\d+)$`), async (ctx) => {
      const walletIndex  = parseInt(ctx.match[1]);
      ctx.session.walletsetting =  ctx.session.walletsetting===walletIndex?-1:walletIndex;
      const userId = ctx.from.id;
      updateSetting(userId,setting,walletIndex)
      const userWallets = await Wallet.findOne({ id: userId });
      try {
        if (userWallets && userWallets.wallets.length > 0) {
          const updatedButtons = userWallets.wallets.map((wallet,index) => 
            [Markup.button.callback(index === ctx.session.walletsetting ? `✅ ${wallet.address}` : wallet.address,`${setting}:${index}`)]
          );
          ctx.editMessageText('Select a wallet:', Markup.inlineKeyboard([...updatedButtons,
             [Markup.button.callback('🔙 Back', 'backToWaletSetting'),
             Markup.button.callback('❌ Close', 'close')]],));
        }
      } catch (error) {
        console.log(error)
      }
  });
});



  walletSettingScene.action('backToWaletSetting', (ctx) =>{ctx.deleteMessage()
    ctx.scene.enter('walletSettingScene')});
  walletSettingScene.action('back', (ctx) =>{ctx.deleteMessage()
     ctx.scene.enter('settings')});
  walletSettingScene.action('close', (ctx) => ctx.deleteMessage());
  
  module.exports = { walletSettingScene };
  