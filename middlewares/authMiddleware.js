const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ShoppingList = require('../models/ShoppingList');

const authMiddleware = (roles) => async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = user;

    if (user.role === 'Admin') {
      req.user.isAdmin = true;
      return next();
    }

    req.user.isAdmin = false;

    if (roles && roles.length > 0) {
      const isAdminOnlyEndpoint = req.baseUrl.includes('/admin');
      const isListRelatedEndpoint = req.baseUrl.includes('/lists') || req.originalUrl.includes('/lists');

      if (isAdminOnlyEndpoint) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      if (isListRelatedEndpoint) {
        const listId = req.params.id || req.body.listId;

        if (!listId) {
          return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        const shoppingList = await ShoppingList.findById(listId);
        if (!shoppingList) {
          return res.status(404).json({ error: 'Not Found: List not found' });
        }

        const member = shoppingList.members.find((m) => m.userId.toString() === user._id.toString());
        if (!member || !roles.includes(member.role)) {
          return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
      } else {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = authMiddleware;

















