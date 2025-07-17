import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Share,
  Analytics,
  ContentCopy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formsAPI } from '../services/api';
import { formatDate } from '../utils/validation';

const Dashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, form: null });
  const [shareDialog, setShareDialog] = useState({ open: false, form: null });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formsAPI.getForms();
      setForms(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load forms');
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId) => {
    try {
      await formsAPI.deleteForm(formId);
      setForms(forms.filter(form => form._id !== formId));
      setDeleteDialog({ open: false, form: null });
    } catch (err) {
      setError('Failed to delete form');
      console.error('Error deleting form:', err);
    }
  };

  const handleCopyLink = (publicId) => {
    const link = `${window.location.origin}/form/${publicId}`;
    navigator.clipboard.writeText(link).then(() => {
      // You could add a snackbar notification here
      console.log('Link copied to clipboard');
    });
  };

  const getFormUrl = (publicId) => {
    return `${window.location.origin}/form/${publicId}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          My Forms
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/form-builder')}
          size="large"
        >
          Create New Form
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {forms.length === 0 ? (
        <Box
          textAlign="center"
          sx={{
            py: 8,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No forms created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first feedback form to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/form-builder')}
          >
            Create Your First Form
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form) => (
            <Grid item xs={12} md={6} lg={4} key={form._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {form.title}
                    </Typography>
                    <Chip
                      label={form.isActive ? 'Active' : 'Inactive'}
                      color={form.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {form.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {form.description.length > 100
                        ? `${form.description.substring(0, 100)}...`
                        : form.description
                      }
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Questions: {form.questions?.length || 0}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Responses: {form.responseCount || 0}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(form.createdAt)}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Tooltip title="View Responses">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/form-responses/${form._id}`)}
                      color="primary"
                    >
                      <Analytics />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit Form">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/form-builder/${form._id}`)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Share Form">
                    <IconButton
                      size="small"
                      onClick={() => setShareDialog({ open: true, form })}
                      color="primary"
                    >
                      <Share />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Preview Form">
                    <IconButton
                      size="small"
                      onClick={() => window.open(`/form/${form.publicId}`, '_blank')}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Form">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, form })}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, form: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.form?.title}"? 
            This action cannot be undone and will also delete all associated responses.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, form: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteForm(deleteDialog.form._id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={shareDialog.open}
        onClose={() => setShareDialog({ open: false, form: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Form</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Share this link with your audience to collect feedback:
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                flexGrow: 1,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              {shareDialog.form && getFormUrl(shareDialog.form.publicId)}
            </Typography>
            <Tooltip title="Copy Link">
              <IconButton
                size="small"
                onClick={() => handleCopyLink(shareDialog.form?.publicId)}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog({ open: false, form: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
