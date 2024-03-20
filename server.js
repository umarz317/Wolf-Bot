const express = require("express");
const bot = require("./telegram/bot");
const app = express();
require("./config/db");

app.listen(8080, () => {
  console.log("server started");
});

app.get("/", (req, res) => {
  res.send("Diablo Running!");
});

app.get("/startBot", (req, res) => {
  bot.start();
  res.send("Started bot.");
});


process.on("unhandledRejection", (reason, promise) => {
  bot.start()
})