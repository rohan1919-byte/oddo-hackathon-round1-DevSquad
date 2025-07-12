const mongoose = require('mongoose');

const adminMessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminMessage', adminMessageSchema); 