const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { searchSchema } = require('../middlewares/validationSchemas');

router.get('/lists', authMiddleware('Member'), userController.getUserLists);

router.delete('/remove/:id', authMiddleware('Member'), userController.removeSelfFromList);

router.get('/search', authMiddleware(), validate(searchSchema, 'query'), userController.searchUsers);


router.delete('/delete/:id', authMiddleware(['Admin']), userController.deleteUsers);

router.get('/all', authMiddleware('Admin'), userController.getAllUsers);

module.exports = router;


