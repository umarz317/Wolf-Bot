const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

module.exports = {settingSchema};
