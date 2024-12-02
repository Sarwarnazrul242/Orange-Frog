/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const { userCollection } = require('../mongo');


// Fetch users (pending and active)
router.get('/', async (req, res) => {
    try {
        const users = await userCollection.find();
        res.status(200).json(users); // Return all users, status included
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// users.js
router.get('/email/:email', async (req, res) => {
    try {
        const user = await userCollection.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user); // User object including _id
    } catch (error) {
        console.error('Error fetching user by email:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
/*END OF NEW STUFF*/