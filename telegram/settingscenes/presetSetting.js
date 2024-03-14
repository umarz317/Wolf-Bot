const { Markup, Scenes } = require("telegraf");
const presetSettingScene = new Scenes.BaseScene('initialPresetSettingScene');

presetSettingScene.enter((ctx) => {
    ctx.reply('Select an Option:',
        Markup.inlineKeyboard([
            [Markup.button.callback('Manual Buy Preset', 'manualBuyPreset')],
            [Markup.button.callback('🔙 Back', 'back'),
            Markup.button.callback('❌ Close', 'close')],
        ])
    );
});

presetSettingScene.action('manualBuyPreset', (ctx) => {
    ctx.deleteMessage();
    ctx.scene.enter('presetSettingScene');
});
presetSettingScene.action('back', (ctx) => {
    ctx.deleteMessage()
    ctx.scene.enter('settings')
});

presetSettingScene.action('close', (ctx) => {
    ctx.deleteMessage();
});
const buySettingScene = new Scenes.BaseScene('presetSettingScene');

buySettingScene.enter((ctx) => {
    ctx.reply('Select a Preset Amount to Send:',
        Markup.inlineKeyboard([
            [Markup.button.callback('0.1 ETH', 'preset:0.1')],
            [Markup.button.callback('0.2 ETH', 'preset:0.2')],
            [Markup.button.callback('0.5 ETH', 'preset:0.5')],
            [Markup.button.callback('1 ETH', 'preset:1')],
            [Markup.button.callback('2 ETH', 'preset:2')],
            [Markup.button.callback('5 ETH', 'preset:5')],
            [Markup.button.callback('🔙 Back', 'back'),
            Markup.button.callback('❌ Close', 'close')],
        ])
    );
});

buySettingScene.action('back', (ctx) => {
    ctx.deleteMessage()
    ctx.scene.enter('initialPresetSettingScene');
});

buySettingScene.action('close', (ctx) => {
    ctx.deleteMessage();
});

module.exports = { buySettingScene, presetSettingScene };

