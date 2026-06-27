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
import { ExpandMore, Save, Key, MenuBook } from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import { documentationService } from '../services/documentationService';

interface OllamaModel {
  name: string;
  size?: number;
  modified_at?: string;
}

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
  const { preferences, loadPreferences } = useAppStore();
  const [tabValue, setTabValue] = useState(0);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    google: '',
    anthropic: '',
    'openai-compatible': '',
  });
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('');
  const [ollamaConfig, setOllamaConfig] = useState({
    endpoint: 'http://localhost:11434',
    bearer: '',
    models: [] as OllamaModel[],
    selectedModel: 'llama2',
  });
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    default_ai_provider: 'openai',
    default_ai_model: 'gpt-4',
    default_home_page: 'generation',
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
      setApiKeys({
        openai: preferences.api_keys?.openai || '',
        google: preferences.api_keys?.google || '',
        anthropic: preferences.api_keys?.anthropic || '',
        'openai-compatible': preferences.api_keys?.['openai-compatible'] || ''
      });
      setOpenaiBaseUrl(preferences.openai_base_url || '');
      setGeneralSettings({
        theme: preferences.theme || 'light',
        default_ai_provider: preferences.default_ai_provider || 'openai',
        default_ai_model: preferences.default_ai_model || 'gpt-4',
        default_home_page: preferences.default_home_page || 'generation',
      });
      setDefaultGeneration({
        domain: preferences.default_generation_settings?.domain || 'Business & Management',
        complexity: preferences.default_generation_settings?.complexity || 'Intermediate',
        scenario_type: preferences.default_generation_settings?.scenario_type || 'Problem-solving',
        length_preference: preferences.default_generation_settings?.length_preference || 'Medium'
      });
      setOllamaConfig(prev => ({
        ...prev,
        endpoint: preferences.ollama_endpoint || 'http://localhost:11434',
        bearer: preferences.ollama_bearer || '',
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
      await window.electronAPI.setPreference('openai_base_url', openaiBaseUrl);
      await window.electronAPI.setPreference('default_generation_settings', defaultGeneration);
      await window.electronAPI.setPreference('ollama_endpoint', ollamaConfig.endpoint);
      await window.electronAPI.setPreference('ollama_bearer', ollamaConfig.bearer);
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

  const handlePreferenceChange = async (key: string, value: string | number | boolean | object) => {
    try {
      await window.electronAPI.setPreference(key, value);
      await loadPreferences(); // Reload to update global state
    } catch (error) {
      console.error(`Failed to save preference ${key}:`, error);
    }
  };

  // A provider counts as configured when a key is stored. The web server
  // exposes only a presence flag (not the value), so "Test" must work even
  // when the masked key field is empty.
  const isProviderConfigured = (provider: string): boolean =>
    !!preferences?.api_keys_configured?.[provider] || !!preferences?.api_keys?.[provider];

  const handleTestConnection = async (provider: string) => {
    try {
      let result = false;
      if (provider === 'ollama') {
        result = await window.electronAPI.testConnection('ollama', ollamaConfig.bearer || undefined, ollamaConfig.endpoint);
      } else {
        const apiKey = apiKeys[provider as keyof typeof apiKeys];
        if (!apiKey && !isProviderConfigured(provider)) {
          alert('Please enter an API key first');
          return;
        }
        const endpoint = provider === 'openai-compatible' ? (openaiBaseUrl || undefined) : undefined;
        // Empty field + configured key → server resolves the stored key.
        result = await window.electronAPI.testConnection(provider, apiKey || undefined, endpoint);
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
      const models = await window.electronAPI.getOllamaModels(ollamaConfig.endpoint, ollamaConfig.bearer || undefined);
      setOllamaConfig(prev => ({ ...prev, models }));
      alert(`✅ Loaded ${models.length} models from Ollama`);
    } catch (error) {
      alert(`❌ Failed to load models: ${error}`);
    }
  };

  const handleRestoreDocumentation = async () => {
    const confirmed = window.confirm(
      'This will restore all documentation to default content. Any customizations will be lost. Continue?'
    );
    
    if (confirmed) {
      try {
        await documentationService.restoreDefaultDocumentation();
        alert('✅ Documentation restored to defaults successfully!');
      } catch (error) {
        console.error('Failed to restore documentation:', error);
        alert('❌ Failed to restore documentation. Please try again.');
      }
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
                onChange={async (e) => {
                  const newTheme = e.target.value;
                  setGeneralSettings(prev => ({ ...prev, theme: newTheme }));
                  // Apply theme immediately
                  await handlePreferenceChange('theme', newTheme);
                }}
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
              control={
                <Switch 
                  checked={preferences?.enable_high_contrast || false}
                  onChange={(e) => handlePreferenceChange('enable_high_contrast', e.target.checked)}
                />
              }
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
                  disabled={!apiKeys.openai && !isProviderConfigured('openai')}
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
                  disabled={!apiKeys.google && !isProviderConfigured('google')}
                >
                  Test Connection
                </Button>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Key sx={{ mr: 1 }} />
                  <Typography>OpenAI-Compatible Configuration</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Connect to any OpenAI-compatible API (LM Studio, vLLM, OpenRouter, Groq, Together, etc.) by entering its base URL and key.
                </Typography>
                <TextField
                  fullWidth
                  label="Base URL"
                  value={openaiBaseUrl}
                  onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                  placeholder="https://openrouter.ai/api/v1"
                  sx={{ mb: 2 }}
                  helperText="The provider's OpenAI-compatible endpoint, ending in /v1"
                />
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={apiKeys['openai-compatible'] || ''}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, 'openai-compatible': e.target.value }))}
                  placeholder="sk-..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Model"
                  value={generalSettings.default_ai_model}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, default_ai_model: e.target.value }))}
                  placeholder="e.g. anthropic/claude-3.5-sonnet"
                  sx={{ mb: 2 }}
                  helperText="The exact model id this server expects (used when this provider is selected)"
                />
                <Button
                  variant="outlined"
                  onClick={() => handleTestConnection('openai-compatible')}
                  disabled={(!apiKeys['openai-compatible'] && !isProviderConfigured('openai-compatible')) || !openaiBaseUrl}
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
                  disabled={!apiKeys.anthropic && !isProviderConfigured('anthropic')}
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
                  helperText="Local default: http://localhost:11434 — or the URL of a remote Ollama"
                />

                <TextField
                  fullWidth
                  label="Bearer Token (optional)"
                  type="password"
                  value={ollamaConfig.bearer}
                  onChange={(e) => setOllamaConfig(prev => ({ ...prev, bearer: e.target.value }))}
                  placeholder="Only needed for a remote Ollama behind an auth proxy"
                  sx={{ mb: 2 }}
                  helperText="Leave blank for a local Ollama"
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
                          {model.name} ({((model.size || 0) / 1024 / 1024 / 1024).toFixed(1)}GB)
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
                  <MenuItem value="openai-compatible">OpenAI-Compatible</MenuItem>
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

            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>Complete Privacy:</strong> CritiqueQuest stores all your data locally on your device. No data leaves your device.
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Local Data Storage
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Your case studies, collections, preferences, and AI usage data are stored in a local JSON database on your device. 
                This ensures complete privacy and works offline.
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
                Local Usage Tracking
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Track your own usage patterns to understand your learning and content creation habits. 
                All data stays on your device.
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Track AI usage (tokens, costs, providers)"
                sx={{ mb: 1, display: 'block' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Track practice sessions and case study usage"
                sx={{ mb: 1, display: 'block' }}
              />
              <Typography variant="caption" color="textSecondary">
                💡 This helps you see which case studies are most popular and track your AI usage costs.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                AI-Enhanced Features
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Configure AI-powered enhancements for your learning experience. These features use your configured AI provider 
                and will only work when AI is properly set up.
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={preferences?.enable_practice_ai_analysis || false}
                    onChange={(e) => handlePreferenceChange('enable_practice_ai_analysis', e.target.checked)}
                  />
                }
                label="Enable AI practice analysis and feedback"
                sx={{ mb: 1, display: 'block' }}
              />
              <Typography variant="caption" color="textSecondary">
                💡 Get personalized AI feedback on your practice sessions including content analysis, suggestions for improvement, and learning insights.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle1" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                These actions cannot be undone. Please make sure you have exported your data before proceeding.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  color="warning" 
                  onClick={handleRestoreDocumentation}
                  startIcon={<MenuBook />}
                >
                  Restore Default Documentation
                </Button>
                <Button variant="outlined" color="error">
                  Clear All Data
                </Button>
                <Button variant="outlined" color="error">
                  Reset to Defaults
                </Button>
              </Box>
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