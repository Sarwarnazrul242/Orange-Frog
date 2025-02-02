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
        console.log("aaaaaaaaaaaaaaaaaaaa")
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
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
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

// Route to delete an correction by ID
router.delete('/:id([0-9a-fA-F]{24})', async (req, res) => {
    try {
        await correctionReportCollection.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Correction deleted successfully' });
    } catch (error) {
        console.error('Error deleting correction:', error);
        res.status(500).json({ message: 'Error deleting correction' });
    }
});

// Route to get all corrections of that user
router.get('/:email', async (req, res) => {
    try {
        
        const contractor = await userCollection.findOne({ email: req.params.email });
        if (!contractor) {
            return res.status(404).json({ message: 'Contractor not found' });
        }

        const corrections = await correctionReportCollection.find({
            userID: contractor._id,
        });
        
        const events = await eventCollection.find({}).select('-__v').lean();
            
        console.log("Corrections fetched from DB:", corrections);
        
        res.status(200).json({
            corrections,
            events
        });        
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});


module.exports = router;
