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

module.exports = router;
