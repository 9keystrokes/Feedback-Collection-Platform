const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const responseRoutes = require('./routes/responses');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);

app.get('/', (req, res) => {
  res.send(`
    Welcome to the Feedback Collection Platform backend!<br>
    GitHub repository: <a href="https://github.com/9keystrokes/Feedback-Collection-Platform">https://github.com/9keystrokes/Feedback-Collection-Platform</a>.<br>
    Made for AYNA FULL STACK INTERN ASSIGNMENT<br>
    By Nayan Mandal<br>
    Mail Me at: <a href="mailto:bt22csd035@iiitn.ac.in">bt22csd035@iiitn.ac.in</a> | <a href="mailto:nayan.iiitn@gmail.com">nayan.iiitn@gmail.com</a>
  `);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Feedback Collection Platform API is running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});
