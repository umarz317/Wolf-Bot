const mongoose = require("mongoose");
require("dotenv").config();
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.info("Connected to the database");
  })
  .catch((err) => {
    console.log(err);
  });
