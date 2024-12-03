require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
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

// Add a new GET route to fetch a specific event
router.get('/:eventId', async (req, res) => {
    try {
        const event = await eventCollection.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event details' });
    }
});

router.post('/', async (req, res) => {
    const { 
        eventName, 
        eventLoadIn, 
        eventLoadInHours,
        eventLoadOut, 
        eventLoadOutHours,
        eventLocation, 
        eventDescription, 
        assignedContractors 
    } = req.body;

    try {
        // Validate dates
        const currentDate = new Date();
        const loadInDate = new Date(eventLoadIn);
        const loadOutDate = new Date(eventLoadOut);

        // Check if dates are in the past
        if (loadInDate < currentDate) {
            return res.status(400).json({ 
                message: 'Load in date cannot be in the past' 
            });
        }

        // Check if load out is before load in
        if (loadOutDate < loadInDate) {
            return res.status(400).json({ 
                message: 'Load out date must be after load in date' 
            });
        }

        // Create new event if validation passes
        const newEvent = new eventCollection({
            eventName,
            eventLoadIn,
            eventLoadInHours,
            eventLoadOut,
            eventLoadOutHours,
            eventLocation,
            eventDescription,
            assignedContractors
        });

        await newEvent.save();

        // Fetch contractor details
        const contractors = await userCollection.find({ _id: { $in: assignedContractors } });

        // Helper function to format date and time in 12-hour format
        const formatDateTime = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        };

        // Send email to each contractor
        for (const contractor of contractors) {
            const acceptJobUrl = `https://orange-frog.vercel.app/user/find-jobs`;
            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: contractor.email,
                subject: `New Job Opportunity: ${eventName}`,
                html: `
                    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
                        <div style="text-align: center; padding: 20px 0;">
                            <img src="https://orangefrog.swbdatabases3.com/wp-content/uploads/2024/03/orange-frog-logo.png" alt="Orange Frog Logo" style="width: 150px; height: auto;">
                        </div>
                        
                        <div style="background-color: #F16636; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #ffffff; margin: 0 0 20px 0;">Hello ${contractor.name}!</h2>
                            <p style="font-size: 16px; color: #ffffff; margin-bottom: 25px;">
                                You have a new job opportunity waiting for you.
                            </p>
                            
                            <div style="background-color: #ffffff; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                                <h3 style="color: #F16636; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                                    ${eventName}
                                </h3>
                                
                                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                                    <p style="margin: 0; color: #666; font-size: 14px;">Location</p>
                                    <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${eventLocation}</p>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div>
                                        <p style="margin: 0; color: #666; font-size: 14px;">Load In</p>
                                        <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">
                                            ${formatDateTime(eventLoadIn)}
                                        </p>
                                        <p style="margin: 5px 0 0 0; color: #F16636; font-size: 14px;">
                                            Duration: ${eventLoadInHours} hours
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p style="margin: 0; color: #666; font-size: 14px;">Load Out</p>
                                        <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">
                                            ${formatDateTime(eventLoadOut)}
                                        </p>
                                        <p style="margin: 5px 0 0 0; color: #F16636; font-size: 14px;">
                                            Duration: ${eventLoadOutHours} hours
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style="text-align: center;">
                                <a href="${acceptJobUrl}" 
                                   style="display: inline-block; background-color: #ffffff; color: #F16636; padding: 12px 30px; 
                                          border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;
                                          transition: background-color 0.3s;">
                                    View Job Details
                                </a>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
                            <p>If you have any questions, please contact us at support@orangefrog.com</p>
                            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Orange Frog Productions. All rights reserved.</p>
                        </div>
                    </div>
                `
            };

            // Await each sendMail call to ensure sequential processing
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${contractor.email}`);
            } catch (error) {
                console.error(`Error sending email to ${contractor.email}:`, error);
            }
        }

        res.status(200).json({ message: 'Event created and notifications sent successfully' });
    } catch (error) {
        console.error('Error creating event or sending notifications:', error);
        res.status(500).json({ message: 'Error creating event or sending notifications' });
    }
});

module.exports = router;
