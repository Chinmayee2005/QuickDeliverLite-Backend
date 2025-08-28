import crypto from 'crypto';
import AdminToken from '../models/AdminToken.js';
import { sendTokenEmail } from '../utils/sendTokenEmail.js';

import User from '../models/User.js';
import DeliveryRequest from '../models/DeliveryRequest.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalDrivers = await User.countDocuments({ role: 'Driver' });

    // Only count deliveries that are active
    const activeStatuses = ['accepted', 'in_transit'];
    const activeDeliveries = await DeliveryRequest.countDocuments({ status: { $in: activeStatuses } });

    const completedDeliveries = await DeliveryRequest.countDocuments({ status: 'delivered' });
    const totalRequests = await DeliveryRequest.countDocuments();

    res.status(200).json({
      totalCustomers,
      totalDrivers,
      activeDeliveries,
      completedDeliveries,
      totalRequests,
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics' });
  }
};

// Get all Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'Customer' }).select('name email mobile');
    res.status(200).json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all Drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'Driver' }).select('name email mobile');
    res.status(200).json(drivers);
  } catch (err) {
    console.error("Error fetching drivers:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ✅ Admin emails allowed to request token
const allowedAdmins = ['chinmayeebyreddy@gmail.com'];

export const requestToken = async (req, res) => {
  try {
    let { email } = req.body;

    // Debug: Full request
    console.log('📥 Received admin token request:', req.body);

    // Validate and normalize
    if (!email || typeof email !== 'string') {
      console.log('❌ Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    email = email.trim().toLowerCase();
    console.log('📩 Normalized email:', email);

    // Check if email is authorized
    if (!allowedAdmins.includes(email)) {
      console.log('🚫 Unauthorized admin attempt by:', email);
      return res.status(403).json({ message: 'You are not authorized as an admin.' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save token in DB
    await AdminToken.create({ email, token, expiresAt });

    // Send email with magic link
    await sendTokenEmail(email, token);

    console.log('✅ Token sent to admin:', email);
    res.status(200).json({ message: 'Token sent successfully' });

  } catch (err) {
    console.error('🔥 Error sending token:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    // Validate token input
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, message: 'Invalid token format' });
    }

    // Check token existence
    const record = await AdminToken.findOne({ token });

    if (!record) {
      console.log('❌ Invalid token submitted');
      return res.status(401).json({ valid: false, message: 'Token not found' });
    }

    // Expired token
    // if (record.expiresAt < new Date()) {
    //   await AdminToken.deleteOne({ _id: record._id });
    //   console.log('⏰ Expired token rejected');
    //   return res.status(401).json({ valid: false, message: 'Token expired' });
    // }

    // Optional: Remove token after verification
   

    console.log('✅ Admin token verified successfully');
    res.status(200).json({ valid: true });

  } catch (err) {
    console.error('🔥 Error verifying token:', err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
};
