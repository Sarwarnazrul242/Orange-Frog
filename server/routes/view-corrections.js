require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router();
const { eventCollection, userCollection, correctionReportCollection } = require('../mongo');
// const UserDashboard = require('../../client/src/components/pages/freelancer/UserDashboard').default;

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

// Route to get all corrections
router.get('/', async (req, res) => {
    try {
        const corrections = await correctionReportCollection
            .find({})
            .select('-__v')  // Exclude version field
            .lean();  // Convert to plain JavaScript objects
        
        const users = await userCollection.find({}).select('-__v').lean();
        const events = await eventCollection.find({}).select('-__v').lean();
            
        console.log("Corrections fetched from DB:", corrections);
        
        res.status(200).json({
            corrections,
            users,
            events
        });        
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Route to get a single event
router.get('/:id', async (req, res) => {
    try {
        const correction = await correctionReportCollection.findById(req.params.id)

        const user = await userCollection.findById(correction.userID);

        const event = await eventCollection.findById(correction.eventID);
            
        if (!correction) {
            return res.status(404).json({ message: 'Correction not found' });
        }
        
        res.status(200).json({
            correction,
            userName: user.name,
            event
        });
    } catch (error) {
        console.error('Error fetching correction:', error);
        res.status(500).json({ message: 'Error fetching correction details' });
    }
});

// Route to update an correction by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = {
            ...req.body,
            updatedAt: new Date()
        };

        const updatedEvent = await correctionReportCollection.findByIdAndUpdate(
            id,
            updatedData,
            { 
                new: true,
                overwrite: false,
                returnDocument: 'after'
            }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Correction not found' });
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error('Error updating correction:', error);
        res.status(500).json({ message: 'Error updating correction' });
    }
});

// Route to delete an correction by ID
router.delete('/:id', async (req, res) => {
    try {
        await correctionReportCollection.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Correction deleted successfully' });
    } catch (error) {
        console.error('Error deleting correction:', error);
        res.status(500).json({ message: 'Error deleting correction' });
    }
});

module.exports = router;
