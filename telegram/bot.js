require("dotenv").config({ override: true });
const { Telegraf, Markup, Scenes, session } = require("telegraf");
const { Stage } = Scenes;
const userActions = require("../utils/userActions");
const bot = new Telegraf(process.env.BOT_TOKEN);
const Moralis = require("moralis").default;
// Wallets and private keys are per user, so only serve private chats.
bot.use((ctx, next) => {
  if (ctx.chat && ctx.chat.type !== "private") return;
  return next();
});
bot.use(session());
// Log handler errors instead of letting them stop polling.
bot.catch((err) => {
  console.log("Bot error:", err);
});
module.exports = { bot }; //important to keep it here
const scenes = require("./scenes/sceneMain");
const helper = require("../utils/helpers");
const tghelper = require("./helpers");

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
  scenes.manualSellScene,
]);
bot.use(stage.middleware());

// Start command
bot.start(async (ctx) => {
  console.log("Chat ID: ", ctx.chat.id);
  ctx.reply(`*🎯 Wolf Bot*\n\n*Trade Faster\\!*\n\n`, {
    parse_mode: "MarkdownV2",
  });
});

bot.action("createWallet", async (ctx) => {
  var res = await userActions.doesUserWalletExist(ctx.from.id);
  if (res) {
    const { address, pk, success } =
      await userActions.generateAndSaveUserWallet(ctx.from.id);
    if (success) {
      ctx.reply(
        `✅ Successfully Created Wallet\n
    \n⚠️ Save your private key\\. If you delete this message\\, you can view it again in the settings\\.\n\n💡 Private key: \`${pk}\` \n\n📝 Address: \n${address}`,
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
  var res = await userActions.doesUserWalletExist(ctx.from.id);
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

bot.command("settings", (ctx) => {
  ctx.scene.enter("settings");
});

bot.command("positions", async (ctx) => {
  ctx.reply("📊 Positions\n\n", { parse_mode: "MarkdownV2" });
  tghelper.positionHelper(ctx);
});

bot.command("menu", (ctx) => {
  console.log("Menu Command...");
  ctx.reply(`*🎯 Wolf Bot*\n\n*Trade Faster\\!*\n\n`, {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback("🎯 Snipe", "snipe"),
        Markup.button.callback("💰 Manual Buy", "manualBuy"),
      ],
      [
        Markup.button.callback("📊 Positions", "positions"),
        Markup.button.callback("🕵️ Copy Trading", "copyTrading"),
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
});

bot.command("wallets", (ctx) => {
  ctx.scene.enter("walletSettingScene");
});

bot.action("copyTrading", (ctx) => {
  ctx.reply("⚠️ Coming Soon!");
});

bot.action("pendingOrders", (ctx) => {
  ctx.reply("⊖ No Pending Orders");
});

bot.action("positions", async (ctx) => {
  ctx.reply("📊 Positions\n\n", { parse_mode: "MarkdownV2" });
  tghelper.positionHelper(ctx);
});

bot.action(/^sellIndex:/, (ctx) => {
  const position =
    ctx.session.positions?.[ctx.callbackQuery.data.split(":")[1]];
  if (!position) {
    ctx.reply("❌ Position expired, Please use /positions again.");
    return;
  }
  ctx.session.sellData = position;
  ctx.scene.enter("manualSell");
});

let running = false;

function start() {
  if (running) return;
  running = true;
  console.log("Bot Started...");
  bot.launch().catch((err) => {
    running = false;
    console.log("Error Launching Bot!", err.message);
    // 409 means another instance is polling; retrying would just conflict again.
    if (err.response?.error_code !== 409) setTimeout(start, 5000);
  });
}

function stop() {
  if (!running) return;
  running = false;
  bot.stop();
  console.log("Bot Stopped...");
}

(() => {
  try {
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  } catch (e) {
    console.log("Error Starting Moralis", e);
  }
})();

module.exports = { start, stop };
