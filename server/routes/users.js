const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -oauthId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().isLength({ max: 500 }),
  body('nativeLanguage').optional().notEmpty(),
  body('learningLanguages').optional().isArray()
], async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Find language exchange partners
router.get('/match/partners', authenticate, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    // Find users who:
    // 1. Have the current user's native language as their learning language
    // 2. Have a native language that the current user is learning
    const partners = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        {
          nativeLanguage: { $in: currentUser.learningLanguages },
          learningLanguages: currentUser.nativeLanguage
        }
      ]
    })
    .select('name avatar nativeLanguage learningLanguages bio rating proficiency')
    .limit(20);

    res.json(partners);
  } catch (error) {
    console.error('Match partners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's chats
router.get('/:id/chats', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const chats = await Chat.find({
      participants: req.params.id,
      status: 'active'
    })
    .populate('participants', 'name avatar nativeLanguage learningLanguages')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

