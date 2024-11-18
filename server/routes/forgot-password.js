const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { userCollection } = require('../mongo');

// OTP store (in-memory for simplicity)
const otpStore = new Map();

// Forgot Password Endpoint
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, otp);

        // Send Email with OTP
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Your OTP Code',
            html: `
                <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center; padding: 20px 0;">
                        <img src="https://orangefrog.swbdatabases3.com/wp-content/uploads/2024/03/orange-frog-logo.png" alt="Company Logo" style="width: 150px; height: auto;">
                    </div>
                    
                    <div style="background-color: #F16636; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #ffffff;">Your OTP Code</h2>
                        <p style="font-size: 16px; color: #ffffff;">
                            Use the code below to complete your verification. This code is valid for 10 minutes.
                        </p>
                        
                        <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="font-size: 20px; font-weight: bold; margin: 0; color: #F16636;">${otp}</p>
                        </div>
        
                        <p style="font-size: 16px; color: #ffffff;">
                            If you didn’t request this code, you can safely ignore this email.
                        </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
                        If you have any questions, feel free to <a href="mailto:support@yourcompany.com" style="color: #F16636; text-decoration: none;">contact our support team</a>.
                    </p>
                    
                    <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #aaa;">
                        © ${new Date().getFullYear()} Orange Frog, Inc. All rights reserved.
                    </div>
                </div>
            `
        });        

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        res.status(500).json({ message: 'Server error, please try again.' });
    }
});

// Verify OTP Endpoint
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
        return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (storedOtp === otp) {
        otpStore.delete(email); // Remove OTP after successful verification
        res.status(200).json({ message: 'OTP verified' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});

// Reset Password Endpoint
router.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userCollection.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in reset-password:', error);
        res.status(500).json({ message: 'Server error, please try again.' });
    }
});

module.exports = router;
