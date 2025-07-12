const express = require('express');
const AdminMessage = require('../models/AdminMessage');
const User = require('../models/User');
const Swap = require('../models/Swap');
const FeedbackLog = require('../models/FeedbackLog');

const router = express.Router();

// Middleware to verify JWT token and admin status
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Send platform-wide message
router.post('/messages', adminAuth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const message = new AdminMessage({
      text: text.trim()
    });

    await message.save();

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all admin messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await AdminMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest admin message
router.get('/messages/latest', async (req, res) => {
  try {
    const message = await AdminMessage.findOne().sort({ createdAt: -1 });
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove inappropriate skill from user
router.put('/users/:userId/remove-skill', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { skill, type } = req.body;

    if (!['skillsOffered', 'skillsWanted'].includes(type)) {
      return res.status(400).json({ message: 'Invalid skill type' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Replace the skill with [removed]
    const skillIndex = user[type].indexOf(skill);
    if (skillIndex !== -1) {
      user[type][skillIndex] = '[removed]';
      await user.save();
    }

    res.json({ message: 'Skill marked as removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSwaps = await Swap.countDocuments();
    const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
    const acceptedSwaps = await Swap.countDocuments({ status: 'accepted' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalFeedback = await FeedbackLog.countDocuments();

    res.json({
      totalUsers,
      totalSwaps,
      pendingSwaps,
      acceptedSwaps,
      bannedUsers,
      totalFeedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate and download report
router.get('/report', adminAuth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const users = await User.find().select('-password');
    const swaps = await Swap.find().populate('fromUser toUser', 'name email location');
    const feedbackLogs = await FeedbackLog.find().populate('fromUser', 'name');

    const stats = {
      totalUsers: users.length,
      totalSwaps: swaps.length,
      pendingSwaps: swaps.filter(s => s.status === 'pending').length,
      acceptedSwaps: swaps.filter(s => s.status === 'accepted').length,
      bannedUsers: users.filter(u => u.isBanned).length,
      totalFeedback: feedbackLogs.length
    };

    if (format === 'csv') {
      // Generate CSV format
      let csvContent = '';

      // Users CSV
      csvContent += 'Users\nID,Name,Email,Location,Banned,Admin,Created\n';
      users.forEach(user => {
        csvContent += `${user._id},${user.name},${user.email},${user.location},${user.isBanned},${user.isAdmin},${user.createdAt}\n`;
      });

      // Swaps CSV
      csvContent += '\nSwaps\nID,FromUser,ToUser,SkillOffered,SkillWanted,Status,Created\n';
      swaps.forEach(swap => {
        csvContent += `${swap._id},${swap.fromUser.name},${swap.toUser.name},${swap.skillOffered},${swap.skillWanted},${swap.status},${swap.createdAt}\n`;
      });

      // Feedback CSV
      csvContent += '\nFeedback\nSwapID,FromUser,Rating,Text,Created\n';
      feedbackLogs.forEach(feedback => {
        csvContent += `${feedback.swapId},${feedback.fromUser.name},${feedback.rating},${feedback.text.replace(/,/g, ';')},${feedback.createdAt}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=skill-swap-report.csv');
      res.send(csvContent);
    } else {
      // JSON format
      res.json({
        users,
        swaps,
        feedbackLogs,
        stats
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 