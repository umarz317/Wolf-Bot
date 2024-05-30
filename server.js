const express = require("express");
const bot = require("./telegram/bot");
const app = express();
require("./config/db");

app.listen(8080, () => {
  console.log("Wolf started");
});

app.get("/", (req, res) => {
  res.send("Wolf Running!");
});

app.get("/startBot", (req, res) => {
  bot.start();
  res.send("Started bot.");
});

app.get("/stopBot", (req, res) => {
  bot.stop();
  res.send("Stopped bot.");
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", reason);
  if (
    !reason.message
      .toString()
      .includes("terminated by other getUpdates request")
  ) {
    bot.start();
  }
});

bot.start()

