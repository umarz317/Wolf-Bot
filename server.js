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

// Bot control endpoints are disabled unless ADMIN_TOKEN is set and sent as the x-admin-token header.
function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.get("x-admin-token") !== token) {
    return res.status(403).send("Forbidden");
  }
  next();
}

app.get("/startBot", requireAdmin, (req, res) => {
  bot.start();
  res.send("Started bot.");
});

app.get("/stopBot", requireAdmin, (req, res) => {
  bot.stop();
  res.send("Stopped bot.");
});

process.on("unhandledRejection", (reason) => {
  console.log("Unhandled Rejection at:", reason);
});

bot.start()

