require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const getAccount = require("../utils/createAccount");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
    `*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\n`
    ,{parse_mode:'MarkdownV2',...Markup.inlineKeyboard([
        Markup.button.callback("🪪 Create Wallet", "createWallet"),
      ])}
  )
);

bot.action("createWallet", (ctx) => {
  const { address, pk } = getAccount();
  ctx.reply(`✅ Successfully Created Wallet\n
  \n⚠️ Save your private key\\. If you delete this message\\, we will not show you your private key again\\.\n\n💡 Private key: ${pk}\n\n📝 Address: \n${address}`, {
    parse_mode: "MarkdownV2",
  });
});

bot.launch();
