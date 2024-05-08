const { Markup, Scenes } = require("telegraf");
const userActions = require("../../../utils/userActions");
const chainSettingScene = new Scenes.BaseScene("chainSettingScene");
chainSettingScene.enter(async (ctx) => {
  const userId = ctx.from.id;
  const chain = await userActions.getUserSettingValue(userId, "chain");
  ctx.session.selectedChains = chain || {};
  ctx.reply(
    "Select blockchains :",
    // TODO: Setup config and add chain in config
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `Base ${ctx.session.selectedChains === "Base" ? "✅" : ""}`,
          "toggle:base"
        ),
      ],
      // [
      //   Markup.button.callback(
      //     `BSC ${ctx.session.selectedChains === "bsc" ? "✅" : ""}`,
      //     "toggle:bsc"
      //   ),
      // ],
      [
        Markup.button.callback("🔙 Back", "back"),
        Markup.button.callback("❌ Close", "close"),
      ],
    ])
  );
});

chainSettingScene.action(/^toggle:(.+)$/, (ctx) => {
  const selectedChain = ctx.match[1];
  ctx.session.selectedChains = selectedChain;
  ctx.editMessageText(
    "Select chains:",
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `Base ${ctx.session.selectedChains === "base" ? "✅" : ""}`,
          "toggle:base"
        ),
      ],
      // [
      //   Markup.button.callback(
      //     `BSC ${ctx.session.selectedChains === "bsc" ? "✅" : ""}`,
      //     "toggle:bsc"
      //   ),
      // ],
      [Markup.button.callback("Done", "done")],
      [
        Markup.button.callback("🔙 Back", "back"),
        Markup.button.callback("❌ Close", "close"),
      ],
    ])
  );
});

chainSettingScene.action("done", (ctx) => {
  const userId = ctx.from.id;
  userActions.updateUserSetting(userId, "chain", ctx.session.selectedChains);
});

chainSettingScene.action("back", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("settings");
});
chainSettingScene.action("close", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.leave()
});

module.exports = { chainSettingScene };
