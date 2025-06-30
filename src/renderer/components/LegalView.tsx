import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  Gavel,
  Security,
  Assignment,
  OpenInNew,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`legal-tabpanel-${index}`}
      aria-labelledby={`legal-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const LegalView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const majorDependencies = [
    {
      name: 'Electron',
      version: '26.2.1',
      license: 'MIT',
      purpose: 'Cross-platform desktop application framework',
      copyright: 'Copyright (c) 2013-2020 GitHub Inc.',
      url: 'https://www.electronjs.org/',
    },
    {
      name: 'React',
      version: '18.2.0',
      license: 'MIT',
      purpose: 'User interface library',
      copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
      url: 'https://reactjs.org/',
    },
    {
      name: 'TypeScript',
      version: '5.2.2',
      license: 'Apache 2.0',
      purpose: 'Type-safe JavaScript development',
      copyright: 'Copyright (c) Microsoft Corporation.',
      url: 'https://www.typescriptlang.org/',
    },
    {
      name: 'Material-UI (MUI)',
      version: '5.14.11',
      license: 'MIT',
      purpose: 'React component library',
      copyright: 'Copyright (c) 2014 Call-Em-All',
      url: 'https://mui.com/',
    },
    {
      name: 'OpenAI SDK',
      version: '4.11.1',
      license: 'MIT',
      purpose: 'OpenAI API integration',
      copyright: 'Copyright (c) 2022 OpenAI',
      url: 'https://github.com/openai/openai-node',
    },
    {
      name: 'Zustand',
      version: '4.4.1',
      license: 'MIT',
      purpose: 'Lightweight state management',
      copyright: 'Copyright (c) 2019 Paul Henschel',
      url: 'https://github.com/pmndrs/zustand',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Legal Information
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Licenses, Compliance, and Legal Notices
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="legal information tabs">
            <Tab icon={<Gavel />} label="License" />
            <Tab icon={<Assignment />} label="Open Source" />
            <Tab icon={<Security />} label="Privacy & Terms" />
          </Tabs>
        </Box>

        {/* License Tab */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              MIT License
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              CritiqueQuest is released under the MIT License
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              The MIT License is a permissive license that allows for reuse within proprietary software 
              provided all copies include the license and copyright notice.
            </Alert>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent sx={{ bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
{`MIT License

Copyright (c) 2024 CritiqueQuest Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
                </Typography>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              endIcon={<OpenInNew />}
              onClick={() => openExternalLink('https://github.com/michael-borck/critique-quest/blob/main/LICENSE')}
            >
              View Full License on GitHub
            </Button>
          </CardContent>
        </TabPanel>

        {/* Open Source Tab */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Open Source Acknowledgments
            </Typography>
            <Typography variant="body1" paragraph>
              CritiqueQuest is built on the shoulders of giants. We are deeply grateful to the open 
              source community and the following projects that make CritiqueQuest possible.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Major Dependencies
            </Typography>
            
            {majorDependencies.map((dep, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {dep.name}
                    </Typography>
                    <Chip label={dep.license} size="small" color="primary" />
                    <Typography variant="body2" color="textSecondary">
                      v{dep.version}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    {dep.purpose}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {dep.copyright}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<OpenInNew />}
                    onClick={() => openExternalLink(dep.url)}
                  >
                    View Project
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Complete Acknowledgments
            </Typography>
            <Typography variant="body2" paragraph>
              For a comprehensive list of all dependencies, licenses, and acknowledgments, please 
              refer to our detailed acknowledgments file.
            </Typography>
            
            <Button
              variant="outlined"
              endIcon={<OpenInNew />}
              onClick={() => openExternalLink('https://github.com/michael-borck/critique-quest/blob/main/ACKNOWLEDGMENTS.md')}
            >
              View Complete Acknowledgments
            </Button>
          </CardContent>
        </TabPanel>

        {/* Privacy & Terms Tab */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Privacy & Terms
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Privacy-First Design:</strong> CritiqueQuest prioritizes your privacy with local 
                data storage and optional offline AI models.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom>
              Data Storage & Privacy
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Local Data Storage"
                  secondary="All case studies, collections, and preferences are stored locally on your device"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="No Analytics Tracking"
                  secondary="CritiqueQuest does not collect usage analytics or personal data"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Optional Cloud AI"
                  secondary="AI features can use cloud services (OpenAI, etc.) or run entirely offline with Ollama"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="User Control"
                  secondary="You maintain full control over your data with export and backup capabilities"
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Third-Party Services
            </Typography>
            <Typography variant="body2" paragraph>
              When using cloud AI services, your case study generation requests are sent to the 
              respective AI providers (OpenAI, Google, Anthropic). Please review their privacy 
              policies for information on how they handle data:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText>
                  <Link href="#" onClick={() => openExternalLink('https://openai.com/privacy/')}>
                    OpenAI Privacy Policy
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  <Link href="#" onClick={() => openExternalLink('https://policies.google.com/privacy')}>
                    Google Privacy Policy
                  </Link>
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  <Link href="#" onClick={() => openExternalLink('https://www.anthropic.com/privacy')}>
                    Anthropic Privacy Policy
                  </Link>
                </ListItemText>
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Terms of Use
            </Typography>
            <Typography variant="body2" paragraph>
              CritiqueQuest is provided &ldquo;as is&rdquo; under the MIT License. By using this software, 
              you agree to use it responsibly and in compliance with applicable laws and regulations.
            </Typography>
            
            <Typography variant="body2" paragraph>
              The software is intended for educational purposes. Users are responsible for ensuring 
              that their use of AI-generated content complies with their institution&rsquo;s policies 
              and academic integrity requirements.
            </Typography>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Educational Use:</strong> Always review and verify AI-generated content for 
                accuracy and appropriateness before use in educational settings.
              </Typography>
            </Alert>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
        <Typography variant="body2" color="textSecondary">
          For questions about licensing or legal matters, please contact us through our{' '}
          <Link href="#" onClick={() => openExternalLink('https://github.com/michael-borck/critique-quest')}>
            GitHub repository
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};