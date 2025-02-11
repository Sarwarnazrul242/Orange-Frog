require('dotenv').config();
const express = require("express");
const router = express.Router();
const { userCollection } = require('../mongo');
const Admin = require('./admin'); // Import Admin schema
const bcrypt = require('bcrypt');

// User & Admin login logic
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 🔹 Check if the user is an Admin in the database
        const admin = await Admin.findOne({ email });

        if (admin) {
            const isPasswordMatch = await bcrypt.compare(password, admin.password);
            if (isPasswordMatch) {
                return res.status(200).json({ 
                    message: 'Login successful, Admin',
                    role: 'admin',
                    userId: admin._id 
                });
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }

        // 🔹 Check if the user is a normal User
        const user = await userCollection.findOne({ email });

        if (user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (isPasswordMatch) {
                if (user.temporaryPassword) {
                    return res.status(200).json({ 
                        message: 'Temporary password, must reset',
                        role: 'user',
                        resetRequired: true,
                        userId: user._id 
                    });
                }

                if (user.status === 'pending') {
                    return res.status(200).json({ 
                        message: 'Profile incomplete, must complete',
                        role: 'user',
                        completeProfile: true,
                        userId: user._id 
                    });
                }

                return res.status(200).json({ 
                    message: 'Login successful',
                    role: 'user',
                    userId: user._id 
                });
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } 

        return res.status(401).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
}); 

module.exports = router;