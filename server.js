const express = require("express");
require("./telegram/bot");
const app = express();
require("./config/db");

app.listen(3000, () => {
  console.log("server started");
});
