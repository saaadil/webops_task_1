const nodemailer = require('nodemailer');

async function sendOtpEmail(toEmail, otpCode) {
  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.warn('GMAIL_USER or GMAIL_APP_PASSWORD not set in environment. Skipping email dispatch.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: `"NITTFest 2026" <${user}>`,
      to: toEmail,
      subject: 'Your NITTFest Verification Code',
      text: `Hello,\n\nYour NITTFest account verification code is: ${otpCode}\n\nThis code will expire in 10 minutes. If you did not request this, please disregard this email.\n\nWarm regards,\nNITTFest Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #EFE8DC; border-radius: 10px; background-color: #FDFBF7; color: #1A1A2E;">
          <h2 style="color: #FF5C4D; margin-top: 0;">NITTFest 2026 Verification</h2>
          <p>Hello,</p>
          <p>Your one-time verification code is:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px 20px; background-color: #F0EBE0; border-radius: 8px; text-align: center; color: #1A1A2E; margin: 16px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 0.9em; color: #64748B;">This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #E4DCD0; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #94A3B8; margin-bottom: 0;">NITTFest 2026 • Official Fest Companion</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', toEmail);
    return true;
  } catch (error) {
    console.log('Failed to send OTP email:', error);
    return false;
  }
}

module.exports = { sendOtpEmail };
