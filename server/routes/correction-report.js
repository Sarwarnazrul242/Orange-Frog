const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { correctionReportCollection, eventCollection, userCollection } = require('../mongo');
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
  const { correctionName, eventID, userID, requestType, description } = req.body;

  if (!correctionName || !eventID || !userID || !requestType || !description) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const event = await eventCollection.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const newReport = new correctionReportCollection({
      correctionName,
      eventID,
      userID,
      requestType,
      description,
      files: req.files ? req.files.map((file) => file.path) : [],
      status: 'Pending',
      submittedAt: new Date(),
    });

    await newReport.save();
    res.status(201).json({ message: 'Correction report updating successfully' });
  } catch (error) {
    console.error('Error updating correction report:', error);
    res.status(500).json({ message: 'Error updating correction report.' });
  }
});

// Route to update an correction by ID
router.put('/:id([0-9a-fA-F]{24})', async (req, res) => {
  try {
      const { id } = req.params;
      const updatedData = {
          ...req.body,
          updatedAt: new Date()
      };

      const updatedCorrection = await correctionReportCollection.findByIdAndUpdate(
          id,
          updatedData,
          { 
              new: true,
              overwrite: false,
              returnDocument: 'after'
          }
      );

      // Fetch the user' details
      const user = await userCollection.findById({ _id: updatedCorrection.userID });

      const event = await eventCollection.findById({ _id: updatedCorrection.eventID });

      // Send email to each new contractor
          const correctionUrl = `http://yourfrontendurl.com/user/corrections/correctionId=${updatedCorrection._id}}`;
          const mailOptions = {
              from: process.env.EMAIL_USERNAME,
              to: user.email,
              subject: `Update to correction report: ${updatedCorrection.correctionName}`,
              html: `
                  <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
                      <div style="text-align: center; padding: 20px 0;">
                          <img src="https://orangefrog.swbdatabases3.com/wp-content/uploads/2024/03/orange-frog-logo.png" alt="Company Logo" style="width: 150px; height: auto;">
                      </div>
                      
                      <div style="background-color: #F16636; padding: 30px; border-radius: 8px;">
                          <h2 style="color: #ffffff;">Hello, ${user.name}</h2>
                          <p style="font-size: 16px; color: #ffffff;">
                              There has been an update to your corection report! Here are the details:
                          </p>
                          
                          <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                              <p style="font-size: 16px; margin: 0;"><strong>Event Name:</strong> ${event.eventName}</p>
                              <p style="font-size: 16px; margin: 0;"><strong>Correction Type:</strong> ${updatedCorrection.requestType}</p>
                              <p style="font-size: 16px; margin: 0;"><strong>Description:</strong> ${updatedCorrection.description}</p>
                              <p style="font-size: 16px; margin: 0;"><strong>Status:</strong> ${updatedCorrection.status}</p>
                              <p style="font-size: 16px; margin: 0;"><strong>Last Modified:</strong> ${new Date(updatedCorrection.updatedAt).toLocaleString()}</p>
                          </div>

                          <div style="text-align: center; margin-top: 20px;">
                            <a href="${correctionUrl}" style="background-color: #ffffff; color: black; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 16px;">
                              Correction Link
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
              console.log(`Email sent to ${user.email}`);
          } catch (error) {
              console.error(`Error sending email to ${contractor.email}:`, error);
          }

      if (!updatedCorrection) {
          return res.status(404).json({ message: 'Correction not found' });
      }

      res.status(200).json(updatedCorrection);
  } catch (error) {
      console.error('Error updating correction:', error);
      res.status(500).json({ message: 'Error updating correction' });
  }
});

module.exports = router;
