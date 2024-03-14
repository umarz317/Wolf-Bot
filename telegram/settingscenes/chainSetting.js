const { Markup, Scenes } = require("telegraf");
const chainSettingScene = new Scenes.BaseScene('chainSettingScene');

chainSettingScene.enter((ctx) => {
  ctx.session.selectedChains = ctx.session.selectedChains || {};
  ctx.reply('Select blockchains (multiple can be selected):', Markup.inlineKeyboard([
    [Markup.button.callback(`Ethereum ${ctx.session.selectedChains['ethereum'] ? '✅' : ''}`, 'toggle:ethereum')],
    [Markup.button.callback(`BSC ${ctx.session.selectedChains['bsc'] ? '✅' : ''}`, 'toggle:bsc')],
    [Markup.button.callback('Done', 'done')],
    [Markup.button.callback('🔙 Back', 'back'),
    Markup.button.callback('❌ Close', 'close')],
  ]));
});

chainSettingScene.action(/^toggle:(.+)$/, (ctx) => {
  const selectedChain = ctx.match[1];
  ctx.session.selectedChains[selectedChain] = !ctx.session.selectedChains[selectedChain];
  ctx.editMessageText('Select chains:', Markup.inlineKeyboard([
    [Markup.button.callback(`Ethereum ${ctx.session.selectedChains['ethereum'] ? '✅' : ''}`, 'toggle:ethereum')],
    [Markup.button.callback(`BSC ${ctx.session.selectedChains['bsc'] ? '✅' : ''}`, 'toggle:bsc')],
    [Markup.button.callback('Done', 'done')],
    [Markup.button.callback('🔙 Back', 'back'),
    Markup.button.callback('❌ Close', 'close')],
  ]
  ));
});

chainSettingScene.action('done', (ctx) => {
  const selectedChains = Object.entries(ctx.session.selectedChains)
                                .filter(([chain, isSelected]) => isSelected)
                                .map(([chain]) => chain)
                                .join(', ');

  ctx.reply(`You have selected: ${selectedChains || 'None'}`);
  ctx.session.selectedChains = {};  
  ctx.scene.leave();
});

chainSettingScene.action('back', (ctx) => {
    ctx.deleteMessage()
  ctx.scene.enter('settings')
});
chainSettingScene.action('close', (ctx) => ctx.deleteMessage());

module.exports = { chainSettingScene };