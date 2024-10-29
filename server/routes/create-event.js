/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const { eventCollection } = require('../mongo');


router.post('/', async (req, res) => {
    const { eventName, eventLoadIn, eventLoadOut, eventLocation, eventHours, eventDescription } = req.body;
    if (!eventName || !eventLoadIn || !eventLoadOut || !eventLocation) {
        return res.status(400).json({ message: 'Event Name, Date, and Location are required' });
    }
    try {
        const newEvent = new eventCollection({
            eventName,
            eventLoadIn,
            eventLoadOut,
            eventLocation,
            eventHours, 
            eventDescription
        });
    
        await newEvent.save();
        res.status(200).json({ message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event' });
    }
});

module.exports = router;
/*END OF NEW STUFF*/