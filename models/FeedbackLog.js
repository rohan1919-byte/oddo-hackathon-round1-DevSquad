const mongoose = require('mongoose');

const feedbackLogSchema = new mongoose.Schema({
  swapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FeedbackLog', feedbackLogSchema); 