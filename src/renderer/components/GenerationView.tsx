import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Autocomplete,
  Checkbox,
  ListItemText,
  Divider,
} from '@mui/material';
import { ExpandMore, AutoAwesome, Save, Lightbulb, Casino } from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import type { GenerationInput } from '../../shared/types';
import { 
  getCategories,
  getDisciplinesForCategory,
  getConceptsForDiscipline,
  getAllConceptsForCategory,
  personalSkillsConcepts, 
  getRandomConceptsFromDiscipline,
  getRandomPersonalSkills 
} from '../../shared/conceptDatabase';

export const GenerationView: React.FC = () => {
  const { isGenerating, generateCase, saveCase, currentCase, preferences, loadPreferences } = useAppStore();

  useEffect(() => {
    // Ensure preferences are loaded
    if (!preferences) {
      loadPreferences();
    }
  }, [preferences, loadPreferences]);
  const [input, setInput] = useState<GenerationInput>({
    domain: 'Business & Management',
    complexity: 'Intermediate',
    scenario_type: 'Problem-solving',
    context_setting: '',
    key_concepts: '',
    length_preference: 'Medium',
    custom_prompt: '',
    include_elements: {
      executive_summary: true,
      background: true,
      problem_statement: true,
      supporting_data: false,
      key_characters: true,
      analysis_questions: true,
      learning_objectives: false,
      suggested_solutions: false,
    },
  });
  const [error, setError] = useState<string>('');
  const [isGeneratingContext, setIsGeneratingContext] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Business & Management');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [selectedPersonalSkills, setSelectedPersonalSkills] = useState<string[]>([]);
  const [expertMode, setExpertMode] = useState<boolean>(false);

  const handleInputChange = (field: keyof GenerationInput, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
    
    // Clear domain-specific concepts when domain changes
    if (field === 'domain') {
      setSelectedConcepts([]);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedDiscipline('');
    setSelectedConcepts([]);
    setInput(prev => ({ ...prev, domain: category }));
  };

  const handleDisciplineChange = (discipline: string) => {
    setSelectedDiscipline(discipline);
    setSelectedConcepts([]);
  };

  const handleElementToggle = (element: keyof typeof input.include_elements) => {
    setInput(prev => ({
      ...prev,
      include_elements: {
        ...prev.include_elements,
        [element]: !prev.include_elements[element],
      },
    }));
  };

  const handleGenerate = async () => {
    if (!input.context_setting.trim()) {
      setError('Please provide a context setting for your case study.');
      return;
    }

    setError('');
    try {
      const provider = preferences?.default_ai_provider || 'openai';
      let model = preferences?.default_ai_model || 'gpt-4';
      
      // Use appropriate model for Ollama
      if (provider === 'ollama') {
        model = preferences?.default_ollama_model || preferences?.default_ai_model || 'llama2';
      }
      
      await generateCase(input);
    } catch (err) {
      setError('Failed to generate case study. Please check your AI configuration.');
    }
  };

  const handleSave = async () => {
    if (currentCase) {
      try {
        await saveCase(currentCase);
      } catch (err) {
        setError('Failed to save case study.');
      }
    }
  };

  const handleSuggestContext = async () => {
    setIsGeneratingContext(true);
    setError('');
    
    try {
      const provider = preferences?.default_ai_provider || 'openai';
      let model = preferences?.default_ai_model || 'gpt-4';
      
      // Use appropriate model for Ollama
      if (provider === 'ollama') {
        model = preferences?.default_ollama_model || 'llama2';
      }
      
      const apiKey = provider === 'openai' ? preferences?.api_keys?.openai : undefined;
      const endpoint = provider === 'ollama' ? preferences?.ollama_endpoint : undefined;
      
      const suggestedContext = await window.electronAPI.suggestContext(
        input.domain,
        input.complexity,
        input.scenario_type,
        provider,
        model,
        apiKey,
        endpoint
      );
      
      // Set the suggested context in the input
      setInput(prev => ({ ...prev, context_setting: suggestedContext }));
    } catch (err) {
      setError('Failed to generate context suggestion. Please check your AI configuration.');
    } finally {
      setIsGeneratingContext(false);
    }
  };

  const handleFeelingLucky = async () => {
    // Randomly fill in all empty fields and generate
    const categories = getCategories();
    const complexities = ['Beginner', 'Intermediate', 'Advanced'];
    const scenarioTypes = ['Problem-solving', 'Decision-making', 'Ethical Dilemma', 'Strategic Planning'];
    const lengths = ['Short', 'Medium', 'Long'];

    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomComplexity = complexities[Math.floor(Math.random() * complexities.length)];
    const randomScenarioType = scenarioTypes[Math.floor(Math.random() * scenarioTypes.length)];
    const randomLength = lengths[Math.floor(Math.random() * lengths.length)];

    // Get random discipline from selected category
    const disciplines = getDisciplinesForCategory(randomCategory);
    const randomDiscipline = disciplines[Math.floor(Math.random() * disciplines.length)];

    // Generate random concepts from the selected discipline
    const randomConcepts = getRandomConceptsFromDiscipline(randomCategory, randomDiscipline, 2);
    const randomPersonalSkillsSelected = getRandomPersonalSkills(1);
    const allSelectedConcepts = [...randomConcepts, ...randomPersonalSkillsSelected];

    // Update state
    setInput(prev => ({
      ...prev,
      domain: randomCategory,
      complexity: randomComplexity as 'Beginner' | 'Intermediate' | 'Advanced',
      scenario_type: randomScenarioType as 'Problem-solving' | 'Decision-making' | 'Ethical Dilemma' | 'Strategic Planning',
      length_preference: randomLength as 'Short' | 'Medium' | 'Long',
      key_concepts: allSelectedConcepts.join(', '),
      context_setting: '', // Will be filled by AI suggestion
    }));

    setSelectedCategory(randomCategory);
    setSelectedDiscipline(randomDiscipline);
    setSelectedConcepts(randomConcepts);
    setSelectedPersonalSkills(randomPersonalSkillsSelected);

    // First generate context suggestion, then generate the case study
    try {
      setIsGeneratingContext(true);
      
      const provider = preferences?.default_ai_provider || 'openai';
      let model = preferences?.default_ai_model || 'gpt-4';
      
      // Use appropriate model for Ollama
      if (provider === 'ollama') {
        model = preferences?.default_ollama_model || 'llama2';
      }
      
      const apiKey = provider === 'openai' ? preferences?.api_keys?.openai : undefined;
      const endpoint = provider === 'ollama' ? preferences?.ollama_endpoint : undefined;
      
      const suggestedContext = await window.electronAPI.suggestContext(
        randomCategory,
        randomComplexity,
        randomScenarioType,
        provider,
        model,
        apiKey,
        endpoint
      );
      
      // Create the complete input object with the generated context
      const completeInput: GenerationInput = {
        domain: randomCategory,
        complexity: randomComplexity as 'Beginner' | 'Intermediate' | 'Advanced',
        scenario_type: randomScenarioType as 'Problem-solving' | 'Decision-making' | 'Ethical Dilemma' | 'Strategic Planning',
        length_preference: randomLength as 'Short' | 'Medium' | 'Long',
        key_concepts: allSelectedConcepts.join(', '),
        context_setting: suggestedContext || '',
        custom_prompt: input.custom_prompt,
        include_elements: input.include_elements,
      };
      
      setInput(completeInput);
      setIsGeneratingContext(false);

      // Small delay to let user see the filled fields, then generate directly with complete input
      setTimeout(async () => {
        setError('');
        try {
          await generateCase(completeInput);
        } catch (err) {
          setError('Failed to generate case study. Please check your AI configuration.');
        }
      }, 1000);
    } catch (err) {
      setIsGeneratingContext(false);
      setError('Failed to generate context. Proceeding with manual context required.');
    }
  };

  // Update key_concepts when selected concepts change (only in non-expert mode)
  useEffect(() => {
    if (!expertMode) {
      const allConcepts = [...selectedConcepts, ...selectedPersonalSkills];
      setInput(prev => ({ ...prev, key_concepts: allConcepts.join(', ') }));
    }
  }, [selectedConcepts, selectedPersonalSkills, expertMode]);

  // Get available options for hierarchical selection
  const availableCategories = getCategories();
  const availableDisciplines = getDisciplinesForCategory(selectedCategory);
  const availableConcepts = selectedDiscipline 
    ? getConceptsForDiscipline(selectedCategory, selectedDiscipline)
    : getAllConceptsForCategory(selectedCategory);
  const availablePersonalSkills = personalSkillsConcepts.flatMap(category => category.concepts);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generate Case Study
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="textSecondary">
            Create AI-powered case studies for educational purposes
          </Typography>
          {preferences?.default_ai_provider && (
            <Chip 
              label={`Using: ${preferences.default_ai_provider === 'ollama' ? 'Ollama (Local)' : preferences.default_ai_provider}`}
              color={preferences.default_ai_provider === 'ollama' ? 'success' : 'primary'}
              size="small"
            />
          )}
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={expertMode}
              onChange={(e) => setExpertMode(e.target.checked)}
              color="primary"
            />
          }
          label="Expert Mode"
          sx={{ mr: 0 }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Configuration
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {availableCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Discipline (Optional)</InputLabel>
                  <Select
                    value={selectedDiscipline}
                    label="Discipline (Optional)"
                    onChange={(e) => handleDisciplineChange(e.target.value)}
                    disabled={!selectedCategory}
                  >
                    <MenuItem value="">
                      <em>All Disciplines</em>
                    </MenuItem>
                    {availableDisciplines.map(discipline => (
                      <MenuItem key={discipline} value={discipline}>{discipline}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Complexity</InputLabel>
                  <Select
                    value={input.complexity}
                    label="Complexity"
                    onChange={(e) => handleInputChange('complexity', e.target.value)}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Scenario Type</InputLabel>
                  <Select
                    value={input.scenario_type}
                    label="Scenario Type"
                    onChange={(e) => handleInputChange('scenario_type', e.target.value)}
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
                  <InputLabel>Length</InputLabel>
                  <Select
                    value={input.length_preference}
                    label="Length"
                    onChange={(e) => handleInputChange('length_preference', e.target.value)}
                  >
                    <MenuItem value="Short">Short (500-800 words)</MenuItem>
                    <MenuItem value="Medium">Medium (800-1500 words)</MenuItem>
                    <MenuItem value="Long">Long (1500+ words)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {expertMode ? (
                  <TextField
                    fullWidth
                    label="Context Setting"
                    multiline
                    rows={3}
                    value={input.context_setting}
                    onChange={(e) => handleInputChange('context_setting', e.target.value)}
                    placeholder="Describe the setting, industry, organization, or situation for your case study..."
                  />
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Context Setting"
                        multiline
                        rows={3}
                        value={input.context_setting}
                        onChange={(e) => handleInputChange('context_setting', e.target.value)}
                        placeholder="Describe the setting, industry, organization, or situation for your case study..."
                        disabled={isGeneratingContext}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleSuggestContext}
                        disabled={isGeneratingContext || isGenerating}
                        startIcon={isGeneratingContext ? <CircularProgress size={16} /> : <Lightbulb />}
                        sx={{ 
                          minWidth: 'auto',
                          px: 2,
                          py: 1.5,
                          height: 'fit-content',
                          mt: 0.5,
                          flexShrink: 0
                        }}
                        size="small"
                      >
                        {isGeneratingContext ? 'Generating...' : 'AI Suggest'}
                      </Button>
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                      💡 Need inspiration? Use "AI Suggest" to generate a context based on your selected domain, complexity, and scenario type.
                    </Typography>
                  </>
                )}
              </Grid>

              <Grid item xs={12}>
                {expertMode ? (
                  <TextField
                    fullWidth
                    label="Key Concepts"
                    value={input.key_concepts}
                    onChange={(e) => handleInputChange('key_concepts', e.target.value)}
                    placeholder="Specific theories, frameworks, or concepts to include (e.g., Porter's Five Forces, Emotional Intelligence, SWOT Analysis)..."
                    helperText="Enter any theories, frameworks, or concepts you'd like to incorporate into your case study"
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                      Key Concepts & Theories
                    </Typography>
                    
                    {/* Domain-specific concepts */}
                    <Autocomplete
                      multiple
                      id="domain-concepts"
                      options={availableConcepts}
                      value={selectedConcepts}
                      onChange={(_, newValue) => setSelectedConcepts(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={selectedDiscipline ? `${selectedDiscipline} Concepts` : `${selectedCategory} Concepts`}
                          placeholder="Select relevant theories and frameworks..."
                          sx={{ mb: 2 }}
                          helperText={selectedDiscipline ? `Showing concepts from ${selectedDiscipline}` : `Showing all concepts from ${selectedCategory}`}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                            size="small"
                          />
                        ))
                      }
                    />

                    {/* Personal & Interpersonal Skills */}
                    <Autocomplete
                      multiple
                      id="personal-skills"
                      options={availablePersonalSkills}
                      value={selectedPersonalSkills}
                      onChange={(_, newValue) => setSelectedPersonalSkills(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Personal & Interpersonal Skills"
                          placeholder="Add cross-domain personal skills..."
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                            size="small"
                            color="secondary"
                          />
                        ))
                      }
                    />

                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      💡 Selected concepts will be integrated into your case study. Personal skills apply across all domains.
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>

            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Content Elements</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {Object.entries(input.include_elements).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={() => handleElementToggle(key as keyof typeof input.include_elements)}
                          />
                        }
                        label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Custom Prompt</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={input.custom_prompt}
                  onChange={(e) => handleInputChange('custom_prompt', e.target.value)}
                  placeholder="Additional specific instructions for the AI..."
                />
              </AccordionDetails>
            </Accordion>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={isGenerating || isGeneratingContext}
                startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesome />}
                size="large"
              >
                {isGenerating ? 'Generating...' : 'Generate Case Study'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<Casino />}
                onClick={handleFeelingLucky}
                disabled={isGenerating || isGeneratingContext}
                color="secondary"
                size="large"
              >
                I'm Feeling Lucky
              </Button>

              {currentCase && (
                <Button
                  variant="outlined"
                  onClick={handleSave}
                  startIcon={<Save />}
                  size="large"
                >
                  Save
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Generated Content
            </Typography>

            {isGenerating ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : currentCase ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {currentCase.title}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip label={currentCase.domain} size="small" sx={{ mr: 1 }} />
                  <Chip label={currentCase.complexity} size="small" sx={{ mr: 1 }} />
                  <Chip label={currentCase.scenario_type} size="small" />
                </Box>

                <Typography variant="body2" sx={{ mb: 2, color: 'textSecondary' }}>
                  {currentCase.word_count} words
                </Typography>

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {currentCase.content}
                  </Typography>

                  {currentCase.questions && (
                    <>
                      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        Analysis Questions
                      </Typography>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {currentCase.questions}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography color="textSecondary">
                Configure your case study parameters and click "Generate" to create content.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};