require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
const router = express.Router();
const { eventCollection, userCollection, incidentCollection } = require('../mongo');

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

// Route to create a new incident report
router.post('/', async (req, res) => {
    const { incidentName, incidentStartDate, incidentEndDate, incidentRequest, incidentDescription } = req.body;

    try {
        // Save the incident report to the database
        const newIncidentReport = new incidentCollection({
            incidentName,
            incidentStartDate,
            incidentEndDate,
            incidentRequest,
            incidentDescription
        });
        await newIncidentReport.save();

        res.status(200).json({ message: 'Incident Report created successfully' });
    } catch (error) {
        console.error('Error creating incident report:', error);
        res.status(500).json({ message: 'Error creating incident report' });
    }
});

// Route to fetch event names from eventCollection
router.get('/events', async (req, res) => {
    try {
        const events = await eventCollection.find({}, { eventName: 1, _id: 0 }); // Fetch only eventName
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

module.exports = router;
