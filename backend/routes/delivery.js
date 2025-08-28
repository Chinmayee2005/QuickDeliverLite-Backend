import express from "express";
import {
  createDeliveryRequest,
  getPendingDeliveries,
  getCustomerDeliveries,
  cancelDelivery,
  acceptDelivery,
  accepted,
  updateDeliveryStatus,
  trackDeliveryById,
  counts
} from "../Controllers/deliveryController.js";

const router = express.Router();

router.post("/", createDeliveryRequest);
router.get("/pending", getPendingDeliveries);
router.get("/customer/:email", getCustomerDeliveries);
router.put("/cancel/:id", cancelDelivery);
router.put("/accept/:id", acceptDelivery);
router.get("/accepted", accepted);
router.put("/status/:id", updateDeliveryStatus);
router.get("/track/:id", trackDeliveryById);
router.get("/counts",counts);

export default router;
