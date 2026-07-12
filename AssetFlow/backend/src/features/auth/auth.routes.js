const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validateRequest = require('../../middlewares/validateRequest');
const authMiddleware = require('../../middlewares/authMiddleware');
const { registerSchema, loginSchema } = require('./auth.validation');

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
