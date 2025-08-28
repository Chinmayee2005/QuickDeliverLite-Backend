import express from 'express';
import { requestToken, verifyToken,getAllCustomers,getAllDrivers,getAdminStats } from '../Controllers/adminTokenController.js';

const router = express.Router();

router.post('/token-request', requestToken);
router.post('/verify-token', verifyToken);

router.get('/customers', getAllCustomers);
router.get('/drivers', getAllDrivers);
router.get('/stats', getAdminStats);


export default router;
