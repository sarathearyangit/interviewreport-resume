const express = require('express');
const router = express.Router();

const {
    register,
    login,
    logout,
    getme
} = require('../controllers/authController');
const { authUser } = require('../middleware/authMiddleware')

router.post('/register', register);
router.post('/login', login);

router.post('/logout', logout)

router.get('/get-me', authUser, getme)

module.exports = router;
