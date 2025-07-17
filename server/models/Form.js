const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'multiple-choice'],
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }], // Only for multiple-choice questions
  required: {
    type: Boolean,
    default: true
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publicId: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Form', formSchema);
