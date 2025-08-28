import nodemailer from 'nodemailer';

export const sendTokenEmail = async (email, token) => {
    const accessUrl = `${process.env.CLIENT_URL}/admin-access?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  await transporter.sendMail({
    from: '"QuickDeliver Admin" <no-reply@quickdeliver.com>',
    to: email,
    subject: '🔐 Your Admin Access Link',
    html: `
      <h2>Admin Panel Access</h2>
      <p>Click below to access your Admin Panel (valid for 5 minutes):</p>
      <a href="${accessUrl}" style="color:blue;">${accessUrl}</a>
      <p>If you didn’t request this, ignore the message.</p>
    `,
  });
};
