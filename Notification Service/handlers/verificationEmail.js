const transporter = require('../mail/transporter');

const verificationEmail = async (message) => {
    const payload = JSON.parse(message.value.toString());
    //console.log('Received verification email payload:', payload);
    const { email, code, name } = payload;

    await transporter.sendMail({
        from: `"Orbit" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Orbit - Email Verification Code',
        html: `
        <p>Hello ${name},</p>
        <p>Your verification code is:</p>
        <h2>${code}</h2>
        <p>This code expires in 5 minutes.</p>
        <h3>If you did not request this, please ignore this email.</h3>
        <h4>This is only for testing purposes.</h4>
        <p>Thank you <br/>The Orbit Team</p>
        `,
    });

    //console.log(`Verification email sent to ${email}`);
};

module.exports = { verificationEmail };
