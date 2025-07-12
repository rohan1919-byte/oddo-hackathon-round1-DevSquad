const express = require('express');
const Swap = require('../models/Swap');
const User = require('../models/User');
const FeedbackLog = require('../models/FeedbackLog');

const router = express.Router();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create swap request
router.post('/', auth, async (req, res) => {
  try {
    const { toUserId, skillOffered, skillWanted } = req.body;

    // Check if target user exists and is not banned
    const targetUser = await User.findById(toUserId);
    if (!targetUser || targetUser.isBanned) {
      return res.status(404).json({ message: 'Target user not found or banned' });
    }

    // Check if there's already a pending or accepted swap between these users
    const existingSwap = await Swap.findOne({
      $or: [
        { fromUser: req.user._id, toUser: toUserId },
        { fromUser: toUserId, toUser: req.user._id }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingSwap) {
      return res.status(400).json({ message: 'Swap request already exists' });
    }

    // Verify skills match
    if (!req.user.skillsOffered.includes(skillOffered) || !targetUser.skillsOffered.includes(skillWanted)) {
      return res.status(400).json({ message: 'Skills do not match' });
    }

    const swap = new Swap({
      fromUser: req.user._id,
      toUser: toUserId,
      skillOffered,
      skillWanted,
      status: 'pending'
    });

    await swap.save();

    // Populate user details for response
    await swap.populate('fromUser toUser', 'name photo location');

    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's swaps
router.get('/my-swaps', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [
        { fromUser: req.user._id },
        { toUser: req.user._id }
      ]
    }).populate('fromUser toUser', 'name photo location');

    // Categorize swaps
    const incoming = swaps.filter(s => 
      s.toUser._id.toString() === req.user._id.toString() && s.status === 'pending'
    );
    const outgoing = swaps.filter(s => 
      s.fromUser._id.toString() === req.user._id.toString() && s.status === 'pending'
    );
    const accepted = swaps.filter(s => s.status === 'accepted');

    res.json({
      incoming,
      outgoing,
      accepted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept/reject swap
router.put('/:swapId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { swapId } = req.params;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only the recipient can accept/reject
    if (swap.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    swap.status = status;
    await swap.save();

    await swap.populate('fromUser toUser', 'name photo location');

    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete swap (only for pending outgoing swaps)
router.delete('/:swapId', auth, async (req, res) => {
  try {
    const { swapId } = req.params;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only the sender can delete pending swaps
    if (swap.fromUser.toString() !== req.user._id.toString() || swap.status !== 'pending') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Swap.findByIdAndDelete(swapId);

    res.json({ message: 'Swap deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback to swap
router.post('/:swapId/feedback', auth, async (req, res) => {
  try {
    const { rating, text } = req.body;
    const { swapId } = req.params;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only participants can leave feedback
    if (swap.fromUser.toString() !== req.user._id.toString() && 
        swap.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only accepted swaps can have feedback
    if (swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only leave feedback on accepted swaps' });
    }

    // Check if user already left feedback
    const existingFeedback = swap.feedback.find(f => 
      f.fromUser.toString() === req.user._id.toString()
    );

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.rating = rating;
      existingFeedback.text = text;
    } else {
      // Add new feedback
      swap.feedback.push({
        fromUser: req.user._id,
        rating,
        text
      });
    }

    await swap.save();

    // Log feedback for admin reports
    const feedbackLog = new FeedbackLog({
      swapId: swap._id,
      fromUser: req.user._id,
      rating,
      text
    });
    await feedbackLog.save();

    await swap.populate('fromUser toUser', 'name photo location');

    res.json(swap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all swaps (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const swaps = await Swap.find()
      .populate('fromUser toUser', 'name email location')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 