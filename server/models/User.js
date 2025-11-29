const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  nativeLanguage: {
    type: String,
    required: true
  },
  learningLanguages: [{
    type: String,
    required: true
  }],
  proficiency: {
    type: Map,
    of: String,
    default: {}
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  interests: [{
    type: String
  }],
  availability: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    schedule: {
      type: Map,
      of: [String],
      default: {}
    }
  },
  oauthProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  oauthId: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    matchByProficiency: {
      type: Boolean,
      default: true
    },
    matchByInterests: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

