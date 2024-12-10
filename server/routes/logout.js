const express = require("express");
const router = express.Router();

router.post('/', (req, res) => {
    // Clear any server-side sessions or tokens if you have them
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;