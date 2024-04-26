require("dotenv").config();
const { Telegraf, Markup, Scenes, session } = require("telegraf");
const { Stage } = Scenes;
const userActions = require("../utils/userActions");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
module.exports = { bot }; //important to keep it here
const scenes = require("./scenes/sceneMain");

const stage = new Stage([
  scenes.importWalletScene,
  scenes.snipeScene,
  scenes.settingScene,
  scenes.walletSettingScene,
  scenes.chainSettingScene,
  scenes.gasSettingScene,
  scenes.buySettingScene,
  scenes.toggleSettingScene,
  scenes.safetySettingScene,
  scenes.presetSettingScene,
  scenes.manualBuyScene,
]);
bot.use(stage.middleware());

// Start command
bot.start(async (ctx) => {
  console.log("Chat ID: ", ctx.chat.id);
  ctx.reply(`*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\n`)
});

bot.action("createWallet", async (ctx) => {
  var res = await userActions.doesUserWalletExist(ctx.chat.id);
  if (res) {
    const { address, pk, success } = await userActions.generateAndSaveUserWallet(
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
  var res = await userActions.doesUserWalletExist(ctx.chat.id);
  if (res) {
    ctx.scene.enter("import-wallet");
  } else {
    ctx.reply(`✅ You have reached wallet creation limit`, {
      parse_mode: "MarkdownV2",
    });
  }
});

bot.action("settings", async (ctx) => {
  ctx.scene.enter("settings");
});

bot.action("snipe", async (ctx) => {
  console.log("snipe.....");
  ctx.scene.enter("snipe");
});

bot.action("manualBuy", async (ctx) => {
  ctx.scene.enter("manualBuy");
});

bot.action("cancelImport", (ctx) => {
  ctx.deleteMessage();
  return ctx.scene.leave();
});

bot.command('settings',(ctx)=>{
  ctx.scene.enter("settings");
})

bot.command('positions',(ctx)=>{
  ctx.reply("⊖ No Positions Yet")
})



bot.command("menu", (ctx) => {
  ctx.reply(`*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\n`, {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback("🎯 Snipe", "snipe"),
        Markup.button.callback("💰 Manual Buy", "manualBuy"),
      ],
      [
        Markup.button.callback("📊 Positions", "postions"),
        Markup.button.callback("🕵️ Copy Trading", "manualBuy"),
      ],
      [
        Markup.button.callback("🕣 Pending Orders", "pendingOrders"),
        Markup.button.callback("⚙️ Settings", "settings"),
      ],
      [
        Markup.button.callback("💲 Refer & Earn", "snipe"),
        Markup.button.callback("🔠 Languages", "manualBuy"),
      ],
    ]),
  });
})

bot.command("wallets",(ctx)=>{
  ctx.scene.enter("walletSettingScene");
})

bot.action("pendingOrders",(ctx)=>{
  ctx.reply("⊖ No Pending Orders")
})

bot.action("positions",(ctx)=>{
  ctx.reply("⊖ No Positions Yet")
})

function start() {
  try {
    bot.launch();
    console.log("Bot Started...")
  } catch {
    console.log("Error Launching Bot!");
  }
}

function stop(){
  bot.stop();
  console.log("Bot Stopped...");
}

module.exports = { start,stop };
