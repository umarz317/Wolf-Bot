const { Markup } = require("telegraf");
const userActions = require("../utils/userActions");
const helper = require("../utils/helpers");

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
      const { previousValue } = (await userActions.updateUserSetting(
        userId,
        settingType,
        settingValue
      )) || {};
      ctx.reply(
        `${settingsOptions[settingType].name} Previous Value: ${
          previousValue != null
            ? `${previousValue} ${setting.unit}`
            : setting.defaultValue !== ""
            ? `${setting.defaultValue} ${setting.unit} (default)`
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
  if (value != null)
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

async function getPresetButtons(userId) {
  var defaultValues = ["0.1", "0.2", "0.5", "1", "2", "5"];
  var user = await userActions.getUser(userId);
  let values;
  if (user && user.settings) {
    const setting = user.settings.find((s) => s.name === "buyPresets");
    values = setting ? setting.value : defaultValues;
  } else {
    values = defaultValues;
  }
  const buttons = values.map((value) =>
    Markup.button.callback(`Buy ${value} Eth`, `preset:${value}`)
  );
  return buttons;
}

function escapeMarkdown(text) {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

async function positionHelper(ctx) {
  console.log("Positions action...");
  var wallets = await userActions.getAllUserWallets(ctx.from.id);
  if (!wallets || wallets.length === 0) {
    ctx.reply("❌ No wallets found, Please import/create a wallet first.");
    return;
  }
  // Positions come from the default wallet, which is the one manual sell uses.
  var defaultWalletIndex = await userActions.getUserSettingValue(
    ctx.from.id,
    "defaultWallet"
  );
  var wallet = wallets[defaultWalletIndex] || wallets[0];
  var [messages, positions] = await getPositionMessage(wallet.address);
  if (!positions) {
    ctx.reply("❌ Failed to fetch positions, Please try again later.");
    return;
  }
  ctx.session.positions = positions;
  if (positions.every((position) => position.nativeToken)) {
    ctx.reply("⊖ No Positions");
    return;
  }
  messages.forEach((message, index) => {
    if (positions[index].nativeToken) return;
    ctx.reply(message, {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        Markup.button.callback("💸 Sell", `sellIndex:${index}`),
      ]),
    });
  });
}

async function getPositionMessage(address) {
  var response = await helper.getUserPositions(address);
  if (!response) return [[], null];
  // Keep plain values so session data doesn't depend on Moralis internals.
  var positions = response.result.map((p) => ({
    name: p.name,
    tokenAddress: p.tokenAddress ? p.tokenAddress.checksum : null,
    balanceFormatted: p.balanceFormatted,
    usdValue: p.usdValue,
    nativeToken: p.nativeToken === true,
  }));
  var messages = positions.map(
    (p) =>
      `*Token:* ${escapeMarkdown(p.name)}\n*Amount:* ${escapeMarkdown(
        p.balanceFormatted
      )}\n*USD:* ${escapeMarkdown(p.usdValue ?? "N/A")}\\$\n\n`
  );
  return [messages, positions];
}

module.exports = {
  getPositionMessage,
  onMessage,
  onSelectingOption,
  getPresetButtons,
  positionHelper
};
