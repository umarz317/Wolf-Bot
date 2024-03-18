const { Markup, Scenes } = require("telegraf");
const Wallet = require("../../models/wallet");
const {getSettingValue} = require("../helpers")
const presetSettingScene = new Scenes.BaseScene('initialPresetSettingScene');

const defaultValues = ['0.1', '0.2', '0.5', '1', '2', '5'];
const settingName = 'buyPresets';
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

buySettingScene.enter(async (ctx) => {
    const userId = ctx.from.id;
    let user = await Wallet.findOne({ id: userId });
    let values;
    if (user && user.settings) {
        const setting = user.settings.find(s => s.name === settingName);
        values = setting ? setting.value : defaultValues;
    } else {
        values = defaultValues
    }
    const buttons = values.map((value, index) =>
        Markup.button.callback(`Buy ${value} Eth`, `preset:${index}`)
    );
    ctx.reply('Select a Preset amount to update:',
        Markup.inlineKeyboard([
            ...chunk(buttons, 2), 
            [Markup.button.callback('🔙 Back', 'back'), Markup.button.callback('❌ Close', 'close')],
        ])
    );
});

buySettingScene.action(/^preset:(\d+)$/, async (ctx) => {
    ctx.deleteMessage()
    const index  = parseInt(ctx.match[1]);
    const userId = ctx.from.id;
    const value = await getSettingValue(userId,settingName)?await getSettingValue(userId,settingName):defaultValues
    const sentMessage = await ctx.reply(`Please enter the new value for the button "Buy ${value[index]} Eth":`);
    const id = sentMessage.message_id;
    ctx.session.botMessageId = id;
    ctx.session.nextAction = settingName+":"+index;
  });

buySettingScene.on('message', async (ctx) => {
    if (ctx.session.nextAction && ctx.message.text && ctx.session.nextAction) {
        const settingValue = (ctx.message.text);
        const userId = ctx.from.id;
        const index  = parseInt(ctx.session.nextAction.split(":")[1]);
        const values = await getSettingValue(userId,settingName)?await getSettingValue(userId,settingName):defaultValues;
        ctx.session.userMsgId = ctx.msgId;
        if (!isNaN(settingValue) && settingValue>0  && !values.includes(settingValue)) {
          ctx.deleteMessage(ctx.session.botMessageId)
          ctx.deleteMessage(ctx.session.userMsgId)
          await updateSetting(userId, settingName, settingValue,index);
          ctx.session.nextAction = null;
          ctx.session.botMessageId = null;
          ctx.session.userMsgId = null;
          ctx.scene.enter('presetSettingScene');
        } else {
          ctx.deleteMessage(ctx.session.botMessageId)
          ctx.deleteMessage(ctx.session.userMsgId)
          const message = await ctx.reply(`Invalid input!Please enter again.`);
          ctx.session.botMessageId = message. message_id;
        }
      }
      else {
        ctx.deleteMessage(ctx.msgId)
      }
    
  });
 
buySettingScene.action('back', (ctx) => {
    ctx.deleteMessage()
    ctx.scene.enter('initialPresetSettingScene');
});

buySettingScene.action('close', (ctx) => {
    ctx.deleteMessage();
});

async function updateSetting(userId, settingName, settingValue, index) {
    try {
        let user = await Wallet.findOne({ id: userId });
        if (!user) {
            let settingsArray = [...defaultValues];
            settingsArray[index] = settingValue;
            user = new Wallet({
                userId: userId,
                settings: [{ name: settingName, value: settingsArray }],
            });
        } else {
            const settingIndex = user.settings.findIndex(s => s.name === settingName);
            if (settingIndex !== -1) {
                let settingsArray = [...user.settings[settingIndex].value];
                settingsArray[index] = settingValue;
                settingsArray.sort((a, b) => parseFloat(a) - parseFloat(b));
                user.settings[settingIndex].value = settingsArray;
            } else {
                let settingsArray = [...defaultValues];
                settingsArray[index] = settingValue;
                user.settings.push({ name: settingName, value: settingsArray });
            }
        }
        await user.save();
        console.log("Setting updated for user");
    } catch (error) {
        console.error('Error updating setting:', error);
    }
}

module.exports = { buySettingScene, presetSettingScene };

function chunk(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
}
