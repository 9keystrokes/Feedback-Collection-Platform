import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Preview,
  ArrowBack,
} from '@mui/icons-material';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { formsAPI } from '../services/api';
import { validateForm } from '../utils/validation';

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [
      { type: 'text', question: '', required: true, options: [] },
    ],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);


  const fetchForm = useCallback(async () => {
    try {
      setLoading(true);
      const response = await formsAPI.getForm(id);
      setFormData({
        title: response.data.title,
        description: response.data.description || '',
        questions: response.data.questions,
      });
    } catch (err) {
      setSaveError('Failed to load form');
      console.error('Error fetching form:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      fetchForm();
    }
  }, [id, isEditing, fetchForm]);


  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
    
    setSaveError('');
    setSaveSuccess(false);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    
    // Reset options when changing question type
    if (field === 'type') {
      updatedQuestions[index].options = value === 'multiple-choice' ? ['', ''] : [];
    }
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
    
    // Clear errors
    if (errors[`question_${index}`] || errors[`question_${index}_options`]) {
      setErrors(prev => ({
        ...prev,
        [`question_${index}`]: '',
        [`question_${index}_options`]: '',
      }));
    }
    
    setSaveError('');
    setSaveSuccess(false);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    if (formData.questions.length >= 5) return;
    
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { type: 'text', question: '', required: true, options: [] },
      ],
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) return;
    
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push('');
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      
      setFormData(prev => ({
        ...prev,
        questions: updatedQuestions,
      }));
    }
  };

  const handleSave = async () => {
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setSaveError('');
    
    try {
      if (isEditing) {
        await formsAPI.updateForm(id, formData);
      } else {
        await formsAPI.createForm(formData);
      }
      
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save form');
      console.error('Error saving form:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Edit Form' : 'Create New Form'}
        </Typography>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError}
        </Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Form saved successfully! Redirecting to dashboard...
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        {/* Form Title and Description */}
        <Box mb={4}>
          <TextField
            fullWidth
            label="Form Title"
            variant="outlined"
            value={formData.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Form Description (Optional)"
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Questions */}
        <Typography variant="h6" gutterBottom>
          Questions
          <Chip
            label={`${formData.questions.length}/5`}
            size="small"
            sx={{ ml: 2 }}
          />
        </Typography>

        {errors.questions && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.questions}
          </Alert>
        )}

        {formData.questions.map((question, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Question {index + 1}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!question.required}
                      onChange={e => handleQuestionChange(index, 'required', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Required"
                />
                {formData.questions.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeQuestion(index)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                label="Question Text"
                value={question.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                error={!!errors[`question_${index}`]}
                helperText={errors[`question_${index}`]}
              />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={question.type}
                  label="Question Type"
                  onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {question.type === 'multiple-choice' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Options:
                </Typography>
                {errors[`question_${index}_options`] && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors[`question_${index}_options`]}
                  </Alert>
                )}
                {question.options.map((option, optionIndex) => (
                  <Box key={optionIndex} display="flex" gap={1} mb={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                    />
                    {question.options.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeOption(index, optionIndex)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addOption(index)}
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              </Box>
            )}
          </Paper>
        ))}

        {formData.questions.length < 5 && (
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addQuestion}
            sx={{ mb: 4 }}
          >
            Add Question
          </Button>
        )}

        <Divider sx={{ mb: 4 }} />

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Preview />}
            onClick={handlePreview}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              isEditing ? 'Update Form' : 'Create Form'
            )}
          </Button>
        </Box>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="sm" fullWidth>
          <DialogTitle>Form Preview</DialogTitle>
          <DialogContent dividers>
            <Box mb={2}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {formData.title || 'Untitled Form'}
              </Typography>
              {formData.description && (
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {formData.description}
                </Typography>
              )}
            </Box>
            {formData.questions.map((question, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Q{idx + 1}: {question.question || <span style={{color:'red'}}>No question text</span>}
                  {question.required && <Chip label="Required" size="small" color="primary" sx={{ ml: 1 }} />}
                </Typography>
                {question.type === 'text' ? (
                  <TextField
                    fullWidth
                    label="Your Answer"
                    variant="outlined"
                    disabled
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Box sx={{ mt: 1 }}>
                    {question.options.map((option, optionIdx) => (
                      <Box key={optionIdx} display="flex" alignItems="center" mb={1}>
                        <input type="radio" disabled style={{ marginRight: 8 }} />
                        <Typography variant="body2">{option || <span style={{color:'red'}}>No option text</span>}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default FormBuilder;
