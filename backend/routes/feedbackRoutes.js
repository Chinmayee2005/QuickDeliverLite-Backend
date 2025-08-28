// feedbackRoutes.js
import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getDeliveredDeliveries,
  getDriverFeedback,
  getRecentFeedbacks,

} from '../Controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/all', getAllFeedback);
router.get('/deliveries', getDeliveredDeliveries);
router.get('/driver/:name', getDriverFeedback);
router.get('/recent-feedbacks', getRecentFeedbacks); 



export default router;