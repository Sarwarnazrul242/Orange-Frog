/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const { userCollection } = require('../mongo');
const bcrypt = require('bcrypt');


const adminCredentials = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
};


// User login and password reset flow
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    // Admin login check
    if (email === adminCredentials.email && password === adminCredentials.password) {
        return res.status(200).json({ message: 'Login successful, Admin', role: 'admin' });
    }

    try {
        const user = await userCollection.findOne({ email });
        if (user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password);

            if (isPasswordMatch) {
                // If the user has reset the password, bypass temporary password checks
                if (user.temporaryPassword) {
                    return res.status(200).json({ message: 'Temporary password, must reset', role: 'user', resetRequired: true });
                }

                // If profile is incomplete (status is pending), redirect to complete profile page
                if (user.status === 'pending') {
                    return res.status(200).json({ message: 'Profile incomplete, must complete', role: 'user', completeProfile: true });
                }

                // Login successful with the new password
                return res.status(200).json({ message: 'Login successful', role: 'user' });
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}); 

module.exports = router;
/*END OF NEW STUFF*/