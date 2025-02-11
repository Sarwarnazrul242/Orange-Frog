const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../mongo'); // Import the Admin schema
const router = express.Router();

// ✅ Get Admin Profile
router.get('/admin-profile/:email', async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.params.email }).select('-password'); // Exclude password
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin profile' });
    }
});

// ✅ Update Admin Profile (Email & Address)
router.put('/update-admin-profile/:email', async (req, res) => {
    try {
        const { email, address } = req.body;
        const admin = await Admin.findOneAndUpdate(
            { email: req.params.email },
            { email, address },
            { new: true }
        );
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error updating admin profile' });
    }
});

// ✅ Change Admin Password
router.put('/update-admin-profile/:email/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findOne({ email: req.params.email });

        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        // Hash new password and update
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password' });
    }
});

module.exports = router;