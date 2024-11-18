require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router();
const { eventCollection, userCollection } = require('../mongo');

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

// Route to get all events, populating contractor names
router.get('/', async (req, res) => {
    try {
        const events = await eventCollection.find({}).populate('assignedContractors', 'name');
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

// Route to send notifications to newly added contractors
router.post('/send-notifications', async (req, res) => {
    const { eventId, contractorIds } = req.body;

    try {
        // Fetch the event details
        const event = await eventCollection.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Fetch the contractors' details
        const contractors = await userCollection.find({ _id: { $in: contractorIds } });

        // Send email to each new contractor
        for (const contractor of contractors) {
            const acceptJobUrl = `http://yourfrontendurl.com/accept-job?eventId=${event._id}&contractorId=${contractor._id}`;
            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: contractor.email,
                subject: `New Job Opportunity: ${event.eventName}`,
                html: `
                    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
                        <div style="text-align: center; padding: 20px 0;">
                            <img src="https://orangefrog.swbdatabases3.com/wp-content/uploads/2024/03/orange-frog-logo.png" alt="Company Logo" style="width: 150px; height: auto;">
                        </div>
                        
                        <div style="background-color: #F16636; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #ffffff;">Hello, ${contractor.name}</h2>
                            <p style="font-size: 16px; color: #ffffff;">
                                We have a new job opportunity for you! Here are the details:
                            </p>
                            
                            <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="font-size: 16px; margin: 0;"><strong>Event Name:</strong> ${event.eventName}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Location:</strong> ${event.eventLocation}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Load In:</strong> ${new Date(event.eventLoadIn).toLocaleString()}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Load Out:</strong> ${new Date(event.eventLoadOut).toLocaleString()}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Total Hours:</strong> ${event.eventHours}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Description:</strong> ${event.eventDescription}</p>
                            </div>

                            <p style="font-size: 16px; color: #ffffff;">
                                If you're interested in this job, please click the button below to accept the opportunity.
                            </p>

                            <div style="text-align: center; margin-top: 20px;">
                                <a href="${acceptJobUrl}" style="background-color: #ffffff; color: black; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 16px;">
                                    Accept Job
                                </a>
                            </div>
                        </div>
                        
                        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
                            If you have any questions, feel free to <a href="mailto:support@yourcompany.com" style="color: #F16636; text-decoration: none;">contact our support team</a>.
                        </p>
                        
                        <div style="text-align: center; padding: 10px 0; font-size: 12px; color: #aaa;">
                            © ${new Date().getFullYear()} Orange Frog, Inc. All rights reserved.
                        </div>
                    </div>`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${contractor.email}`);
            } catch (error) {
                console.error(`Error sending email to ${contractor.email}:`, error);
            }
        }

        res.status(200).json({ message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ message: 'Error sending notifications' });
    }
});

router.get('/assigned/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const events = await eventCollection.find({
            assignedContractors: userObjectId,
            acceptedContractors: { $ne: userObjectId },
            rejectedContractors: { $ne: userObjectId }
        }).populate('assignedContractors', 'name');

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching assigned events:', error);
        res.status(500).json({ message: 'Error fetching assigned events' });
    }
});


// Route to accept an event
router.post('/accept', async (req, res) => {
    const { eventId, userId } = req.body;
    try {
        const event = await eventCollection.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Add user to accepted list and remove from rejected list if present
        event.acceptedContractors = [...new Set([...event.acceptedContractors, userId])];
        event.rejectedContractors = event.rejectedContractors.filter(id => id.toString() !== userId);

        await event.save();
        res.status(200).json({ message: 'Event accepted successfully' });
    } catch (error) {
        console.error('Error accepting event:', error);
        res.status(500).json({ message: 'Error accepting event' });
    }
});

// Route to reject an event
router.post('/reject', async (req, res) => {
    const { eventId, userId } = req.body;
    try {
        const event = await eventCollection.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Add user to rejected list and remove from accepted list if present
        event.rejectedContractors = [...new Set([...event.rejectedContractors, userId])];
        event.acceptedContractors = event.acceptedContractors.filter(id => id.toString() !== userId);

        await event.save();
        res.status(200).json({ message: 'Event rejected successfully' });
    } catch (error) {
        console.error('Error rejecting event:', error);
        res.status(500).json({ message: 'Error rejecting event' });
    }
});

// Route to fetch user jobs
router.get('/user-jobs/:userId', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId); // Use 'new' to create ObjectId

        const acceptedJobs = await eventCollection.find({ acceptedContractors: userId, selectedContractor: null });
        const completedJobs = await eventCollection.find({ selectedContractor: userId, eventStatus: "completed" });
        const rejectedJobs = await eventCollection.find({ rejectedContractors: userId });

        res.status(200).json({ acceptedJobs, completedJobs, rejectedJobs });
    } catch (error) {
        console.error('Error fetching user jobs:', error);
        res.status(500).json({ message: 'Error fetching user jobs' });
    }
});


module.exports = router;
