const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const cleanEmail = email ? email.toString().trim().toLowerCase() : '';
    const cleanPassword = password ? password.toString().trim() : '';
    
    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(cleanPassword))) {
      if (user.isDeleted) {
        return res.status(401).json({ message: 'Your account has been deleted. Please contact admin.' });
      }
      if (user.status === 'inactive') {
        return res.status(401).json({ message: 'Your account is inactive. Please contact admin.' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.tokenVersion || 0),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const isAdminCreating = req.user && req.user.role === 'admin';
    
    const cleanEmail = email ? email.toString().trim().toLowerCase() : '';
    const cleanPassword = password ? password.toString().trim() : '';

    const user = new User({
      name,
      email: cleanEmail,
      phone,
      password: cleanPassword,
      role: isAdminCreating ? (role || 'staff') : 'admin',
      owner: isAdminCreating ? req.user._id : null,
    });

    await user.save();

    if (user) {
      // Return only essential fields to keep response clean and fast
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
  const staff = await User.find({ 
    role: { $in: ['staff', 'telecaller'] }, 
    owner: req.user._id,
    isDeleted: { $ne: true }
  });
  res.json(staff);
};

// @desc    Delete staff (Soft Delete)
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isDeleted = true;
    user.status = 'inactive';
    await user.save();
    res.json({ message: 'Staff member removed successfully (Data preserved)' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get staff details with assigned leads
// @route   GET /api/staff/:id
// @access  Private/Admin
const getStaffDetails = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    let leads = [];
    let contacts = [];

    if (staff.role === 'telecaller') {
      const Contact = require('../models/contactModel');
      contacts = await Contact.find({ assignedTo: req.params.id }).sort({ updatedAt: -1 });
    } else {
      const Lead = require('../models/leadModel');
      leads = await Lead.find({ assignedTo: req.params.id }).sort({ updatedAt: -1 });
    }

    res.json({
      staff,
      leads,
      contacts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle staff active/inactive status (Block/Unblock)
// @route   PATCH /api/staff/:id/toggle-status
// @access  Private/Admin
const toggleStaffStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify ownership
    if (user.owner && user.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage this staff member' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({
      message: `Staff member status updated to ${user.status}`,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff details (Admin only)
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Verify ownership
    if (user.owner && user.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage this staff member' });
    }

    // Check if email already exists for another user
    if (email) {
      const cleanEmail = email.toString().trim().toLowerCase();
      if (cleanEmail !== user.email.toLowerCase()) {
        const emailExists = await User.findOne({ email: cleanEmail });
        if (emailExists) {
          return res.status(400).json({ message: 'A user with this email already exists' });
        }
        user.email = cleanEmail;
      }
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (role) user.role = role;

    if (password && password.toString().trim() !== '') {
      user.password = password.toString().trim();
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();

    res.json({
      message: 'Staff member updated successfully',
      staff: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authUser, registerUser, getStaff, deleteStaff, getStaffDetails, toggleStaffStatus, updateStaff };
