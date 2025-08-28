import express from 'express';
import { sendOtpToCustomer, verifyOtpAndDeliver } from '../Controllers/otpController.js';

const router = express.Router();

router.post('/send-otp', sendOtpToCustomer);
router.post('/verify-otp', verifyOtpAndDeliver);

export default router;
