import React from 'react';
import { useAppStore } from '../store/appStore';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Link,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  GitHub,
  LinkedIn,
  Twitter,
  Launch,
  School,
  AutoStories,
  Psychology,
} from '@mui/icons-material';

export const AboutView: React.FC = () => {
  const { setSelectedView } = useAppStore();
  
  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const navigateToDocumentation = () => {
    setSelectedView('documentation');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* App Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem',
          }}
        >
          CQ
        </Avatar>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          CritiqueQuest
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          AI-Powered Case Study Generator
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <em>&ldquo;Every case, a new discovery&rdquo;</em>
        </Typography>
        
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
          <Chip icon={<School />} label="Education" color="primary" variant="outlined" />
          <Chip icon={<AutoStories />} label="Case Studies" color="secondary" variant="outlined" />
          <Chip icon={<Psychology />} label="AI-Powered" color="success" variant="outlined" />
        </Stack>
      </Box>

      {/* App Description */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            About CritiqueQuest
          </Typography>
          <Typography variant="body1" paragraph>
            CritiqueQuest empowers educators and students to create high-quality, AI-generated case 
            studies for educational purposes. Whether you&rsquo;re a lecturer developing engaging scenarios 
            for your students or a student practicing critical thinking skills, CritiqueQuest transforms 
            learning concepts into compelling case studies in minutes.
          </Typography>
          <Typography variant="body1" paragraph>
            With support for both cloud-based AI services (OpenAI GPT-4, Google Gemini, Anthropic Claude) 
            and local models through Ollama, it offers flexibility between convenience and complete privacy.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Key Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" component="li">
                🤖 Multi-Provider AI Support
              </Typography>
              <Typography variant="body2" component="li">
                🔒 Privacy-First Local AI Option
              </Typography>
              <Typography variant="body2" component="li">
                📚 Local Content Library
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" component="li">
                🎮 Interactive Practice Mode
              </Typography>
              <Typography variant="body2" component="li">
                📄 Multiple Export Formats
              </Typography>
              <Typography variant="body2" component="li">
                💾 Offline-First Design
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Developer Information */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Developer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mr: 2,
                bgcolor: 'secondary.main',
              }}
            >
              MB
            </Avatar>
            <Box>
              <Typography variant="h6">
                Michael Borck
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Software Developer & Educator
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph>
            CritiqueQuest is developed by Michael Borck, passionate about creating tools that enhance 
            education through technology. With a focus on making learning more engaging and accessible, 
            this project combines AI innovation with practical educational needs.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Twitter />}
              onClick={() => openExternalLink('https://twitter.com/Michael_Borck')}
              size="small"
            >
              Follow on X
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkedIn />}
              onClick={() => openExternalLink('https://www.linkedin.com/in/michaelborck/')}
              size="small"
            >
              LinkedIn Profile
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Project Links */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Project & Community
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                startIcon={<GitHub />}
                endIcon={<Launch />}
                onClick={() => openExternalLink('https://github.com/michael-borck/critique-quest')}
                fullWidth
                sx={{ mb: 2 }}
              >
                View on GitHub
              </Button>
              <Typography variant="body2" color="textSecondary">
                Contribute, report issues, or star the repository
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                • <Link href="#" color="primary" onClick={navigateToDocumentation}>Documentation</Link>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                • <Link 
                    href="#" 
                    color="primary"
                    onClick={() => openExternalLink('https://github.com/michael-borck/critique-quest/issues')}
                  >
                    Report Issues
                  </Link>
              </Typography>
              <Typography variant="body2" component="div">
                • <Link 
                    href="#" 
                    color="primary"
                    onClick={() => openExternalLink('https://github.com/michael-borck/critique-quest/discussions')}
                  >
                    Community Discussions
                  </Link>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
        <Typography variant="body2" color="textSecondary">
          CritiqueQuest v1.0.7 • Built with ❤️ for Education
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Licensed under MIT License • Open Source & Free
        </Typography>
      </Box>
    </Box>
  );
};