import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { formsAPI, responsesAPI } from '../services/api';
import { validateFormResponse } from '../utils/validation';

const PublicForm = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const [answers, setAnswers] = useState([]);


  
  const fetchForm = useCallback(async () => {
    try {
      setLoading(true);
      const response = await formsAPI.getPublicForm(publicId);
      setForm(response.data);
      // Initialize answers array
      const initialAnswers = response.data.questions.map(question => ({
        questionId: question._id,
        answer: '',
      }));
      setAnswers(initialAnswers);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Form not found or is no longer active');
      } else {
        setError('Failed to load form');
      }
      console.error('Error fetching form:', err);
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    fetchForm();
  }, [publicId, fetchForm]);


  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev =>
      prev.map(answer =>
        answer.questionId === questionId
          ? { ...answer, answer: value }
          : answer
      )
    );
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => ({
        ...prev,
        [questionId]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateFormResponse(form, answers);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      // Filter out empty answers for optional questions
      const filteredAnswers = answers
        .filter(answer => answer.answer && answer.answer.trim())
        .map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer.trim(),
        }));

      await responsesAPI.submitPublicResponse(publicId, filteredAnswers);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit response');
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !form) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Box textAlign="center" mt={3}>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Thank You! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your feedback has been submitted successfully.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We appreciate you taking the time to share your thoughts with us.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            size="large"
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            {form.title}
          </Typography>
          {form.description && (
            <Typography variant="body1" color="text.secondary">
              {form.description}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {form.questions.map((question, index) => {
            const answer = answers.find(a => a.questionId === question._id);
            const hasError = !!validationErrors[question._id];

            return (
              <Box key={question._id} sx={{ mb: 4 }}>
                {question.type === 'text' ? (
                  <TextField
                    fullWidth
                    label={`${index + 1}. ${question.question}`}
                    multiline
                    rows={3}
                    variant="outlined"
                    value={answer?.answer || ''}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    error={hasError}
                    helperText={validationErrors[question._id]}
                    required={question.required}
                  />
                ) : (
                  <FormControl error={hasError} required={question.required}>
                    <FormLabel component="legend">
                      {index + 1}. {question.question}
                    </FormLabel>
                    <RadioGroup
                      value={answer?.answer || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    >
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={option}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                    {hasError && (
                      <FormHelperText>
                        {validationErrors[question._id]}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              </Box>
            );
          })}

          <Box textAlign="center" mt={4}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              sx={{ px: 6, py: 1.5 }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PublicForm;
