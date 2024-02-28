require("dotenv").config();
const { Telegraf } = require("telegraf");
const getAccount = require("../utils/createAccount");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome"));

bot.command("create", (ctx) => {
    console.log('command received')
    let {account,pk}= getAccount();
    ctx.reply(`Account: ${account} \nPrivate Key: ${pk}`);
});



bot.launch();
