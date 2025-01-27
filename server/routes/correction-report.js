const express = require('express');
const router = express.Router();
const { correctionReportCollection, eventCollection } = require('../mongo');

router.post('/', async (req, res) => {
  const { eventID, userID, requestType, description, requestedCorrection } = req.body;

  if (!eventID || !userID || !requestType || !description || !requestedCorrection) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const event = await eventCollection.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const newReport = new correctionReportCollection({
      eventID,
      userID,
      requestType,
      description,
      requestedCorrection,
      files: req.files ? req.files.map((file) => file.path) : [],
      status: 'pending',
      submittedAt: new Date(),
    });

    await newReport.save();
    res.status(201).json({ message: 'Correction report submitted successfully' });
  } catch (error) {
    console.error('Error submitting correction report:', error);
    res.status(500).json({ message: 'Error submitting correction report.' });
  }
});

module.exports = router;
