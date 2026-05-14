const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  addAddress,
  deleteAddress,
  getAllUsers
} = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');

 
// Auth
router.post('/register', register); 
router.post('/login', login);

router.get('/all', getAllUsers);

// Profile
router.get('/profile', authMiddleware, getProfile);

// Address Management
router.post('/add-address', authMiddleware, addAddress);
router.delete('/delete-address/:addressId', authMiddleware, deleteAddress);

module.exports = router;