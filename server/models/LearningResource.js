const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['grammar', 'vocabulary', 'pronunciation', 'culture', 'idioms', 'exercises'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  url: {
    type: String
  },
  tags: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for faster queries
learningResourceSchema.index({ language: 1, category: 1 });
learningResourceSchema.index({ tags: 1 });

module.exports = mongoose.model('LearningResource', learningResourceSchema);

