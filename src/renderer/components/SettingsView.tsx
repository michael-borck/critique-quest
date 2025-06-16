import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tabs,
  Tab,
  Divider,
  Grid,
} from '@mui/material';
import { ExpandMore, Save, Key } from '@mui/icons-material';
import { useAppStore } from '../store/appStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const { preferences, setPreferences, loadPreferences } = useAppStore();
  const [tabValue, setTabValue] = useState(0);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    google: '',
    anthropic: '',
  });
  const [ollamaConfig, setOllamaConfig] = useState({
    endpoint: 'http://localhost:11434',
    models: [] as any[],
    selectedModel: 'llama2',
  });
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    default_ai_provider: 'openai',
    default_ai_model: 'gpt-4',
  });
  const [defaultGeneration, setDefaultGeneration] = useState({
    domain: 'Business',
    complexity: 'Intermediate',
    scenario_type: 'Problem-solving',
    length_preference: 'Medium',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    if (preferences) {
      setApiKeys(preferences.api_keys || {});
      setGeneralSettings({
        theme: preferences.theme || 'light',
        default_ai_provider: preferences.default_ai_provider || 'openai',
        default_ai_model: preferences.default_ai_model || 'gpt-4',
      });
      setDefaultGeneration(preferences.default_generation_settings || {
        domain: 'Business',
        complexity: 'Intermediate',
        scenario_type: 'Problem-solving',
        length_preference: 'Medium',
      });
      setOllamaConfig(prev => ({
        ...prev,
        endpoint: preferences.ollama_endpoint || 'http://localhost:11434',
        selectedModel: preferences.default_ollama_model || 'llama2',
      }));
    }
  }, [preferences]);

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      // Save individual preferences
      await window.electronAPI.setPreference('theme', generalSettings.theme);
      await window.electronAPI.setPreference('default_ai_provider', generalSettings.default_ai_provider);
      await window.electronAPI.setPreference('default_ai_model', generalSettings.default_ai_model);
      await window.electronAPI.setPreference('api_keys', apiKeys);
      await window.electronAPI.setPreference('default_generation_settings', defaultGeneration);
      await window.electronAPI.setPreference('ollama_endpoint', ollamaConfig.endpoint);
      await window.electronAPI.setPreference('default_ollama_model', ollamaConfig.selectedModel);

      // Set Ollama endpoint in the service
      await window.electronAPI.setOllamaEndpoint(ollamaConfig.endpoint);

      // Reload preferences to update the global state
      await loadPreferences();

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleTestConnection = async (provider: string) => {
    try {
      let result = false;
      if (provider === 'ollama') {
        result = await window.electronAPI.testConnection('ollama', undefined, ollamaConfig.endpoint);
      } else {
        const apiKey = apiKeys[provider as keyof typeof apiKeys];
        if (!apiKey) {
          alert('Please enter an API key first');
          return;
        }
        result = await window.electronAPI.testConnection(provider, apiKey);
      }
      
      if (result) {
        alert(`✅ Successfully connected to ${provider}`);
      } else {
        alert(`❌ Failed to connect to ${provider}`);
      }
    } catch (error) {
      alert(`❌ Connection test failed: ${error}`);
    }
  };

  const handleLoadOllamaModels = async () => {
    try {
      const models = await window.electronAPI.getOllamaModels(ollamaConfig.endpoint);
      setOllamaConfig(prev => ({ ...prev, models }));
      alert(`✅ Loaded ${models.length} models from Ollama`);
    } catch (error) {
      alert(`❌ Failed to load models: ${error}`);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="General" />
            <Tab label="AI Configuration" />
            <Tab label="Defaults" />
            <Tab label="Data & Privacy" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                value={generalSettings.theme}
                label="Theme"
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, theme: e.target.value }))}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto (System)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Default Home Page</InputLabel>
              <Select
                value={generalSettings.default_home_page || 'generation'}
                label="Default Home Page"
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, default_home_page: e.target.value }))}
              >
                <MenuItem value="generation">Generate Case Study</MenuItem>
                <MenuItem value="library">Library</MenuItem>
                <MenuItem value="practice">Practice</MenuItem>
                <MenuItem value="settings">Settings</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 3, display: 'block' }}>
              💡 Choose which page to show when starting the app. Students typically prefer Library, while Lecturers often prefer Generate Case Study.
            </Typography>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-save generated content"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Show usage statistics"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={<Switch />}
              label="Enable high contrast mode"
              sx={{ mb: 2 }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              AI Provider Configuration
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Configure your AI API keys and default models. Keys are stored securely on your device.
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Key sx={{ mr: 1 }} />
                  <Typography>OpenAI Configuration</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={apiKeys.openai || ''}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                  placeholder="sk-..."
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Default Model</InputLabel>
                  <Select
                    value={generalSettings.default_ai_model}
                    label="Default Model"
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, default_ai_model: e.target.value }))}
                  >
                    <MenuItem value="gpt-4">GPT-4</MenuItem>
                    <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                    <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  onClick={() => handleTestConnection('openai')}
                  disabled={!apiKeys.openai}
                >
                  Test Connection
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Key sx={{ mr: 1 }} />
                  <Typography>Google Gemini Configuration</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={apiKeys.google || ''}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, google: e.target.value }))}
                  placeholder="AI..."
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleTestConnection('google')}
                  disabled={!apiKeys.google}
                >
                  Test Connection
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Key sx={{ mr: 1 }} />
                  <Typography>Anthropic Claude Configuration</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={apiKeys.anthropic || ''}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                  placeholder="sk-ant-..."
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleTestConnection('anthropic')}
                  disabled={!apiKeys.anthropic}
                >
                  Test Connection
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Key sx={{ mr: 1 }} />
                  <Typography>Ollama Configuration (Local AI)</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Use local AI models with Ollama. No API key required, runs entirely on your machine.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Ollama Endpoint"
                  value={ollamaConfig.endpoint}
                  onChange={(e) => setOllamaConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="http://localhost:11434"
                  sx={{ mb: 2 }}
                  helperText="Default: http://localhost:11434"
                />

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleTestConnection('ollama')}
                  >
                    Test Connection
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleLoadOllamaModels}
                  >
                    Load Models
                  </Button>
                </Box>

                {ollamaConfig.models.length > 0 && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Default Model</InputLabel>
                    <Select
                      value={ollamaConfig.selectedModel}
                      label="Default Model"
                      onChange={(e) => setOllamaConfig(prev => ({ ...prev, selectedModel: e.target.value }))}
                    >
                      {ollamaConfig.models.map((model) => (
                        <MenuItem key={model.name} value={model.name}>
                          {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>To use Ollama:</strong><br/>
                    1. Install Ollama from https://ollama.ai<br/>
                    2. Run: <code>ollama pull llama2</code> (or another model)<br/>
                    3. Start Ollama: <code>ollama serve</code><br/>
                    4. Test connection and load models above
                  </Typography>
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Primary AI Provider</InputLabel>
                <Select
                  value={generalSettings.default_ai_provider}
                  label="Primary AI Provider"
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, default_ai_provider: e.target.value }))}
                >
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="google">Google Gemini</MenuItem>
                  <MenuItem value="anthropic">Anthropic Claude</MenuItem>
                  <MenuItem value="ollama">Ollama (Local AI)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Default Generation Settings
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Set default values for case study generation to speed up your workflow.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Domain</InputLabel>
                  <Select
                    value={defaultGeneration.domain}
                    label="Default Domain"
                    onChange={(e) => setDefaultGeneration(prev => ({ ...prev, domain: e.target.value }))}
                  >
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="Social Sciences">Social Sciences</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Complexity</InputLabel>
                  <Select
                    value={defaultGeneration.complexity}
                    label="Default Complexity"
                    onChange={(e) => setDefaultGeneration(prev => ({ ...prev, complexity: e.target.value }))}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Scenario Type</InputLabel>
                  <Select
                    value={defaultGeneration.scenario_type}
                    label="Default Scenario Type"
                    onChange={(e) => setDefaultGeneration(prev => ({ ...prev, scenario_type: e.target.value }))}
                  >
                    <MenuItem value="Problem-solving">Problem-solving</MenuItem>
                    <MenuItem value="Decision-making">Decision-making</MenuItem>
                    <MenuItem value="Ethical Dilemma">Ethical Dilemma</MenuItem>
                    <MenuItem value="Strategic Planning">Strategic Planning</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Length</InputLabel>
                  <Select
                    value={defaultGeneration.length_preference}
                    label="Default Length"
                    onChange={(e) => setDefaultGeneration(prev => ({ ...prev, length_preference: e.target.value }))}
                  >
                    <MenuItem value="Short">Short (500-800 words)</MenuItem>
                    <MenuItem value="Medium">Medium (800-1500 words)</MenuItem>
                    <MenuItem value="Long">Long (1500+ words)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Data & Privacy
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              CritiqueQuest stores all your data locally on your device. No data is sent to our servers.
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Data Storage
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Your case studies, preferences, and usage data are stored in a local SQLite database.
              </Typography>
              <Button variant="outlined" sx={{ mr: 1 }}>
                Export All Data
              </Button>
              <Button variant="outlined">
                View Data Location
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Privacy Settings
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Track usage statistics (local only)"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Send anonymous analytics"
                sx={{ mb: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle1" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Button variant="outlined" color="error" sx={{ mr: 1 }}>
                Clear All Data
              </Button>
              <Button variant="outlined" color="error">
                Reset to Defaults
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            startIcon={<Save />}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </Button>

          {saveStatus === 'saved' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Settings saved successfully!
            </Alert>
          )}

          {saveStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to save settings. Please try again.
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};