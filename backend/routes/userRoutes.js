import express from 'express';
import { updateProfileByEmail, getFullProfileByEmail, getUserByEmail } from '../Controllers/userController.js';
import upload from '../middlewares/multer.js'; // ✅ Correct Cloudinary middleware

const router = express.Router();

router.put('/updateProfile', upload.single('profileImage'), updateProfileByEmail);
router.get('/getFullProfile', getFullProfileByEmail);
router.get('/getUserByEmail', getUserByEmail);

export default router;
