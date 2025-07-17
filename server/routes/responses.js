const express = require('express');
const { body, validationResult } = require('express-validator');
const Form = require('../models/Form');
const Response = require('../models/Response');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit a response to a form (public endpoint)
router.post('/', [
  body('formId').notEmpty(),
  body('answers').isArray({ min: 1 }),
  body('answers.*.questionId').notEmpty(),
  body('answers.*.answer').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { formId, answers } = req.body;

    // Check if form exists and is active
    const form = await Form.findOne({ _id: formId, isActive: true });
    if (!form) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    // Validate answers match form questions
    const questionIds = form.questions.map(q => q._id.toString());
    const answerQuestionIds = answers.map(a => a.questionId);

    const requiredQuestions = form.questions.filter(q => q.required).map(q => q._id.toString());
    const answeredQuestions = answers.map(a => a.questionId);

    // Check if all required questions are answered
    for (const requiredId of requiredQuestions) {
      if (!answeredQuestions.includes(requiredId)) {
        return res.status(400).json({ error: 'All required questions must be answered' });
      }
    }

    // Validate each answer corresponds to a valid question
    for (const answer of answers) {
      if (!questionIds.includes(answer.questionId)) {
        return res.status(400).json({ error: 'Invalid question ID in answers' });
      }
    }

    const response = new Response({
      formId,
      answers,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await response.save();

    res.status(201).json({ message: 'Response submitted successfully', responseId: response._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit response by public form ID (public endpoint)
router.post('/public/:publicId', [
  body('answers').isArray({ min: 1 }),
  body('answers.*.questionId').notEmpty(),
  body('answers.*.answer').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers } = req.body;
    const { publicId } = req.params;

    // Check if form exists and is active
    const form = await Form.findOne({ publicId, isActive: true });
    if (!form) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    // Validate answers match form questions
    const questionIds = form.questions.map(q => q._id.toString());
    const answerQuestionIds = answers.map(a => a.questionId);

    const requiredQuestions = form.questions.filter(q => q.required).map(q => q._id.toString());
    const answeredQuestions = answers.map(a => a.questionId);

    // Check if all required questions are answered
    for (const requiredId of requiredQuestions) {
      if (!answeredQuestions.includes(requiredId)) {
        return res.status(400).json({ error: 'All required questions must be answered' });
      }
    }

    // Validate each answer corresponds to a valid question
    for (const answer of answers) {
      if (!questionIds.includes(answer.questionId)) {
        return res.status(400).json({ error: 'Invalid question ID in answers' });
      }
    }

    const response = new Response({
      formId: form._id,
      answers,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await response.save();

    res.status(201).json({ message: 'Response submitted successfully', responseId: response._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get responses for a specific form (admin only)
router.get('/form/:formId', auth, async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user owns the form
    const form = await Form.findOne({ _id: formId, createdBy: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const skip = (page - 1) * limit;

    const responses = await Response.find({ formId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalResponses = await Response.countDocuments({ formId });

    res.json({
      responses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResponses / limit),
        totalResponses,
        hasMore: skip + responses.length < totalResponses
      },
      form: {
        id: form._id,
        title: form.title,
        questions: form.questions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get response summary/analytics for a form (admin only)
router.get('/form/:formId/summary', auth, async (req, res) => {
  try {
    const { formId } = req.params;

    // Check if user owns the form
    const form = await Form.findOne({ _id: formId, createdBy: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const responses = await Response.find({ formId });
    const totalResponses = responses.length;

    // Generate summary for each question
    const questionSummaries = form.questions.map(question => {
      const questionResponses = responses
        .map(r => r.answers.find(a => a.questionId.toString() === question._id.toString()))
        .filter(Boolean);

      if (question.type === 'multiple-choice') {
        // Count occurrences for each option
        const optionCounts = {};
        question.options.forEach(option => {
          optionCounts[option] = questionResponses.filter(r => r.answer === option).length;
        });

        return {
          questionId: question._id,
          question: question.question,
          type: question.type,
          totalResponses: questionResponses.length,
          options: question.options,
          optionCounts,
          responseRate: totalResponses > 0 ? ((questionResponses.length / totalResponses) * 100).toFixed(1) : '0'
        };
      } else {
        // Text responses
        return {
          questionId: question._id,
          question: question.question,
          type: question.type,
          totalResponses: questionResponses.length,
          responses: questionResponses.slice(0, 20).map(r => r.answer), // Latest 20 responses
          responseRate: totalResponses > 0 ? ((questionResponses.length / totalResponses) * 100).toFixed(1) : '0'
        };
      }
    });

    res.json({
      form: {
        id: form._id,
        title: form.title,
        description: form.description
      },
      totalResponses,
      questionSummaries,
      responseTimeframe: {
        earliest: responses.length > 0 ? responses[responses.length - 1].submittedAt : null,
        latest: responses.length > 0 ? responses[0].submittedAt : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export responses as CSV (bonus feature)
router.get('/form/:formId/export', auth, async (req, res) => {
  try {
    const { formId } = req.params;

    // Check if user owns the form
    const form = await Form.findOne({ _id: formId, createdBy: req.user._id });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const responses = await Response.find({ formId }).sort({ submittedAt: -1 });

    // Create CSV headers
    const headers = ['Response ID', 'Submitted At', ...form.questions.map(q => q.question)];
    
    // Create CSV rows
    const rows = responses.map(response => {
      const row = [response._id, response.submittedAt.toISOString()];
      
      form.questions.forEach(question => {
        const answer = response.answers.find(a => a.questionId.toString() === question._id.toString());
        row.push(answer ? answer.answer : '');
      });
      
      return row;
    });

    // Convert to CSV format
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form-responses-${form.title.replace(/[^a-zA-Z0-9]/g, '-')}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
