const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateMiddleware = require("../middlewares/validateMiddleware");
const validationSchemas = require("../middlewares/validationSchemas");
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post(
  "/register",
  validateMiddleware(validationSchemas.registerUserSchema),
  authController.registerUser
);

router.post(
  "/login",
  validateMiddleware(validationSchemas.loginUserSchema),
  authController.login
);


router.post(
  "/google-login",
  validateMiddleware(validationSchemas),
  authController.googleLogin
);


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Authenticated successfully', token });
  }
);

module.exports = router;
