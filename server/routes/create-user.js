/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { userCollection } = require('../mongo');

const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8); 
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    ignoreTLSVerify: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Create a new user
router.post('/', async (req, res) => {
    const { name, email } = req.body;
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    try {
        const newUser = new userCollection({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();

       // Send email to the user
await transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Your Account Has Been Created',
    html: `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center; padding: 20px 0;">
            <img src="https://orangefrog.swbdatabases3.com/wp-content/uploads/2024/03/orange-frog-logo.png" alt="Company Logo" style="width: 150px; height: auto;">
        </div>
        
        <div style="background-color: #F16636; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff;">Hello, ${name}</h2>
            <p style="font-size: 16px; color: #ffffff;">
                We’re excited to welcome you to our platform! Your account has been created, and you can now log in using the credentials below:
            </p>
            
            <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 16px; margin: 0;"><strong>Email:</strong> ${email}</p>
                <p style="font-size: 16px; margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>

            <p style="font-size: 16px; color: #ffffff;">
                Please log in with these credentials and update your password at your earliest convenience.
            </p>

            <div style="text-align: center; margin-top: 20px;">
                <a href="http://localhost:3000/" style="background-color: #ffffff; color: black; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 16px;">
                    Log In to Your Account
                </a>
            </div>
        </div>
        
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
            If you have any questions, feel free to <a href="mailto:support@yourcompany.com" style="color: #F16636; text-decoration: none;">contact our support team</a>.
        </p>
        
        <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #aaa;">
            © ${new Date().getFullYear()} Orange Frog, Inc. All rights reserved.
        </div>
    </div>`
}, (error, info) => {
    if (error) {
        console.log("Error sending email: ", error);  // Log the error
    } else {
        console.log("Email sent successfully: ", info.response);  // Log success
    }
});


        res.status(200).json({ message: 'User created and email sent', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Route to resend email with new password
router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    try {
        const user = await userCollection.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Resend email with new password
        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Welcome! Here’s Your New Account Credentials',
            html: `
                <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center; padding: 20px 0;">
                        <img src="https://orangefrog.swbdatabases3.com/wp-content/uploads/2024/03/orange-frog-logo.png" alt="Company Logo" style="width: 150px; height: auto;">
                    </div>
                    
                    <div style="background-color: #F16636; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #ffffff;">Hello, ${user.name}</h2>
                        <p style="font-size: 16px; color: #ffffff;">
                            Here are your updated account credentials. You can now log in using the information below:
                        </p>
                        
                        <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="font-size: 16px; margin: 0;"><strong>Email:</strong> ${user.email}</p>
                            <p style="font-size: 16px; margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                        </div>

                        <p style="font-size: 16px; color: #ffffff;">
                            Please log in with these credentials and update your password at your earliest convenience.
                        </p>

                        <div style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:3000/" style="background-color: #ffffff; color: black; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 16px;">
                                Log In to Your Account
                            </a>
                        </div>
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

        res.status(200).json({ message: 'Email resent successfully' });
    } catch (error) {
        console.error("Error resending email:", error);
        res.status(500).json({ message: 'Error resending email' });
    }
});


module.exports = router;
/*END OF NEW STUFF*/