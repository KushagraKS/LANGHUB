const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create or get existing chat
router.post('/', authenticate, async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({ message: 'Partner ID is required' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, partnerId] },
      status: 'active'
    })
    .populate('participants', 'name avatar nativeLanguage learningLanguages');

    if (chat) {
      return res.json(chat);
    }

    // Get user languages for language pair
    const currentUser = await User.findById(req.user.id);
    const partner = await User.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Determine language pair
    const languagePair = {
      native: currentUser.nativeLanguage,
      learning: partner.nativeLanguage
    };

    // Create new chat
    chat = new Chat({
      participants: [req.user.id, partnerId],
      languagePair
    });

    await chat.save();
    await chat.populate('participants', 'name avatar nativeLanguage learningLanguages');

    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name avatar nativeLanguage learningLanguages')
      .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a chat
router.get('/:id/messages', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive chat
router.patch('/:id/archive', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    chat.status = 'archived';
    await chat.save();

    res.json({ message: 'Chat archived' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

