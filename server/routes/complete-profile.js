/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const { userCollection } = require('../mongo');
const router = express.Router();


// Complete profile route
router.post('/', async (req, res) => {
    const { email, address, dob, allergies, phone, shirtSize, firstAidCert } = req.body;

    console.log("Request Body:", req.body); // Log to see the incoming data

    try {
        const user = await userCollection.findOne({ email: email.trim() });
        if (!user) {
            console.error("User not found for email:", email); // Log when user is not found
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.address = address;
        user.dob = dob;
        user.allergies = Array.isArray(allergies) ? allergies : []; // Ensure allergies is an array
        user.phone = phone;
        user.shirtSize = shirtSize;
        user.firstAidCert = firstAidCert;
        user.status = 'active';

        await user.save();
        console.log("User profile updated successfully for:", email); // Log success
        return res.status(200).json({ message: 'Profile completed successfully' });
    } catch (error) {
        console.error("Error during profile completion:", error); // Log the error details
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
/*END OF NEW STUFF*/