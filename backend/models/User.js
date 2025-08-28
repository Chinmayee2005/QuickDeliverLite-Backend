import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, // optional if using Google login
    role: { type: String, enum: ["Customer", "Driver"], required: true },
    mobile: {type: String,required: true,},
    otp: String,
    otpExpiry: Date,
    googleId: { type: String, unique: true, sparse: true },
    profileImage: { type: String }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
