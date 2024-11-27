const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, default: null },
  googleId: { type: String },
});

module.exports = mongoose.model("User", userSchema);


