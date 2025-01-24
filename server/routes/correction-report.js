// server/routes/correction-report.js
const express = require('express');
const router = express.Router();
const { correctionReportCollection } = require('../mongo');

router.post('/', async (req, res) => {
  const {
      reportTitle,
      eventDate,
      startDate,
      endDate,
      requestType,
      description,
      requestedCorrection
  } = req.body;

  if (!reportTitle || !eventDate || !startDate || !endDate || !requestType || !description || !requestedCorrection) {
    console.log(reportTitle, eventDate, startDate, endDate, requestType, description, requestedCorrection);
      return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
      const newReport = new correctionReportCollection({
          reportTitle,
          eventDate,
          startDate,
          endDate,
          requestType,
          description,
          requestedCorrection,
          files: req.files ? req.files.map(file => file.path) : [],
          status: 'pending',
          submittedAt: new Date()
      });

      await newReport.save();
      res.status(201).json({ message: 'Correction report submitted successfully' });
  } catch (error) {
      console.error('Error submitting correction report:', error);
      res.status(500).json({ message: 'Error submitting correction report' });
  }
});

module.exports = router;