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

module.exports = router;
/*END OF NEW STUFF*/