const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = { User };