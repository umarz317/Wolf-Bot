const express = require("express");
const bot = require("./telegram/bot");
const app = express();
const status = false
require("./config/db");

app.listen(8080, () => {
  console.log("server started");
});

app.get("/", (req, res) => {
  res.send("Diablo Running!"+status);
})

app.get("/start",(req,res)=>{
  if(status===false){
    status=true
    bot.start();
  }
  res.send("1")
})