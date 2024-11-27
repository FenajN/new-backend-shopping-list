const ShoppingList = require('../models/ShoppingList');
const User = require('../models/User');

exports.getUserLists = async (req, res) => {
  try {
    const lists = await ShoppingList.find({
      $or: [
        { ownerId: req.user._id },
        { members: req.user._id }
      ]
    });
    res.json({ shoppingLists: lists, status: "success", error: null });
  } catch (error) {
    res.status(500).json({ shoppingLists: [], status: "error", error: error.message });
  }
};

exports.removeSelfFromList = async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ status: "error", error: "List not found" });

    list.members = list.members.filter(memberId => memberId.toString() !== req.user._id.toString());
    await list.save();

    res.json({ status: "success", error: null });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: `^${search}$`, $options: "i" } },
        { email: { $regex: `^${search}$`, $options: "i" } }
      ],
    }).select("id username email");

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteUsers = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only Admin can delete users" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ status: "success", error: null });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({})
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password");

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      status: "success",
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};





