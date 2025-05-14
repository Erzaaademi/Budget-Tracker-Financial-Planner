const express = require('express');
const { register, login, getProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

router.get('/profile', auth, getProfile);

module.exports = router;
