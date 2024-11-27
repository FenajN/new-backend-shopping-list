require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const passport = require('./config/passportConfig');
const session = require('express-session');

const app = express();

connectDB();

app.use(express.json());

app.use('/api/lists', shoppingListRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/lists', require('./routes/shoppingListRoutes'));


app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


console.log("Admin Username:", process.env.ADMIN_USERNAME);
console.log("JWT Secret:", process.env.JWT_SECRET);
