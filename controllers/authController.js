const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ status: 'error', error: 'Password is required for standard registration' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: 'error', error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ status: 'error', error: 'Server error' });
  }
};



exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login request received for:", username);

    const user = await User.findOne({ username });
    if (!user) {
      console.error("User not found:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("User found:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Password mismatch for:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("Password matched for user:", username);

    const tokenPayload = {
      id: user._id,
    };

    if (user.role === "Admin") {
      tokenPayload.role = "Admin";
      console.log("Admin role added to token for user:", username);
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Generated JWT token:", token);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name,
        email,
        password: null,
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "success",
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
