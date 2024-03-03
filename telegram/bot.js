require("dotenv").config();
const { Telegraf, Markup, Scenes, session } = require("telegraf");
const { Stage } = Scenes;
const walletActions = require("../utils/walletActions");
const bot = new Telegraf(process.env.BOT_TOKEN);
console.log("bot....start");
bot.use(session());
module.exports = { bot }; //important to keep it here
const scenes = require("./scenes");
const stage = new Stage([scenes.importWalletScene, scenes.snipeScene]);
bot.use(stage.middleware());

// Start command
bot.start(async (ctx) => {
  const res = await walletActions.doesWalletExist(ctx.chat.id);
  if (res) {
    ctx.reply(`*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\n`, {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        Markup.button.callback("🪪 Create Wallet", "createWallet"),
        Markup.button.callback("🔑 Import Existing Wallet", "importWallet"),
        Markup.button.callback("🎯 Snipe", "snipe"),
      ]),
    });
  } else {
    ctx.reply(
      `*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\nYou have reached wallet creation limit`,
      {
        parse_mode: "MarkdownV2",
      }
    );
  }
});

// Handle 'createWallet' action
bot.action("createWallet", async (ctx) => {
  var res = await walletActions.doesWalletExist(ctx.chat.id);
  if (res) {
    const { address, pk, success } = await walletActions.generateAndSaveWallet(
      ctx.chat.id
    );
    if (success) {
      ctx.reply(
        `✅ Successfully Created Wallet\n
    \n⚠️ Save your private key\\. If you delete this message\\, we will not show you your private key again\\.\n\n💡 Private key: ${pk}\n\n📝 Address: \n${address}`,
        {
          parse_mode: "MarkdownV2",
        }
      );
    } else {
      ctx.reply(`❌ Wallet Creation Failed\n\nPlease try again later`, {
        parse_mode: "MarkdownV2",
      });
    }
  } else {
    ctx.reply(`✅ You have reached wallet creation limit`, {
      parse_mode: "MarkdownV2",
    });
  }
});

// Handle 'importWallet' action
bot.action("importWallet", async (ctx) => {
  var res = await walletActions.doesWalletExist(ctx.chat.id);
  if (res) {
    ctx.scene.enter("import-wallet");
  } else {
    ctx.reply(`✅ You have reached wallet creation limit`, {
      parse_mode: "MarkdownV2",
    });
  }
});

bot.action("snipe", async (ctx) => {
  console.log("snipe.....");
  ctx.scene.enter("snipe");
});

bot.action("cancelImport", (ctx) => {
  ctx.reply(
    "Operation canceled. Feel free to start over or use other commands."
  );
  return ctx.scene.leave();
});

bot.launch();
