require("dotenv").config();
const { Telegraf, Markup, Scenes, session } = require("telegraf");
const { WizardScene, Stage } = Scenes; // Ensure Stage is also imported
const walletActions = require("../utils/walletActions");
const { privateKeyToAddress } = require("viem/accounts");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Define the 'import-wallet' WizardScene
const importWalletScene = new WizardScene(
  "import-wallet",
  // (ctx) => {
  //   ctx.reply('Please enter wallet name:');
  //   return ctx.wizard.next();
  // },
  (ctx) => {
    //ctx.wizard.state.name = ctx.message.text;
    ctx.reply('Please enter your private key 🔑\n\n (Make sure not to share it with anyone!):',
      Markup.inlineKeyboard([
        Markup.button.callback('Cancel', 'cancelImport')
      ]));
    return ctx.wizard.next();
  },
  async (ctx) => {
    function isValidPrivateKey(pk) {
      if (pk.startsWith("0x")) {
        pk = pk.substring(2);
      }
      try {
        new privateKeyToAddress(pk);
        return true;
      } catch (error) {
        return false;
      }
    }

    if (!ctx.message) {
      ctx.reply('Operation canceled. Feel free to start over or use other commands.');
      return ctx.scene.leave()
    };
    const pk = ctx.message.text;
    if (!isValidPrivateKey(pk)) {
      ctx.reply('❌ Invalid private key.\n\n Please make sure to enter a valid private key 🔑:');
      return;
    }
    //const res = await walletActions.importWallet(ctx.chat.id, ctx.wizard.state.name, pk);
    const res = await walletActions.importWallet(ctx.chat.id, pk);
    if (res.success) {
      ctx.reply('✅ ' + res.message);
    } else {
      ctx.reply('❌ ' + res.message + "Please make sure to enter a valid private key 🔑:");
      return;
    }
    return ctx.scene.leave();
  }
);

const stage = new Stage([importWalletScene]);
bot.use(session());
bot.use(stage.middleware());

// Start command
bot.start(async (ctx) => {
  const res = await walletActions.doesWalletExist(ctx.chat.id);
  console.log(res);
  if (res) {
    ctx.reply(`*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\n`, {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        Markup.button.callback("🪪 Create Wallet", "createWallet"),
        Markup.button.callback("🔑 Import Existing Wallet", "importWallet")
      ]),
    });
  } else {
    ctx.reply(
      `*🎯 Diablo Bot*\n\n*Trade Faster\\!*\n\nYou have reached wallet creation limit`, {
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

bot.action('cancelImport', (ctx) => {
  ctx.reply('Operation canceled. Feel free to start over or use other commands.');
  return ctx.scene.leave();
});

bot.launch();
