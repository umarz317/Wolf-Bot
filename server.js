const express = require("express");
require('./telegram/bot')
const app = express();
require("./mempool/mempool");
require("./config/db");

app.listen(3000, () => {
  console.log("server started");
});
