// routes/events.js
const express = require("express");
const router = express.Router();
const { eventCollection } = require('../mongo');

// Route to create a new event


// Route to get all events
router.get('/', async (req, res) => {
    try {
        const events = await eventCollection.find({});
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Route to delete an event by ID
router.delete('/:id', async (req, res) => {
    try {
        await eventCollection.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

// Route to update an event by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedEvent = await eventCollection.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event' });
    }
});

module.exports = router;
