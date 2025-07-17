export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = 'Form title is required';
  }

  if (!formData.questions || formData.questions.length < 3 || formData.questions.length > 5) {
    errors.questions = 'Form must have between 3 and 5 questions';
  }

  if (formData.questions) {
    formData.questions.forEach((question, index) => {
      if (!question.question?.trim()) {
        errors[`question_${index}`] = 'Question text is required';
      }
      
      if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
        errors[`question_${index}_options`] = 'Multiple choice questions must have at least 2 options';
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateFormResponse = (form, answers) => {
  const errors = {};
  
  if (!form || !form.questions) {
    return { isValid: false, errors: { form: 'Invalid form' } };
  }

  const requiredQuestions = form.questions.filter(q => q.required);
  
  requiredQuestions.forEach(question => {
    const answer = answers.find(a => a.questionId === question._id);
    if (!answer || !answer.answer || (typeof answer.answer === 'string' && !answer.answer.trim())) {
      errors[question._id] = 'This field is required';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export const downloadCSV = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
