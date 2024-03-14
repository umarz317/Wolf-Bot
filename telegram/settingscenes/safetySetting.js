const { Markup, Scenes } = require("telegraf");
const safetySettingScene = new Scenes.BaseScene('safetySettingScene');

safetySettingScene.enter((ctx) => {
  ctx.reply('Safety Setting Options:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🛡 Buy Tax Limit', 'buyTaxLimit')],
      [Markup.button.callback('💸 Sell Tax Limit', 'sellTaxLimit')],
      [Markup.button.callback('🔀 Slippage', 'slippage')],
      [Markup.button.callback('💧 Min Liquidity Limit', 'minLiquidityLimit')],
      [Markup.button.callback('🌊 Max Liquidity Limit', 'maxLiquidityLimit')],
      [Markup.button.callback('🔙 Back', 'back')],
      [Markup.button.callback('❌ Close', 'close')],
    ])
  );
});

  safetySettingScene.action('buyTaxLimit', (ctx) => {
    ctx.reply('Please enter the value :');
    ctx.session.nextAction = option;  
  });

safetySettingScene.on('text', async (ctx) => {
  if (ctx.session.nextAction) {
    const userInput = ctx.message.text;
    ctx.reply(`set to ${userInput}.`);
    ctx.session.nextAction = null; 
  }
});

safetySettingScene.action('back', (ctx) => {ctx.deleteMessage()
  ctx.scene.enter('settings')});
safetySettingScene.action('close', (ctx) => ctx.deleteMessage());

module.exports = { safetySettingScene };
