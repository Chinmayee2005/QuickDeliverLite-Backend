import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  status: String,
  time: String,
  date: String,
  location: String,
  completed: Boolean,
  current: Boolean,
}, { _id: false });

const driverSchema = new mongoose.Schema({
  name: String,
  phone: String,
  vehicle: String,
  email: String
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  category: { type: String, enum: ['general', 'driver', 'speed', 'packaging', 'communication', 'app'] },
  date: { type: Date, default: Date.now }
}, { _id: false });

const deliveryRequestSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  pickupAddress: { type: String, required: true },
  dropoffAddress: { type: String, required: true },
  packageNote: { type: String, required: true },
  deliveryDate: { type: String, required: true },
  deliveryTime: { type: String, required: true },
  packageSize: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, default: "pending" },
  currentLocation: { type: String, default: "" },
  estimatedDelivery: { type: String, default: "" },
  email: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  feedbackGiven: { type: Boolean, default: false },
  otp: { type: String, default: null }, 
  driver: driverSchema,
  timeline: [timelineSchema],

  // ✅ Embedded feedback object
  feedback: feedbackSchema
});

const DeliveryRequest = mongoose.model('DeliveryRequest', deliveryRequestSchema);
export default DeliveryRequest;
