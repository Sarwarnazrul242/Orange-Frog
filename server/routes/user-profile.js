// user-profile.js
require('dotenv').config();
const express = require("express");
const router = express.Router();
const { userCollection } = require('../mongo');

router.get('/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await userCollection.findOne({ email });
        if (user) {
            const userData = {
                name: user.name,
                email: user.email,
                address: user.address,
                dob: user.dob,
                phone: user.phone,
                height: user.height, // assuming this is stored as { feet: '', inches: '' }
                gender: user.gender,
                allergies: user.allergies
            };
            res.status(200).json(userData);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
