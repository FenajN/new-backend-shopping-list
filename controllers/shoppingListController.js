const ShoppingList = require('../models/ShoppingList');
const mongoose = require('mongoose');
const findMemberRole = (list, userId) =>
  list.members.find((member) => member.userId.equals(userId))?.role;

exports.removeItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const list = await ShoppingList.findById(id);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    console.log("Shopping List:", list);

    const owner = list.members.find((member) => member.role === "Owner");

    if (!owner) {
      console.error("List does not have an owner");
      return res.status(500).json({ error: "Server error: Missing owner" });
    }

    if (req.user.role !== "Admin" && !owner.userId.equals(req.user.id)) {
      console.error("Access denied: User is not the owner or admin");
      return res.status(403).json({ error: "Forbidden: Only the owner or admin can remove items" });
    }

    console.log("Access granted:", req.user.id);

    const initialLength = list.items.length;
    list.items = list.items.filter((item) => item._id && !item._id.equals(itemId));

    if (list.items.length === initialLength) {
      return res.status(404).json({ error: "Item not found" });
    }

    await list.save();

    console.log("Item removed successfully");
    res.status(200).json({ status: "success", shoppingList: list });
  } catch (error) {
    console.error("Error removing item:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    const list = await ShoppingList.findById(id);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    const role = findMemberRole(list, req.user.id);

    if (req.user.role !== "Admin" && role !== "Owner") {
      return res.status(403).json({ error: "Forbidden: Only the owner or admin can add members" });
    }

    if (list.members.some((member) => member.userId.equals(memberId))) {
      return res.status(400).json({ error: "Member already exists" });
    }

    list.members.push({ userId: memberId, role: "Member" });
    await list.save();

    res.json({ shoppingList: list });
  } catch (error) {
    console.error("Error adding member:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


exports.removeMember = async (req, res) => {
  try {
    const { id } = req.params; // ID списка
    const { memberId } = req.body; // ID участника, которого нужно удалить

    const list = await ShoppingList.findById(id);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    console.log("Current List:", list);

    const currentUserRole = req.user.role === "Admin"
      ? "Admin"
      : list.members.find((member) => member.userId?.toString() === req.user.id)?.role;

    if (!currentUserRole) {
      console.error("User not in the list");
      return res.status(403).json({ error: "Forbidden: User is not in the list" });
    }

    console.log("Current User Role:", currentUserRole);

    if (currentUserRole === "Admin" || currentUserRole === "Owner") {
      list.members = list.members.filter(
        (member) => member.userId?.toString() !== memberId
      );
    } else if (currentUserRole === "Member") {
      if (req.user.id !== memberId) {
        console.error("Members can only remove themselves");
        return res
          .status(403)
          .json({ error: "Forbidden: Members can only remove themselves" });
      }
      list.members = list.members.filter(
        (member) => member.userId?.toString() !== req.user.id
      );
    } else {
      return res
        .status(403)
        .json({ error: "Forbidden: Insufficient permissions" });
    }

    await list.save();

    res.json({ shoppingList: list });
  } catch (error) {
    console.error("Error removing member:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};



exports.createShoppingList = async (req, res) => {
  try {
    const { name, items, members } = req.body;

    const newList = new ShoppingList({
      name,
      ownerId: req.user.id,
      members: [{ userId: req.user.id, role: "Owner" }],
      items: items || [],
    });

    if (members && Array.isArray(members)) {
      members.forEach((memberId) => {
        if (!newList.members.some((member) => member.userId.equals(memberId))) {
          newList.members.push({ userId: memberId, role: "Member" });
        }
      });
    }

    await newList.save();

    res.status(201).json({ status: "success", shoppingList: newList });
  } catch (error) {
    console.error("Error creating shopping list:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getAllShoppingLists = async (req, res) => {
  try {
    console.log("User ID:", req.user.id);

    const { page = 1, limit = 10 } = req.query;

    const totalItems = await ShoppingList.countDocuments({
      $or: [
        { ownerId: req.user.id },
        { "members.userId": req.user.id }
      ],
    });

    const shoppingLists = await ShoppingList.find({
      $or: [
        { ownerId: req.user.id },
        { "members.userId": req.user.id }
      ],
    })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    console.log("Fetched lists:", shoppingLists);

    res.status(200).json({
      shoppingLists,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    console.error("Error fetching shopping lists:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getShoppingList = async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ status: "error", error: "List not found" });

    res.json({ list, status: "success", error: null });
  } catch (error) {
    res.status(500).json({ list: null, status: "error", error: error.message });
  }
};

exports.updateShoppingList = async (req, res) => {
  try {
    const list = await ShoppingList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ status: "success", shoppingList: list, error: null });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

exports.deleteShoppingList = async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ status: 'error', error: 'List not found' });
    }

    const owner = list.members.find((member) => member.role === 'Owner');
    if (!owner || !owner.userId) {
      return res
        .status(400)
        .json({ status: 'error', error: 'List does not have a valid owner' });
    }

    if (req.user.role !== 'Admin' && owner.userId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        error: 'Forbidden: Only the owner or admin can delete this list',
      });
    }

    await ShoppingList.findByIdAndDelete(req.params.id);

    res.json({ status: 'success', error: null });
  } catch (error) {
    console.error('Error deleting shopping list:', error.message);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};





exports.updateItems = async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ status: "error", error: "List not found" });

    list.items = req.body.items;
    await list.save();

    res.json({ status: "success", shoppingList: list, error: null });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

exports.archiveList = async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ status: "error", error: "List not found" });

    list.isArchived = true;
    await list.save();

    res.json({ status: "success", shoppingList: list, error: null });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

exports.restoreList = async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);
    if (!list) return res.status(404).json({ status: "error", error: "List not found" });

    list.isArchived = false;
    await list.save();

    res.json({ status: "success", shoppingList: list, error: null });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

exports.getAllListsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const totalLists = await ShoppingList.countDocuments();

    const lists = await ShoppingList.find()
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      total: totalLists,
      currentPage: pageNum,
      totalPages: Math.ceil(totalLists / limitNum),
      lists,
    });
  } catch (error) {
    console.error("Error fetching all shopping lists for admin:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

