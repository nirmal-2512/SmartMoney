import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendOtpEmail(toEmail, otp, type) {
  const subjects = {
    email_verification: 'Verify your SmartMoney account',
    password_reset: 'Reset your SmartMoney password',
  };

  const bodies = {
    email_verification: `Your email verification code is: <h2>${otp}</h2> Expires in 10 minutes.`,
    password_reset: `Your password reset code is: <h2>${otp}</h2> Expires in 10 minutes.`,
  };

  await sgMail.send({
    to: toEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: subjects[type],
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;">SmartMoney</h1>
      ${bodies[type]}
      <p style="color:#888;font-size:12px;margin-top:32px;">Do not share this code with anyone.</p>
    </div>`,
  });
}