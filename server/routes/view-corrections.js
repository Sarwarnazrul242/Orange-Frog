require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router();
const { eventCollection, userCollection, correctionReportCollection } = require('../mongo');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Route to get all events
router.get('/', async (req, res) => {
    try {
        const events = await correctionReportCollection
            .find({})
            .select('-__v')  // Exclude version field
            .lean();  // Convert to plain JavaScript objects
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Route to get a single event
router.get('/:id', async (req, res) => {
    try {
        const event = await correctionReportCollection.findById(req.params.id)
            .populate('assignedContractors', 'name email')
            .populate('acceptedContractors', 'name email')
            .populate('approvedContractors', 'name email')
            .populate('rejectedContractors', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event details' });
    }
});

// Route to delete an event by ID
router.delete('/:id', async (req, res) => {
    try {
        await correctionReportCollection.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Error deleting report' });
    }
});

module.exports = router;
