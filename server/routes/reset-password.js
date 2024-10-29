/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { userCollection } = require('../mongo');



// Password reset route
router.post('/', async (req, res) => {
    const { email, tempPassword, newPassword } = req.body;

    try {
        const user = await userCollection.findOne({ email });
        if (user) {
            const isTempPasswordMatch = await bcrypt.compare(tempPassword, user.password);

            if (isTempPasswordMatch) {
                const hashedNewPassword = await bcrypt.hash(newPassword, 10);
                user.password = hashedNewPassword;
                user.temporaryPassword = false; 
                await user.save();

                return res.status(200).json({ message: 'Password reset successful' });
            } else {
                return res.status(401).json({ message: 'Temporary password does not match' });
            }
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
/*END OF NEW STUFF*/