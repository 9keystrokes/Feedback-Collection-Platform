import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Create,
  Analytics,
  Share,
  Dashboard as DashboardIcon,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Create color="primary" />,
      title: 'Create Custom Forms',
      description: 'Build forms with text and multiple-choice questions tailored to your needs.',
    },
    {
      icon: <Share color="primary" />,
      title: 'Share Public Links',
      description: 'Generate shareable URLs for easy access without requiring user registration.',
    },
    {
      icon: <Analytics color="primary" />,
      title: 'View Analytics',
      description: 'Get insights from responses with detailed analytics and summary views.',
    },
  ];

  const benefits = [
    'Easy form creation with drag-and-drop interface',
    'Real-time response collection',
    'Export responses as CSV files',
    'Mobile-responsive design',
    'Secure and reliable platform',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={8}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Feedback Collection Platform
        </Typography>
        
        <Typography
          variant="h5"
          component="h2"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
        >
          Create, share, and analyze feedback forms with ease. 
          Perfect for businesses looking to collect valuable customer insights.
        </Typography>

        {isAuthenticated ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2, py: 1.5, px: 4 }}
          >
            Go to Dashboard
          </Button>
        ) : (
          <Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2, py: 1.5, px: 4 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ py: 1.5, px: 4 }}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Box mb={8}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Powerful Features
        </Typography>
        
        <Grid columns={12} columnSpacing={4}>
          {features.map((feature, index) => (
            <Grid key={index} sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Benefits Section */}
      <Box mb={8}>
        <Grid columns={12} columnSpacing={6} alignItems="center">
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Why Choose Our Platform?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Our feedback collection platform is designed with simplicity and power in mind. 
              Whether you're a small business or a large enterprise, we have the tools you need.
            </Typography>
            <List>
              {benefits.map((benefit, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
