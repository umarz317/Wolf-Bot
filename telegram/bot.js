require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const walletActions = require("../utils/WalletActions");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  const res = await walletActions.doesWalletExist(ctx.chat.id);
  console.log(res);
  if (!res) {
    ctx.reply(`*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\n `, {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        Markup.button.callback("🪪 Create Wallet", "createWallet"),
      ]),
    });
  } else {
    ctx.reply(
      `*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\nYou already have a wallet: ${res.address}`,
      {
        parse_mode: "MarkdownV2",
      }
    );
  }
});

bot.action("createWallet", async(ctx) => {
  var res = await walletActions.doesWalletExist(ctx.chat.id);
  if (!res) {
    const { address, pk, success } = walletActions.generateAndSaveWallet(
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
    ctx.reply(`✅ You already have a wallet: ${res.address}`, {
      parse_mode: "MarkdownV2",
    });
  }
});

bot.launch();
