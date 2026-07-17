export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Verify Your Email Address</h2>

<p>Thank you for registering with <strong>Academix-AI</strong>.</p>

<p>To complete your registration and verify your email address, please use the One-Time Password (OTP) below:</p>

<h1 style="letter-spacing: 4px; text-align: center;">${otp}</h1>

<p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone for security reasons.</p>

<p>If you did not create an account with Academix-AI, you can safely ignore this email.</p>

<p>Thank you,<br><strong>The Academix-AI Team</strong></p>

        </div>
    `;
}

export function newloginAlert(email) {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Login Detected</h2>

<p>We detected a new sign-in to your <strong>Academix-AI</strong> account.</p>

<p><strong>Account:</strong> ${email}</p>

<p>If this login was initiated by you, no further action is required, and you can safely ignore this email.</p>

<p>If you do <strong>not</strong> recognize this activity, we recommend that you secure your account immediately by changing your password and reviewing your recent account activity.</p>

<p>If you continue to experience unauthorized access, please contact the Academix-AI support team as soon as possible.</p>

<p>Thank you,<br><strong>The Academix-AI Team</strong></p>

        </div>
    `;
}