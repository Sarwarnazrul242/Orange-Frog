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
    const { eventName, eventLoadIn, eventLoadOut, eventLocation, eventHours, eventDescription, assignedContractors } = req.body;

    try {
        // Save the event to the database
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

        // Fetch contractor details
        const contractors = await userCollection.find({ _id: { $in: assignedContractors } });

        // Send email to each contractor
        for (const contractor of contractors) {
            const acceptJobUrl = `http://yourfrontendurl.com/accept-job?eventId=${newEvent._id}&contractorId=${contractor._id}`;
            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: contractor.email,
                subject: `New Job Opportunity: ${eventName}`,
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
                                <p style="font-size: 16px; margin: 0;"><strong>Event Name:</strong> ${eventName}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Location:</strong> ${eventLocation}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Load In:</strong> ${eventLoadIn}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Load Out:</strong> ${eventLoadOut}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Total Hours:</strong> ${eventHours}</p>
                                <p style="font-size: 16px; margin: 0;"><strong>Description:</strong> ${eventDescription}</p>
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
