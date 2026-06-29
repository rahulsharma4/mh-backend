const express = require('express');
const router = express.Router();
const { authUser } = require('../controllers/userController');

router.post('/login', authUser);
router.post('/register', (req, res) => {
  res.status(403).json({ message: 'Public registration is disabled. Please contact the administrator.' });
});

module.exports = router;
