const { Markup, Scenes } = require("telegraf");
const walletSettingScene = new Scenes.BaseScene("walletSettingScene");
const userActions = require("../../../utils/userActions");
const helper = require("../../../utils/helpers");
const keyManagement = require("../../../utils/keyManagement");

walletSettingScene.enter(async (ctx) => {
  var text = await fetchAllwalletsWithBalance(ctx);
  console.log(text);
  ctx.reply(text, {
    parse_mode: "MarkdownV2",
    link_preview_options: { is_disabled: true },
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🔨 Create", "createWallet")],
      [Markup.button.callback("🔑 Import Existing Wallet", "importWallet")],
      [Markup.button.callback("👉 Set Default Wallet", "setDefaultWallet")],
      // [
      //   Markup.button.callback(
      //     "👛 Default Manual Buyer Wallets",
      //     "defaultManualBuyerWallets"
      //   ),
      // ],
      [Markup.button.callback("🗝️ Retrieve Private Keys", "retrievePK")],
      [Markup.button.callback("🗑 Delete Wallet", "deleteWallet")],
      [
        Markup.button.callback("🔙 Back", "back"),
        Markup.button.callback("❌ Close", "close"),
      ],
    ]),
  });
});
walletSettingScene.action("walletSetup", (ctx) => {
  ctx.reply("Wallet Setup", {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🪪 Create Wallet", "createWallet")],
      [Markup.button.callback("🔑 Import Existing Wallet", "importWallet")],
      [
        Markup.button.callback("🔙 Back", "backToWalletSetting"),
        Markup.button.callback("❌ Close", "close"),
      ],
    ]),
  });
});

async function fetchAllwalletsWithBalance(ctx) {
  const userId = ctx.from.id;
  const userWallets = await userActions.getAllUserWallets(userId);
  var text = "";
  if (userWallets && userWallets.length > 0) {
    var index = 1;
    for (const wallet of userWallets) {
      var balance = await helper.fetchUserBalance(wallet.address);
      balance = balance.replace(".", "\\.");
      text += `${index++}: [Balance](${
        "basescan.org/address/" + wallet.address
      }) \\- ${balance} Ξ\n\`${wallet.address}\`\n\n`;
    }
  } else {
    text = "*No wallets found\\.*";
  }
  return text;
}

walletSettingScene.action("deleteWallet", async (ctx) => {
  ctx.deleteMessage();
  const userId = ctx.from.id;
  const userWallets = await userActions.getAllUserWallets(userId);
  console.log(userWallets);
  if (userWallets && userWallets.length > 0) {
    const walletButtons = userWallets.map((wallet, index) => [
      Markup.button.callback(wallet.address, `confirmDelete:${index}`),
    ]);
    ctx.reply(
      "Select a wallet to delete:",
      Markup.inlineKeyboard([
        ...walletButtons,
        [
          Markup.button.callback("🔙 Back", "back"),
          Markup.button.callback("❌ Close", "close"),
        ],
      ])
    );
  } else {
    ctx.reply("No wallets found.");
  }
});

walletSettingScene.action("retrievePK", async (ctx) => {
  ctx.deleteMessage();
  const userId = ctx.from.id;
  const userWallets = await userActions.getAllUserWallets(userId);
  console.log(userWallets);
  if (userWallets && userWallets.length > 0) {
    const walletButtons = userWallets.map((wallet, index) => [
      Markup.button.callback(wallet.address, `getPK:${index}`),
    ]);
    ctx.reply(
      "Select a wallet to retrieve key:",
      Markup.inlineKeyboard([
        ...walletButtons,
        [
          Markup.button.callback("🔙 Back", "back"),
          Markup.button.callback("❌ Close", "close"),
        ],
      ])
    );
  } else {
    ctx.reply("No wallets found.");
  }
});
walletSettingScene.action(/^getPK:(\d+)$/, async (ctx) => {
  const index = parseInt(ctx.match[1]);
  const userId = ctx.from.id;
  const userWallets = await userActions.getAllUserWallets(userId);
  try {
    if (userWallets && userWallets.length > 0) {
      ctx.reply(
        `*Address:* ${
          userWallets[index].address
        }\n*Private Key:*\n\`${keyManagement.decrypt(
          userWallets[index].privateKey
        )}\`
        `,
        { parse_mode: "MarkdownV2" }
      );
    }
  } catch (error) {
    console.log(error);
  }
});

walletSettingScene.action(/^confirmDelete:(\d+)$/, async (ctx) => {
  const walletIdToDelete = parseInt(ctx.match[1]);
  ctx.session.walletIndex =
    ctx.session.walletIndex === walletIdToDelete ? -1 : walletIdToDelete;
  const userId = ctx.from.id;
  const userWallets = await userActions.getAllUserWallets(userId);
  try {
    if (userWallets && userWallets.length > 0) {
      const updatedButtons = userWallets.map((wallet, index) => [
        Markup.button.callback(
          index === ctx.session.walletIndex
            ? `✅ ${wallet.address}`
            : wallet.address,
          `confirmDelete:${index}`
        ),
      ]);
      const confirmButton = Markup.button.callback(
        "Confirm Delete",
        `delete:${walletIdToDelete}`
      );
      ctx.editMessageText(
        "Select a wallet to delete:",
        Markup.inlineKeyboard([
          ...updatedButtons,
          ctx.session.walletIndex !== -1 ? [confirmButton] : [],
          [
            Markup.button.callback("🔙 Back", "deleteWallet"),
            Markup.button.callback("❌ Close", "close"),
          ],
        ])
      );
    }
  } catch (error) {
    console.log(error);
  }
});
walletSettingScene.action(/^delete:(\d+)$/, async (ctx) => {
  ctx.deleteMessage();
  const indexToDelete = parseInt(ctx.match[1]);
  const userId = ctx.from.id;
  await userActions.deleteUserWallet(userId, indexToDelete);
  ctx.reply("Wallet deleted successfully.");
});

const walletOptions = {
  setDefaultWallet: { name: "Set Default Wallet" },
  defaultManualBuyerWallets: { name: "Default Manual Buyer Wallets" },
};

Object.keys(walletOptions).forEach((setting) => {
  walletSettingScene.action(setting, async (ctx) => {
    ctx.deleteMessage();
    const userId = ctx.from.id;
    var fromDb = await userActions.getUserSettingValue(userId, setting);
    //defaults to zero if not set
    fromDb = fromDb ? fromDb : 0;
    ctx.session.walletsetting = fromDb;
    const userWallets = await userActions.getAllUserWallets(userId);
    if (userWallets && userWallets.length > 0) {
      const walletButtons = userWallets.map((wallet, index) => [
        Markup.button.callback(
          index === ctx.session.walletsetting
            ? `✅ ${wallet.address}`
            : wallet.address,
          `${setting}:${index}`
        ),
      ]);
      ctx.reply(
        `Select a wallet for ${walletOptions[setting].name}:`,
        Markup.inlineKeyboard([
          ...walletButtons,
          [
            Markup.button.callback("🔙 Back", "backToWalletSetting"),
            Markup.button.callback("❌ Close", "close"),
          ],
        ])
      );
    } else {
      ctx.reply("No wallets found.");
    }
  });
});

Object.keys(walletOptions).forEach((setting) => {
  walletSettingScene.action(new RegExp(`^${setting}:(\\d+)$`), async (ctx) => {
    const walletIndex = parseInt(ctx.match[1]);
    ctx.session.walletsetting =
      ctx.session.walletsetting === walletIndex ? -1 : walletIndex;
    const userId = ctx.from.id;
    userActions.updateUserSetting(userId, setting, walletIndex);
    const userWallets = await userActions.getAllUserWallets(userId);
    try {
      if (userWallets && userWallets.length > 0) {
        const updatedButtons = userWallets.map((wallet, index) => [
          Markup.button.callback(
            index === ctx.session.walletsetting
              ? `✅ ${wallet.address}`
              : wallet.address,
            `${setting}:${index}`
          ),
        ]);
        ctx.editMessageText(
          "Select a wallet:",
          Markup.inlineKeyboard([
            ...updatedButtons,
            [
              Markup.button.callback("🔙 Back", "backToWalletSetting"),
              Markup.button.callback("❌ Close", "close"),
            ],
          ])
        );
      }
    } catch (error) {
      console.log(error);
    }
  });
});

walletSettingScene.action("backToWalletSetting", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("walletSettingScene");
});
walletSettingScene.action("back", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("settings");
});

walletSettingScene.action("close", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.leave()
});

module.exports = { walletSettingScene };
