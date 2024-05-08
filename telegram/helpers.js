const { Markup } = require("telegraf");
const userActions = require('../utils/userActions');  

async function onMessage(ctx, settingsOptions) {
  if (ctx.session.nextAction && ctx.message.text && ctx.session.nextAction) {
    const settingValue = parseFloat(ctx.message.text);
    ctx.session.userMsgId = ctx.msgId;
    const setting = settingsOptions[ctx.session.nextAction];
    if (!isNaN(settingValue) && settingValue >= setting.min) {
      const settingType = ctx.session.nextAction;
      const userId = ctx.from.id;
      ctx.deleteMessage(ctx.session.botMessageId);
      ctx.deleteMessage(ctx.session.userMsgId);
      const { previousValue } = await userActions.updateUserSetting(
        userId,
        settingType,
        settingValue
      );
      ctx.reply(
        `${settingsOptions[settingType].name} Previous Value: ${
          previousValue
            ? previousValue
            : setting.defaultValue + " " + setting.unit
            ? setting.defaultValue
            : "Not Set"
        }.\nNew Value: ${settingValue} ${setting.unit}.`
      );
      ctx.session.nextAction = null;
      ctx.session.botMessageId = null;
      ctx.session.userMsgId = null;
    } else {
      ctx.deleteMessage(ctx.session.botMessageId);
      ctx.deleteMessage(ctx.session.userMsgId);
      const message = await ctx.reply(
        `Invalid input. Please enter a value atleat ${setting.min}.`
      );
      ctx.session.botMessageId = message.message_id;
    }
  } else {
    ctx.deleteMessage(ctx.msgId);
  }
}
async function onSelectingOption(ctx, option, settingsOptions) {
  let sentMessage;
  const value = await userActions.getUserSettingValue(ctx.from.id, option);
  if (value)
    sentMessage = await ctx.reply(
      `Current value: ${value}.\nEnter the value for ${settingsOptions[option].name} in format: ${settingsOptions[option].format}.`
    );
  else
    sentMessage = await ctx.reply(
      `Current value:${settingsOptions[option].defaultValue}. \nEnter the value for ${settingsOptions[option].name} in format: ${settingsOptions[option].format}.`
    );
  const id = sentMessage.message_id;
  ctx.session.botMessageId = id;
  ctx.session.nextAction = option;
}

async function getPresetButtons(userId){
  var defaultValues = ["0.1", "0.2", "0.5", "1", "2", "5"];
  var user = await userActions.getUser(userId)
  let values;
  if (user && user.settings) {
    const setting = user.settings.find((s) => s.name === 'buyPresets');
    values = setting ? setting.value : defaultValues;
  } else {
    values = defaultValues;
  }
  const buttons = values.map((value) =>
    Markup.button.callback(`Buy ${value} Eth`, `preset:${value}`)
  );
  return buttons
}

async function getPositionMessage(chatID){
  var wallets = await userActions.getAllUserWallets(chatID);
  var positions = await helper.getUserPositions(wallets[0].address);
  var message = "Positions:\n\n";
  for (var i = 0; i < positions.result.length; i++) {
    message += `Token: ${positions.result[i].name}\nAmount: ${positions.result[i].balanceFormatted}\n\n`;
  }
  return message;
}


module.exports = {
  getPositionMessage,
  onMessage,
  onSelectingOption,
  getPresetButtons
};
