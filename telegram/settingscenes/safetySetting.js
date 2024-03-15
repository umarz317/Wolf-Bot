const { Markup, Scenes } = require("telegraf");
const safetySettingScene = new Scenes.BaseScene('safetySettingScene');
const {onMessage,onSelectingOption} = require("../helpers")

safetySettingScene.enter((ctx) => {
  ctx.reply('Safety Setting Options:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🛡 Buy Tax Limit', 'buyTaxLimit')],
      [Markup.button.callback('💸 Sell Tax Limit', 'sellTaxLimit')],
      [Markup.button.callback('🔀 Slippage', 'slippage')],
      [Markup.button.callback('💧 Min Liquidity Limit', 'minLiquidityLimit')],
      [Markup.button.callback('🌊 Max Liquidity Limit', 'maxLiquidityLimit')],
      [Markup.button.callback('🔙 Back', 'back'),
      Markup.button.callback('❌ Close', 'close')],
    ])
  );
});

const safetySettingsOptions = {
  'buyTaxLimit': { format: '"0"', unit: '%', min: 0, defaultValue: 50 },
  'sellTaxLimit': { format: '"0"', unit: '%', min: 0, defaultValue: 50 },
  'slippage': { format: '"10"', unit: '%', min: 0.01, defaultValue: 15 },
  'minLiquidityLimit': { format: 'USD "0"', unit: '%', min: 5000, defaultValue: '' },
  'maxLiquidityLimit': { format: '"10"', unit: '%', min: '', defaultValue:'' },
};

Object.keys(safetySettingsOptions).forEach(option => {
  safetySettingScene.action(option, async (ctx) => {
    onSelectingOption(ctx,option,safetySettingsOptions)
  });
});

safetySettingScene.on('message', (ctx) => {
  onMessage(ctx,safetySettingsOptions);
});


safetySettingScene.action('back', (ctx) => {ctx.deleteMessage()
  ctx.scene.enter('settings')});
safetySettingScene.action('close', (ctx) => ctx.deleteMessage());

module.exports = { safetySettingScene };
