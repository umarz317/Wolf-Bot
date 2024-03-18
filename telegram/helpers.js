const Wallet = require("../models/wallet");

async function updateSetting(userId, settingName, settingValue) {
    try {
      let previousValue
      let user = await Wallet.findOne({ id: userId });
      if (!user) {
        user = new Wallet({
          userId: userId,
          settings: [{ name: settingName, value: settingValue }],
        });
      } else {
        const existingSetting = user.settings.findIndex(s => s.name === settingName);
        if (existingSetting !== -1) {
          previousValue = user.settings[existingSetting].value
          user.settings[existingSetting].value = settingValue;
        } else {
          user.settings.push({ name: settingName, value: settingValue });
        }
      }
      await user.save();
      console.log("Setting updated for user");
      return { previousValue: previousValue }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }
  async function getSettingValue(userId, settingName) {
    try {
      const user = await Wallet.findOne({ id: userId });
      if (!user) {
        return null;
      }
      const setting = user.settings.find(s => s.name === settingName);
      if (!setting) {
        return null;
      }
      return setting.value;
    } catch (error) {
      return null;
    }
  }

  async function onMessage(ctx,settingsOptions){
    if (ctx.session.nextAction && ctx.message.text && ctx.session.nextAction) {
      const settingValue = parseFloat(ctx.message.text);
      ctx.session.userMsgId = ctx.msgId;
      const setting = settingsOptions[ctx.session.nextAction];
      if (!isNaN(settingValue) && settingValue >= setting.min) {
        const settingType = ctx.session.nextAction;
        const userId = ctx.from.id;
        ctx.deleteMessage(ctx.session.botMessageId)
        ctx.deleteMessage(ctx.session.userMsgId)
        const { previousValue } = await updateSetting(userId, settingType, settingValue);
        ctx.reply(`${settingsOptions[settingType].name} Previous Value: ${previousValue?previousValue:setting.defaultValue+" "+setting.unit?setting.defaultValue:"Not Set"}.\nNew Value: ${settingValue} ${setting.unit}.`);
        ctx.session.nextAction = null;
        ctx.session.botMessageId = null;
        ctx.session.userMsgId = null;
      } else {
        ctx.deleteMessage(ctx.session.botMessageId)
        ctx.deleteMessage(ctx.session.userMsgId)
        const message = await ctx.reply(`Invalid input. Please enter a value atleat ${setting.min}.`);
        ctx.session.botMessageId = message. message_id;
      }
    }
    else {
      ctx.deleteMessage(ctx.msgId)
    }
  }
  async function onSelectingOption(ctx,option,settingsOptions){
    let sentMessage
    const value = await getSettingValue(ctx.from.id, option);
    if (value)
      sentMessage = await ctx.reply(`Current value: ${value}.\nEnter the value for ${settingsOptions[option].name} in format: ${settingsOptions[option].format}.`);
    else
      sentMessage = await ctx.reply(`Current value:${settingsOptions[option].defaultValue}. \nEnter the value for ${settingsOptions[option].name} in format: ${settingsOptions[option].format}.`);
    const id = sentMessage.message_id;
    ctx.session.botMessageId = id;
    ctx.session.nextAction = option;
  }
  
  module.exports = {getSettingValue,updateSetting,onMessage,onSelectingOption};