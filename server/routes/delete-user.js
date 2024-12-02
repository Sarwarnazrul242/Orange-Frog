/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const { userCollection } = require('../mongo');

// Delete user by ID
router.delete('/:id', async (req, res) => {
    try {
        const result = await userCollection.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
