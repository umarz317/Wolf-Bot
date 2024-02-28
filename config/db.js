const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/diablo")
  .then(() => {
    console.info("Connected to the database");
  })
  .catch((err) => {
    console.log(err);
  });
