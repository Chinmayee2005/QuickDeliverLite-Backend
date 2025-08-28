import DeliveryRequest from "../models/DeliveryRequest.js";
import User from "../models/User.js";
import { sendDeliveryEmail } from '../utils/sendEmail.js'; // ✅ Email utility

// ✅ Create a new delivery request
export const createDeliveryRequest = async (req, res) => {
  try {
    const newDelivery = new DeliveryRequest({
      ...req.body,
      trackingId: "TRK" + Date.now().toString(36).toUpperCase(),
      status: "pending",
      timeline: [
        {
          status: "Pending",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toDateString(),
          location: req.body.pickupAddress,
          current: true,
          completed: false,
        }
      ],
      currentLocation: req.body.pickupAddress,
    });

    await newDelivery.save();

    // ✅ Send confirmation email
    const emailBody = `
      <h2>Delivery Scheduled Successfully</h2>
      <p>Thank you for using QuickDeliver!</p>
      <p><strong>Tracking ID:</strong> ${newDelivery.trackingId}</p>
      <p><strong>Pickup:</strong> ${newDelivery.pickupAddress}</p>
      <p><strong>Dropoff:</strong> ${newDelivery.dropoffAddress}</p>
      <p><strong>Date:</strong> ${newDelivery.deliveryDate}</p>
      <p><strong>Time:</strong> ${newDelivery.deliveryTime}</p>
      <p><strong>Package:</strong> ${newDelivery.packageNote}</p>
      <p><strong>Priority:</strong> ${newDelivery.priority}</p>
    `;

    await sendDeliveryEmail(newDelivery.email, "Your QuickDeliver Tracking Info", emailBody);

    res.status(201).json(newDelivery);
  } catch (err) {
    console.error("Delivery creation error:", err);
    res.status(500).json({ message: "Failed to create delivery request." });
  }
};

// ✅ Accept a delivery
export const acceptDelivery = async (req, res) => {
  const { id } = req.params;
  const { driverEmail } = req.body;

  try {
    const driver = await User.findOne({ email: driverEmail, role: "Driver" });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found or unauthorized." });
    }

    const updatedDelivery = await DeliveryRequest.findByIdAndUpdate(
      id,
      {
        status: "accepted",
        driver: {
          name: driver.name,
          phone: driver.mobile,
          email: driver.email,
        },
      },
      { new: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({ message: "Delivery not found." });
    }

    res.status(200).json({ message: "Delivery accepted successfully", delivery: updatedDelivery });
  } catch (err) {
    console.error("Accept delivery error:", err);
    res.status(500).json({ message: "Failed to accept delivery." });
  }
};

// ✅ Get all pending deliveries
export const getPendingDeliveries = async (req, res) => {
  try {
    const requests = await DeliveryRequest.aggregate([
      { $match: { status: "pending" } },
      { $sort: { timestamp: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "email",
          foreignField: "email",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          pickupAddress: 1,
          dropoffAddress: 1,
          packageNote: 1,
          deliveryDate: 1,
          deliveryTime: 1,
          packageSize: 1,
          priority: 1,
          status: 1,
          email: 1,
          timestamp: 1,
          trackingId: 1,
          name: "$userInfo.name",
          mobile: "$userInfo.mobile",
        },
      },
    ]);

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch deliveries." });
  }
};

// ✅ Get deliveries for a specific customer
export const getCustomerDeliveries = async (req, res) => {
  const { email } = req.params;

  try {
    const requests = await DeliveryRequest.find({ email }).sort({ timestamp: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("Customer delivery fetch error:", err);
    res.status(500).json({ message: "Failed to fetch customer's deliveries." });
  }
};

// ✅ Cancel a delivery
export const cancelDelivery = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedDelivery = await DeliveryRequest.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery cancelled", delivery: updatedDelivery });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ message: "Failed to cancel delivery" });
  }
};

// ✅ Get accepted deliveries for a driver
export const accepted = async (req, res) => {
  const { email } = req.query;

  try {
    const deliveries = await DeliveryRequest.find({
      "driver.email": email,
      status: { $in: ["accepted", "in_transit", "delivered"] },
    })
      .sort({ timestamp: -1 });
    const customerEmails = [...new Set(deliveries.map((d) => d.email))];
    const users = await User.find({ email: { $in: customerEmails } });

    const emailToMobileMap = {};
    users.forEach((user) => {
      emailToMobileMap[user.email] = user.mobile;
    });

    const enrichedDeliveries = deliveries.map((delivery) => ({
      ...delivery.toObject(),
      customerMobile: emailToMobileMap[delivery.email] || "N/A",
    }));

    res.json(enrichedDeliveries);
  } catch (err) {
    console.error("Error in accepted deliveries:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update status of a delivery
export const updateDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
    const delivery = await DeliveryRequest.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // Mark all existing timeline events as completed & not current
    delivery.timeline = delivery.timeline.map((event) => ({
      ...event,
      current: false,
      completed: true,
    }));

    const now = new Date();

    // Derive location based on status
    let derivedLocation = 'Unknown';

    const normalizedStatus = newStatus.toLowerCase();

    if (["pending", "accepted"].includes(normalizedStatus)) {
      derivedLocation = delivery.pickupAddress || 'Pickup Location';
    } else if (normalizedStatus === "in_transit") {
      const middleTowns = [
        "Koilakuntla", "Nandyal", "Banaganapalle", "Dhone", "Panyam", "Allagadda"
      ];
    
      // Randomly pick one from the list
      derivedLocation = middleTowns[Math.floor(Math.random() * middleTowns.length)];
    }
    
    else if (normalizedStatus === "delivered") {
      derivedLocation = delivery.dropoffAddress || 'Drop-off Location';
    }

    const newTimelineEntry = {
      status: newStatus.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toDateString(),
      location: derivedLocation,
      completed: false,
      current: true,
    };

    delivery.timeline.push(newTimelineEntry);
    delivery.status = newStatus;
    delivery.currentLocation = derivedLocation;

    await delivery.save();

    res.status(200).json({ message: "Status updated", delivery });
  } catch (err) {
    res.status(500).json({ message: "Error updating delivery status", error: err.message });
  }
};


// ✅ Track delivery by tracking ID
export const trackDeliveryById = async (req, res) => {
  const { id } = req.params;

  try {
    const delivery = await DeliveryRequest.findOne({ trackingId: id });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// In routes/delivery.js
export const counts = async (req, res) => {
  try {
    const { email } = req.query;

    const pendingCount = await DeliveryRequest.countDocuments({
      status: 'pending'
    });

    const acceptedCount = await DeliveryRequest.countDocuments({
      'driver.email': email,
      status: { $in: ['accepted', 'in_transit', 'delivered'] }
    });

    res.json({ pending: pendingCount, accepted: acceptedCount });
  } catch (error) {
    console.error('Error in counts controller:', error);
    res.status(500).json({ error: 'Failed to fetch counts' });
  }
};