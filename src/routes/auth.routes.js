const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// simple protected route just to prove the middleware works
router.get('/me', authMiddleware, (req, res) => {
  res.json({ userId: req.user.userId });
});

module.exports = router;