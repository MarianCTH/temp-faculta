const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const UserModel = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.create(email, password);
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key');
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);
    
    if (!user || !(await UserModel.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.two_factor_enabled) {
      return res.json({ requiresTwoFactor: true, userId: user.id });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

// Setup 2FA
router.post('/setup-2fa', auth, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `YourApp:${req.user.email}`
    });

    await UserModel.updateTwoFactorSecret(req.user.id, secret.base32);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');
    res.json({ secret: secret.base32, qrCode });
  } catch (error) {
    res.status(400).json({ error: 'Failed to setup 2FA' });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const verified = speakeasy.totp.verify({
      secret: req.user.two_factor_secret || '',
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    await UserModel.enableTwoFactor(req.user.id);
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to verify 2FA' });
  }
});

// Verify 2FA token during login
router.post('/verify-login-2fa', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await UserModel.findById(Number(userId));

    if (!user || !user.two_factor_secret) {
      return res.status(400).json({ error: 'Invalid user or 2FA not setup' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ user, token: authToken });
  } catch (error) {
    res.status(400).json({ error: 'Failed to verify 2FA token' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 