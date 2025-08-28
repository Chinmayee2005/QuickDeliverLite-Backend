import express from "express";
import passport from "passport";
import { login, register ,sendOtp,verifyOtp,sendCode,forgotPassword,resetPassword} from "../Controllers/authController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/send-code", sendCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


// Google OAuth routes
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/google-failure`, // Not registered = redirect to login
    session: false
  }),
  async (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const encodedToken = encodeURIComponent(token);
    res.redirect(`${process.env.CLIENT_URL}/google-success?token=${encodedToken}`);
  }
);

export default router;
