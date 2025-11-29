const express = require('express');
const { body, validationResult } = require('express-validator');
const LearningResource = require('../models/LearningResource');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all resources (with filters)
router.get('/', async (req, res) => {
  try {
    const { language, category, difficulty, tags } = req.query;
    const query = { isPublic: true };

    if (language) query.language = language;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };

    const resources = await LearningResource.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id)
      .populate('createdBy', 'name avatar');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment views
    resource.views += 1;
    await resource.save();

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create resource
router.post('/', authenticate, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('language').notEmpty().withMessage('Language is required'),
  body('category').isIn(['grammar', 'vocabulary', 'pronunciation', 'culture', 'idioms', 'exercises']),
  body('content').trim().notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = new LearningResource({
      ...req.body,
      createdBy: req.user.id
    });

    await resource.save();
    await resource.populate('createdBy', 'name avatar');

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike resource
router.patch('/:id/like', authenticate, async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const likeIndex = resource.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      resource.likes.splice(likeIndex, 1);
    } else {
      resource.likes.push(req.user.id);
    }

    await resource.save();
    res.json({ likes: resource.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's resources
router.get('/user/:userId', async (req, res) => {
  try {
    const resources = await LearningResource.find({
      createdBy: req.params.userId,
      isPublic: true
    })
    .populate('createdBy', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

