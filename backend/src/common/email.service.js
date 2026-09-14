const BREVO_MAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export async function sendOtpEmail(toEmail, otp, type) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error('Brevo email configuration is missing. Set BREVO_API_KEY and BREVO_FROM_EMAIL.');
  }

  const subjects = {
    email_verification: 'Verify your SmartMoney account',
    password_reset: 'Reset your SmartMoney password',
  };

  const bodies = {
    email_verification: `Your email verification code is: <h2>${otp}</h2> Expires in 10 minutes.`,
    password_reset: `Your password reset code is: <h2>${otp}</h2> Expires in 10 minutes.`,
  };

  const response = await fetch(BREVO_MAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'SmartMoney', email: fromEmail },
      to: [{ email: toEmail }],
      subject: subjects[type],
      htmlContent: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;">SmartMoney</h1>
      ${bodies[type]}
      <p style="color:#888;font-size:12px;margin-top:32px;">Do not share this code with anyone.</p>
    </div>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('Brevo failed to send an OTP email:', response.status, details);
    throw new Error('Unable to send email. Please try again later.');
  }
}
