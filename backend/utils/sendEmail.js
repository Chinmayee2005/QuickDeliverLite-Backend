import nodemailer from "nodemailer";

// Simple text email sender
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

// HTML email sender (e.g., for delivery updates)
export const sendDeliveryEmail = async (email, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // ✅ Using env variable (secure)
      pass: process.env.EMAIL_PASS,   // ✅ Use app-specific password
    },
  });

  const mailOptions = {
    from: `"QuickDeliver" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
