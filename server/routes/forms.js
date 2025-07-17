const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Form = require('../models/Form');
const Response = require('../models/Response');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new form
router.post('/', auth, [
  body('title').notEmpty().trim(),
  body('questions').isArray({ min: 3, max: 5 }),
  body('questions.*.type').isIn(['text', 'multiple-choice']),
  body('questions.*.question').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, questions } = req.body;

    // Validate multiple-choice questions have options
    for (const question of questions) {
      if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
        return res.status(400).json({ error: 'Multiple-choice questions must have at least 2 options' });
      }
    }

    const form = new Form({
      title,
      description,
      questions,
      createdBy: req.user._id,
      publicId: uuidv4()
    });

    await form.save();
    await form.populate('createdBy', 'name email');

    res.status(201).json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all forms by authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Add response count to each form
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ formId: form._id });
        return {
          ...form.toObject(),
          responseCount
        };
      })
    );

    res.json(formsWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific form by ID (for admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('createdBy', 'name email');

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const responseCount = await Response.countDocuments({ formId: form._id });

    res.json({
      ...form.toObject(),
      responseCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get public form by public ID (no auth required)
router.get('/public/:publicId', async (req, res) => {
  try {
    const form = await Form.findOne({
      publicId: req.params.publicId,
      isActive: true
    }).select('-createdBy');

    if (!form) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update form
router.put('/:id', auth, [
  body('title').optional().notEmpty().trim(),
  body('questions').optional().isArray({ min: 3, max: 5 }),
  body('questions.*.type').optional().isIn(['text', 'multiple-choice']),
  body('questions.*.question').optional().notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const form = await Form.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const { title, description, questions, isActive } = req.body;

    if (title) form.title = title;
    if (description !== undefined) form.description = description;
    if (questions) {
      // Validate multiple-choice questions have options
      for (const question of questions) {
        if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
          return res.status(400).json({ error: 'Multiple-choice questions must have at least 2 options' });
        }
      }
      form.questions = questions;
    }
    if (isActive !== undefined) form.isActive = isActive;

    await form.save();
    await form.populate('createdBy', 'name email');

    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete form
router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Delete all responses associated with this form
    await Response.deleteMany({ formId: form._id });
    
    // Delete the form
    await Form.findByIdAndDelete(form._id);

    res.json({ message: 'Form and associated responses deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
