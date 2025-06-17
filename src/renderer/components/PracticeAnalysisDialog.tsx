import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  TrendingUp,
  Timer,
  Psychology,
  Assessment,
  Lightbulb,
  Warning,
  AutoAwesome,
} from '@mui/icons-material';
import { 
  PracticeAnalysis, 
  AnswerAnalysis, 
  formatTime, 
  getReadabilityColor, 
  getCompletenessColor 
} from '../../shared/textAnalysis';
import { useAppStore } from '../store/appStore';

interface PracticeAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  analysis: PracticeAnalysis | null;
  caseTitle: string;
}

export const PracticeAnalysisDialog: React.FC<PracticeAnalysisDialogProps> = ({
  open,
  onClose,
  analysis,
  caseTitle,
}) => {
  const { preferences } = useAppStore();
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string>('');

  // Check if AI analysis is available
  useEffect(() => {
    if (preferences?.enable_practice_ai_analysis && 
        (preferences?.default_ai_provider === 'ollama' || preferences?.api_keys?.openai)) {
      setAiAnalysisEnabled(true);
    }
  }, [preferences]);

  const generateAiAnalysis = async () => {
    if (!analysis || !aiAnalysisEnabled) return;
    
    setLoadingAiAnalysis(true);
    setAiAnalysisError('');
    
    try {
      // Create a summary of the practice session for AI analysis
      const practiceContext = {
        caseTitle,
        completionRate: analysis.completionRate,
        totalWordCount: analysis.totalWordCount,
        averageWordsPerAnswer: analysis.averageWordsPerAnswer,
        timeSpent: formatTime(analysis.totalTimeSpent),
        answerSummaries: analysis.answerAnalyses.map(a => ({
          question: a.questionText,
          wordCount: a.metrics.wordCount,
          completeness: a.completeness,
          readabilityLevel: a.metrics.complexityLevel
        }))
      };

      // Get user's AI configuration
      const provider = preferences?.default_ai_provider || 'openai';
      let model = preferences?.default_ai_model || 'gpt-4';
      
      // Use appropriate model for Ollama
      if (provider === 'ollama') {
        model = preferences?.default_ollama_model || 'llama2';
      }
      
      const apiKey = provider === 'openai' ? preferences?.api_keys?.openai : undefined;
      const endpoint = provider === 'ollama' ? preferences?.ollama_endpoint : undefined;

      const response = await window.electronAPI.analyzePracticeSession(
        practiceContext,
        provider,
        model,
        apiKey,
        endpoint
      );
      setAiAnalysis(response || 'AI analysis completed but no specific feedback provided.');
    } catch (error) {
      console.error('Failed to generate AI analysis:', error);
      setAiAnalysisError('Failed to generate AI analysis. Please check your AI configuration.');
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  if (!analysis) return null;

  const getScoreColor = (score: number, max: number) => {
    const percentage = score / max;
    if (percentage >= 0.8) return '#4CAF50';
    if (percentage >= 0.6) return '#FF9800';
    return '#F44336';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" />
          <Typography component="span" variant="h6">Practice Analysis</Typography>
        </Box>
        <Typography component="div" variant="subtitle2" color="textSecondary">
          {caseTitle}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              Performance Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analysis.completionRate}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completion Rate
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={analysis.completionRate} 
                      sx={{ mt: 1 }}
                      color={analysis.completionRate >= 80 ? 'success' : analysis.completionRate >= 60 ? 'warning' : 'error'}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analysis.totalWordCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Words
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Avg: {analysis.averageWordsPerAnswer} per answer
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {formatTime(analysis.totalTimeSpent)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Time Spent
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Avg: {formatTime(analysis.averageTimePerAnswer)} per answer
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {analysis.overallReadabilityScore}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Readability Score
                    </Typography>
                    <Chip 
                      label={analysis.overallComplexityLevel} 
                      size="small" 
                      sx={{ 
                        mt: 1,
                        backgroundColor: getReadabilityColor(analysis.overallReadabilityScore),
                        color: 'white'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Answer-by-Answer Analysis */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology />
              Answer Analysis
            </Typography>
            
            {analysis.answerAnalyses.map((answer, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle1">
                      Question {index + 1}
                    </Typography>
                    <Chip 
                      label={answer.completeness}
                      size="small"
                      sx={{
                        backgroundColor: getCompletenessColor(answer.completeness),
                        color: 'white'
                      }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                      {answer.metrics.wordCount} words • {answer.metrics.complexityLevel}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Question:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {answer.questionText}
                      </Typography>
                      
                      {answer.answer.trim() && (
                        <>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Your Answer:</strong>
                          </Typography>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'grey.50', 
                            borderRadius: 1,
                            maxHeight: 200,
                            overflow: 'auto'
                          }}>
                            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                              {answer.answer}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>Metrics</Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Word Count" 
                            secondary={answer.metrics.wordCount}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Sentences" 
                            secondary={answer.metrics.sentenceCount}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Avg Words/Sentence" 
                            secondary={answer.metrics.averageWordsPerSentence}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Reading Time" 
                            secondary={formatTime(answer.estimatedReadingTime)}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          {/* Insights and Recommendations */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lightbulb />
              Insights & Recommendations
            </Typography>
            
            <Grid container spacing={2}>
              {analysis.summary.strengths.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle />
                        Strengths
                      </Typography>
                      <List dense>
                        {analysis.summary.strengths.map((strength, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={strength} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {analysis.summary.suggestions.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning />
                        Suggestions
                      </Typography>
                      <List dense>
                        {analysis.summary.suggestions.map((suggestion, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Warning color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={suggestion} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* AI Analysis Section */}
          {aiAnalysisEnabled && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome />
                AI-Powered Analysis
              </Typography>
              
              {!aiAnalysis && !loadingAiAnalysis && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Get personalized feedback and deeper insights about your practice session using AI analysis.
                </Alert>
              )}
              
              {aiAnalysisError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {aiAnalysisError}
                </Alert>
              )}
              
              {!aiAnalysis && !loadingAiAnalysis && (
                <Button
                  variant="outlined"
                  onClick={generateAiAnalysis}
                  startIcon={<AutoAwesome />}
                  sx={{ mb: 2 }}
                >
                  Generate AI Analysis
                </Button>
              )}
              
              {loadingAiAnalysis && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Generating AI analysis...</Typography>
                </Box>
              )}
              
              {aiAnalysis && (
                <Card>
                  <CardContent>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {aiAnalysis}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={onClose}
        >
          Continue Learning
        </Button>
      </DialogActions>
    </Dialog>
  );
};