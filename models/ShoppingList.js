const mongoose = require("mongoose");

const shoppingListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [
    {
      userId: { type: mongoose.Types.ObjectId, required: true },
      role: { type: String, enum: ["Owner", "Member"], required: true },
    },
  ],
  items: [
    {
      name: { type: String, required: true },
      isCompleted: { type: Boolean, default: false },
    },
  ],
  isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model("ShoppingList", shoppingListSchema);



