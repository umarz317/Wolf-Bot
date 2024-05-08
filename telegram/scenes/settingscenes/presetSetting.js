const { Markup, Scenes } = require("telegraf");
const { getPresetButtons } = require("../../helpers");
const presetSettingScene = new Scenes.BaseScene("initialPresetSettingScene");
const userActions = require("../../../utils/userActions");
const settingName = "buyPresets";

presetSettingScene.enter((ctx) => {
  ctx.reply(
    "Select an Option:",
    Markup.inlineKeyboard([
      [Markup.button.callback("Manual Buy Preset", "manualBuyPreset")],
      [
        Markup.button.callback("🔙 Back", "back"),
        Markup.button.callback("❌ Close", "close"),
      ],
    ])
  );
});

presetSettingScene.action("manualBuyPreset", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("presetSettingScene");
});
presetSettingScene.action("back", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("settings");
});

presetSettingScene.action("close", (ctx) => {
  ctx.deleteMessage();
  return ctx.scene.leave();
});
const buySettingScene = new Scenes.BaseScene("presetSettingScene");

buySettingScene.enter(async (ctx) => {
  const userId = ctx.from.id;
  var buttons = await getPresetButtons(userId)
  ctx.reply(
    "Select a Preset amount to update:",
    Markup.inlineKeyboard([
      ...chunk(buttons, 2),
      [
        Markup.button.callback("🔙 Back", "back"),
        Markup.button.callback("❌ Close", "close"),
      ],
    ])
  );
});

buySettingScene.action(/^preset:(([0-9]*[.])?\d+)$/, async (ctx) => {
  ctx.deleteMessage();
  const selectedValue = ctx.callbackQuery.data.split(":")[1];
  const sentMessage = await ctx.reply(
    `Please enter the new value for the button "Buy ${selectedValue} Eth":`
  );
  const id = sentMessage.message_id;
  ctx.session.botMessageId = id;
  ctx.session.nextAction = settingName + ":" + selectedValue;
});

buySettingScene.on("message", async (ctx) => {
  console.log('hmmmm from preset');
  if (ctx.session.nextAction && ctx.message.text && ctx.session.nextAction) {
    const settingValue = ctx.message.text;
    const userId = ctx.from.id;
    const oldVal = ctx.session.nextAction.split(":")[1]
    const values = (await userActions.getUserSettingValue(userId, settingName))
      ? await userActions.getUserSettingValue(userId, settingName)
      : ['0.1', '0.2', '0.5', '1', '2', '5'];
    ctx.session.userMsgId = ctx.msgId;
    if (
      !isNaN(settingValue) &&
      settingValue > 0 &&
      !values.includes(settingValue)
    ) {
      ctx.deleteMessage(ctx.session.botMessageId);
      ctx.deleteMessage(ctx.session.userMsgId);
      await updateSetting(userId, settingName, values, oldVal, settingValue);
      ctx.session.nextAction = null;
      ctx.session.botMessageId = null;
      ctx.session.userMsgId = null;
      ctx.scene.enter("presetSettingScene");
    } else {
      ctx.deleteMessage(ctx.session.botMessageId);
      ctx.deleteMessage(ctx.session.userMsgId);
      const message = await ctx.reply(`Invalid input!Please enter again.`);
      ctx.session.botMessageId = message.message_id;
    }
  } else {
    ctx.deleteMessage(ctx.msgId);
  }
});

buySettingScene.action("back", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.leave()
  ctx.scene.enter("initialPresetSettingScene");
});

buySettingScene.action("close", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.leave()
});

async function updateSetting(userId, settingName, values, oldVal,newValue) {
  try {
    var index = values.indexOf(oldVal)
    values[index] = newValue
    values.sort((a, b) => {return parseFloat(a) - parseFloat(b)});
    userActions.updateUserSetting(userId, settingName, values);
    console.log("Setting updated for user");
  } catch (error) {
    console.error("Error updating setting:", error);
  }
}

module.exports = { buySettingScene, presetSettingScene };

function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}
