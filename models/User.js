const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  photo: {
    type: String,
    trim: true,
    default: ''
  },
  skillsOffered: [{
    type: String,
    trim: true
  }],
  skillsWanted: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String,
    trim: true,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 