import DeliveryRequest from "../models/DeliveryRequest.js";
import { sendDeliveryEmail } from "../utils/sendEmail.js";

const generatedOtps = new Map(); // temp storage

export const sendOtpToCustomer = async (req, res) => {
  const { deliveryId } = req.body;

  try {
    const delivery = await DeliveryRequest.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    generatedOtps.set(deliveryId, otp);

    await sendDeliveryEmail(
      delivery.email,
      "Delivery OTP Verification - QuickDeliver",
      `<h2>Your OTP for delivery confirmation is: <strong>${otp}</strong></h2><p>Please share this with the delivery person only.</p>`
    );

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

export const verifyOtpAndDeliver = async (req, res) => {
  const { deliveryId, enteredOtp } = req.body;

  try {
    const originalOtp = generatedOtps.get(deliveryId);
    if (!originalOtp) return res.status(400).json({ message: "No OTP sent for this delivery" });

    if (originalOtp !== enteredOtp) return res.status(401).json({ message: "Incorrect OTP" });

    // OTP is correct — update delivery status
    const delivery = await DeliveryRequest.findById(deliveryId);
    delivery.timeline = delivery.timeline.map(e => ({ ...e, completed: true, current: false }));

    const now = new Date();
    const derivedLocation = delivery.dropoffAddress || "Dropoff Location";

    delivery.timeline.push({
      status: "Delivered",
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toDateString(),
      location: derivedLocation,
      completed: false,
      current: true
    });

    delivery.status = "delivered";
    delivery.currentLocation = derivedLocation;
    await delivery.save();

    generatedOtps.delete(deliveryId); // remove used OTP

    await sendDeliveryEmail(
      delivery.email,
      "Delivery Completed - QuickDeliver",
      `<h2>Your package has been successfully delivered!</h2><p>Thank you for using QuickDeliver.</p>`
    );

    res.status(200).json({ message: "Delivery marked as delivered", delivery });
  } catch (err) {
    res.status(500).json({ message: "Failed to deliver", error: err.message });
  }
};
