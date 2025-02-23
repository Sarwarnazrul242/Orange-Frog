require('dotenv').config();
const express = require("express");
const router = express.Router();
const { userCollection } = require('../mongo');
const { Admin } = require('../mongo'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User & Admin login logic
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 🔹 Check if the user is an Admin in the database
        const admin = await Admin.findOne({ email });

        if (admin) {
            console.log(admin.password)
            const isPasswordMatch = await bcrypt.compare(password, admin.password);
            if (isPasswordMatch) {
                const token = jwt.sign(
                    { email: admin.email, role: 'admin', userId: admin._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '12h' } // Token expiration time
                );
                return res.status(200).json({ 
                    message: 'Login successful, Admin',
                    role: 'admin',
                    userId: admin._id,
                    token // Send JWT token back to client
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
                const token = jwt.sign(
                    { email: user.email, role: 'user', userId: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' } // Token expiration time
                );
                
                if (user.temporaryPassword) {
                    return res.status(200).json({ 
                        message: 'Temporary password, must reset',
                        role: 'user',
                        resetRequired: true,
                        userId: user._id,
                        token // Send JWT token back to client
                    });
                }

                if (user.status === 'pending') {
                    return res.status(200).json({ 
                        message: 'Profile incomplete, must complete',
                        role: 'user',
                        completeProfile: true,
                        userId: user._id,
                        token // Send JWT token back to client
                    });
                }

                return res.status(200).json({ 
                    message: 'Login successful',
                    role: 'user',
                    userId: user._id,
                    token // Send JWT token back to client
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