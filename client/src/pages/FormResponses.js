import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Pagination,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Refresh,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { responsesAPI } from '../services/api';
import { formatDate, downloadCSV } from '../utils/validation';

const FormResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id, currentPage, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        // Fetch individual responses
        const responsesData = await responsesAPI.getFormResponses(id, currentPage);
        setResponses(responsesData.data.responses || []);
        setPagination(responsesData.data.pagination || {});
        setForm(responsesData.data.form || null);
        setSummary(null); // clear summary when switching to responses
      } else {
        // Fetch summary
        const summaryData = await responsesAPI.getFormSummary(id);
        setSummary(summaryData.data || null);
        setForm((summaryData.data && summaryData.data.form) || null);
        setResponses([]); // clear responses when switching to summary
      }
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleExport = async () => {
    try {
      const response = await responsesAPI.exportFormResponses(id);
      downloadCSV(response.data, `${form?.title || 'form'}-responses.csv`);
    } catch (err) {
      setError('Failed to export responses');
      console.error('Error exporting responses:', err);
    }
  };

  const renderResponsesTable = () => {
    if (!form || !Array.isArray(form.questions) || !Array.isArray(responses) || responses.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No responses yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share your form to start collecting feedback
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Submitted</TableCell>
                {form.questions.map((question, index) => (
                  <TableCell key={question._id}>
                    Q{index + 1}: {question.question.substring(0, 30)}
                    {question.question.length > 30 && '...'}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response._id}>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(response.submittedAt)}
                    </Typography>
                  </TableCell>
                  {form.questions.map((question) => {
                    const answer = response.answers.find(
                      a => a.questionId === question._id
                    );
                    return (
                      <TableCell key={question._id}>
                        <Typography variant="body2">
                          {answer?.answer || '-'}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };

  const renderSummary = () => {
    if (!summary) {
      return (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (summary.totalResponses === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No responses to analyze yet
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Overview Card */}
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Box display="flex" gap={4}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {summary.totalResponses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Responses
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="secondary">
                    {summary.questionSummaries.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Question Summaries */}
        {summary.questionSummaries.map((questionSummary, index) => (
          <Grid xs={12} sm={6} key={questionSummary.questionId}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Q{index + 1}: {questionSummary.question}
                </Typography>
                <Box display="flex" gap={2} mb={2}>
                  <Chip
                    label={`${questionSummary.totalResponses} responses`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`${questionSummary.responseRate}% response rate`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                {questionSummary.type === 'multiple-choice' ? (
                  <Box>
                    {questionSummary.options.map((option) => (
                      <Box key={option} display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">{option}</Typography>
                        <Chip
                          label={questionSummary.optionCounts[option] || 0}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Responses:
                    </Typography>
                    <List dense>
                      {questionSummary.responses.slice(0, 5).map((response, idx) => (
                        <ListItem key={idx} sx={{ pl: 0 }}>
                          <ListItemText
                            primary={response}
                            primaryTypographyProps={{
                              variant: 'body2',
                              style: { fontStyle: 'italic' }
                            }}
                          />
                        </ListItem>
                      ))}
                      {questionSummary.responses.length > 5 && (
                        <ListItem sx={{ pl: 0 }}>
                          <ListItemText
                            primary={`... and ${questionSummary.responses.length - 5} more`}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.secondary'
                            }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading && !form) {
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Form Responses
            </Typography>
            {form && (
              <Typography variant="h6" color="text.secondary">
                {form.title}
              </Typography>
            )}
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={!form || responses.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          <Tab label="Individual Responses" />
          <Tab label="Summary & Analytics" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : activeTab === 0 ? (
            renderResponsesTable()
          ) : (
            renderSummary()
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default FormResponses;
