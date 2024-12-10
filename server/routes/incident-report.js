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

router.post('/', async (req, res) => {
    const { incidentName, incidentStartDate, incidentEndDate, incidentRequest, incidentDescription } = req.body;

    try {
        // Save the event to the database
        const newIncidentReport = new incidentCollection({
            incidentName,
            incidentStartDate,
            incidentEndDate,
            incidentRequest,
            incidentDescription
        });
        await newIncidentReport.save();

       
        res.status(200).json({ message: 'Event created and notifications sent successfully' });
    } catch (error) {
        console.error('Error acreating event or sending notifications:', error);
        res.status(500).json({ message: 'Error acreating event or sending notifications' });
    }
});

module.exports = router;
