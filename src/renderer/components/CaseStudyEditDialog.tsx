import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tabs,
  Tab,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit,
  Save,
  Close,
  Preview,
  Sync,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getCategories } from '../../shared/conceptDatabase';
import type { CaseStudy } from '../../shared/types';

interface CaseStudyEditDialogProps {
  open: boolean;
  onClose: () => void;
  caseStudy: CaseStudy | null;
  onSave?: (updatedCase: CaseStudy) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export const CaseStudyEditDialog: React.FC<CaseStudyEditDialogProps> = ({
  open,
  onClose,
  caseStudy,
  onSave,
}) => {
  const { saveCase } = useAppStore();
  const [tabValue, setTabValue] = useState(0);
  const [editedCase, setEditedCase] = useState<CaseStudy | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Available options for dropdowns
  const categories = getCategories();
  const complexities = ['Beginner', 'Intermediate', 'Advanced'];
  const scenarioTypes = ['Problem-solving', 'Decision-making', 'Ethical Dilemma', 'Strategic Planning'];

  useEffect(() => {
    if (caseStudy) {
      setEditedCase({ ...caseStudy });
      setError('');
    }
  }, [caseStudy]);

  const handleFieldChange = (field: keyof CaseStudy, value: any) => {
    if (!editedCase) return;
    
    setEditedCase(prev => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleTagsChange = (newTags: string[]) => {
    if (!editedCase) return;
    
    setEditedCase(prev => ({
      ...prev!,
      tags: newTags,
    }));
  };

  const handleSave = async () => {
    if (!editedCase) return;
    
    setSaving(true);
    setError('');
    
    try {
      // Update word count based on content
      const updatedCase: CaseStudy = {
        ...editedCase,
        word_count: editedCase.content.split(' ').filter(word => word.trim().length > 0).length,
        modified_date: new Date().toISOString(),
      };
      
      await saveCase(updatedCase);
      
      if (onSave) {
        onSave(updatedCase);
      }
      
      onClose();
    } catch (err) {
      console.error('Failed to save case study:', err);
      setError('Failed to save case study. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTabValue(0);
    setError('');
    onClose();
  };

  if (!editedCase) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit color="primary" />
          <Typography variant="h6">Edit Case Study</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Basic Info" />
            <Tab label="Content" />
            <Tab label="Questions" />
            <Tab label="Preview" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={editedCase.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                variant="outlined"
                helperText="Clear, descriptive title for the case study"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editedCase.domain}
                  label="Category"
                  onChange={(e) => handleFieldChange('domain', e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Complexity</InputLabel>
                <Select
                  value={editedCase.complexity}
                  label="Complexity"
                  onChange={(e) => handleFieldChange('complexity', e.target.value)}
                >
                  {complexities.map(complexity => (
                    <MenuItem key={complexity} value={complexity}>{complexity}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Scenario Type</InputLabel>
                <Select
                  value={editedCase.scenario_type}
                  label="Scenario Type"
                  onChange={(e) => handleFieldChange('scenario_type', e.target.value)}
                >
                  {scenarioTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={editedCase.tags || []}
                onChange={(_, newValue) => handleTagsChange(newValue)}
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
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags (press Enter to add)"
                    helperText="Keywords that describe this case study"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedCase.is_favorite || false}
                    onChange={(e) => handleFieldChange('is_favorite', e.target.checked)}
                  />
                }
                label="Mark as favorite"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TextField
            fullWidth
            multiline
            minRows={15}
            maxRows={25}
            label="Case Study Content"
            value={editedCase.content}
            onChange={(e) => handleFieldChange('content', e.target.value)}
            variant="outlined"
            helperText="The main case study content. You can use markdown formatting."
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body2" color="textSecondary">
            Current word count: {editedCase.content.split(' ').filter(word => word.trim().length > 0).length} words
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TextField
            fullWidth
            multiline
            minRows={8}
            maxRows={15}
            label="Analysis Questions"
            value={editedCase.questions}
            onChange={(e) => handleFieldChange('questions', e.target.value)}
            variant="outlined"
            helperText="Questions for students to analyze. Each question should be on a new line."
            sx={{ mb: 2 }}
          />

          {editedCase.answers && (
            <TextField
              fullWidth
              multiline
              minRows={8}
              maxRows={15}
              label="Model Answers (Optional)"
              value={editedCase.answers}
              onChange={(e) => handleFieldChange('answers', e.target.value)}
              variant="outlined"
              helperText="Suggested answers or key points. This will be shown after practice completion."
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editedCase.title}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip label={editedCase.domain} size="small" sx={{ mr: 1 }} />
              <Chip label={editedCase.complexity} size="small" sx={{ mr: 1 }} />
              <Chip label={editedCase.scenario_type} size="small" />
            </Box>

            <Typography variant="body2" sx={{ mb: 2, color: 'textSecondary' }}>
              {editedCase.content.split(' ').filter(word => word.trim().length > 0).length} words
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Case Study Content
            </Typography>
            <Box sx={{ 
              p: 2, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              <MarkdownRenderer content={editedCase.content} />
            </Box>
          </Box>

          {editedCase.questions && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Questions
              </Typography>
              <Box sx={{ 
                p: 2, 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1,
                backgroundColor: 'grey.50'
              }}>
                <MarkdownRenderer content={editedCase.questions} />
              </Box>
            </Box>
          )}

          {editedCase.answers && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Model Answers
              </Typography>
              <Box sx={{ 
                p: 2, 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1,
                backgroundColor: 'grey.50'
              }}>
                <MarkdownRenderer content={editedCase.answers} />
              </Box>
            </Box>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} startIcon={<Close />}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
          startIcon={saving ? <Sync /> : <Save />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};