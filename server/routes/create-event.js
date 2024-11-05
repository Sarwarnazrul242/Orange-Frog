/*NEW STUFF*/
require('dotenv').config();
const express = require("express");
const router = express.Router();
const { eventCollection } = require('../mongo');


// src/routes/create-event.js
router.post('/', async (req, res) => {
    const { eventName, eventLoadIn, eventLoadOut, eventLocation, eventHours, eventDescription, assignedContractors } = req.body;

    try {
        const newEvent = new eventCollection({
            eventName,
            eventLoadIn,
            eventLoadOut,
            eventLocation,
            eventHours, 
            eventDescription,
            assignedContractors 
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