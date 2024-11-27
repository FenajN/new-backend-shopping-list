const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {createListSchema,
  updateListSchema,
  updateItemsSchema,
  addMemberSchema,
} = require('../middlewares/validationSchemas');
const shoppingListController = require('../controllers/shoppingListController');

router.get('/', authMiddleware(), shoppingListController.getAllShoppingLists);

router.post('/', authMiddleware(), validate(createListSchema), shoppingListController.createShoppingList);

router.get('/:id', authMiddleware(['Member', 'Owner']), shoppingListController.getShoppingList);

router.put('/:id', authMiddleware('Owner'), validate(updateListSchema), shoppingListController.updateShoppingList);

router.delete('/:id', authMiddleware('Owner'), shoppingListController.deleteShoppingList);

router.put('/:id/items', authMiddleware(['Owner']), validate(updateItemsSchema), shoppingListController.updateItems);

router.put('/:id/archive', authMiddleware('Owner'), shoppingListController.archiveList);

router.put('/:id/restore', authMiddleware('Owner'), shoppingListController.restoreList);

router.delete('/:id/members', authMiddleware(['Owner', 'Member']), shoppingListController.removeMember);

router.post('/:id/members', authMiddleware('Owner'), validate(addMemberSchema), shoppingListController.addMember);

router.delete("/:id/items/:itemId", authMiddleware('Owner'), shoppingListController.removeItem);

router.get("/admin/lists", authMiddleware("Admin"), shoppingListController.getAllListsForAdmin);

module.exports = router;
