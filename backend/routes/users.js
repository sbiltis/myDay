const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Update user role (club_lead only)
router.put('/:id/role', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    
    if (requestingUser.role !== 'club_lead') {
      return res.status(403).json({ message: 'Only club leads can change user roles' });
    }

    const { role } = req.body;
    
    if (!['member', 'project_lead', 'club_lead'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (club_lead only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    
    if (requestingUser.role !== 'club_lead') {
      return res.status(403).json({ message: 'Only club leads can delete users' });
    }

    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;