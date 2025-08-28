import User from '../models/User.js';

import bcrypt from 'bcryptjs';

import cloudinary from '../utils/cloudinary.js'; // ← use cloudinary if image is being uploaded

export const updateProfileByEmail = async (req, res) => {
  try {
    const { email, name, password, mobile } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateFields = { name, mobile };

    // 🌤️ Handle image upload to cloudinary
    if (req.file && req.file.path) {
      updateFields.profileImage = req.file.path;
    }    

    // 🔐 Handle password
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-otp -otpExpiry -__v -createdAt -updatedAt -googleId');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ name: user.name });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Server error' });
  }
};




// Add this below the above function in the same file
export const getFullProfileByEmail = async (req, res) => {
    try {
      const { email } = req.query;
  
      const user = await User.findOne({ email }).select('-otp -otpExpiry -__v -createdAt -updatedAt -googleId');
  
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      // Optional: Don't send hashed password to frontend
      const userWithoutPassword = user.toObject();
      userWithoutPassword.password = ''; 
  
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching full profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  