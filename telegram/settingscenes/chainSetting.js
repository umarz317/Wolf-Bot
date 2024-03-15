const { Markup, Scenes } = require("telegraf");
const {getSettingValue,updateSetting} = require("../helpers")


const chainSettingScene = new Scenes.BaseScene('chainSettingScene');
chainSettingScene.enter(async (ctx) => {
  const userId = ctx.from.id;
  const chain = await getSettingValue(userId,"chain")
  ctx.session.selectedChains = chain || {};
  ctx.reply('Select blockchains (multiple can be selected):', Markup.inlineKeyboard([
    [Markup.button.callback(`Ethereum ${ctx.session.selectedChains==='ethereum' ? '✅' : ''}`, 'toggle:ethereum')],
    [Markup.button.callback(`BSC ${ctx.session.selectedChains==='bsc' ? '✅' : ''}`, 'toggle:bsc')],
    [Markup.button.callback('🔙 Back', 'back'),
    Markup.button.callback('❌ Close', 'close')],
  ]));
});

chainSettingScene.action(/^toggle:(.+)$/, (ctx) => {
  const selectedChain = ctx.match[1];
  ctx.session.selectedChains = selectedChain;
  ctx.editMessageText('Select chains:', Markup.inlineKeyboard([
    [Markup.button.callback(`Ethereum ${ctx.session.selectedChains==='ethereum' ? '✅' : ''}`, 'toggle:ethereum')],
    [Markup.button.callback(`BSC ${ctx.session.selectedChains==='bsc' ? '✅' : ''}`, 'toggle:bsc')],
    [Markup.button.callback('Done', 'done')],
    [Markup.button.callback('🔙 Back', 'back'),
    Markup.button.callback('❌ Close', 'close')],
  ]
  ));
});

chainSettingScene.action('done', (ctx) => {
  const userId = ctx.from.id;
    updateSetting(userId,"chain",ctx.session.selectedChains);
});

chainSettingScene.action('back', (ctx) => {
    ctx.deleteMessage()
  ctx.scene.enter('settings')
});
chainSettingScene.action('close', (ctx) => ctx.deleteMessage());

module.exports = { chainSettingScene };