require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router();
const { incidentCollection } = require('../mongo'); // Use incidentCollection

// Route to get all incidents
router.get('/', async (req, res) => {
    try {
        const incidents = await incidentCollection.find({});
        res.status(200).json(incidents);
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ message: 'Error fetching incidents' });
    }
});

// Route to delete an incident by ID
router.delete('/:id', async (req, res) => {
    try {
        await incidentCollection.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Incident deleted successfully' });
    } catch (error) {
        console.error('Error deleting incident:', error);
        res.status(500).json({ message: 'Error deleting incident' });
    }
});

// Route to update an incident by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedIncident = await incidentCollection.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedIncident);
    } catch (error) {
        console.error('Error updating incident:', error);
        res.status(500).json({ message: 'Error updating incident' });
    }
});

// Route to create a new incident (optional, if needed)
router.post('/', async (req, res) => {
    try {
        const newIncident = new incidentCollection(req.body);
        await newIncident.save();
        res.status(201).json(newIncident);
    } catch (error) {
        console.error('Error creating incident:', error);
        res.status(500).json({ message: 'Error creating incident' });
    }
});

module.exports = router;
