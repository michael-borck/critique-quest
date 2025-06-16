import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Alert,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Timer, PlayArrow, Stop, NavigateNext, NavigateBefore, Lightbulb } from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import { MarkdownRenderer } from './MarkdownRenderer';

export const PracticeView: React.FC = () => {
  const { currentCase } = useAppStore();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && isTimerEnabled) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmitPractice = async () => {
    if (!currentCase) return;

    try {
      const session = {
        case_id: currentCase.id!,
        start_time: new Date(Date.now() - timeElapsed * 1000).toISOString(),
        end_time: new Date().toISOString(),
        notes: notes,
      };

      // Save practice session (would be implemented in the store)
      console.log('Practice session completed:', session);
      
      // Reset practice state
      setActiveStep(0);
      setAnswers([]);
      setNotes('');
      setTimeElapsed(0);
      setIsTimerRunning(false);
    } catch (error) {
      console.error('Failed to save practice session:', error);
    }
  };

  if (!currentCase) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Practice Mode
        </Typography>
        <Alert severity="info">
          Select a case study from the library to start practicing.
        </Alert>
      </Box>
    );
  }

  const questions = currentCase.questions.split('\n').filter(q => q.trim());

  const steps = [
    {
      label: 'Read Case Study',
      content: (
        <Box>
          <MarkdownRenderer content={currentCase.content} />
        </Box>
      ),
    },
    ...questions.map((question, index) => ({
      label: `Question ${index + 1}`,
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            {question}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Write your analysis here..."
            variant="outlined"
          />
        </Box>
      ),
    })),
    {
      label: 'Review & Submit',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Practice Summary
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You've completed all analysis questions. Review your answers and add any final notes.
          </Typography>
          
          <TextField
            fullWidth
            label="Additional Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional thoughts or insights..."
            sx={{ mb: 2 }}
          />

          {isTimerEnabled && (
            <Typography variant="body2" color="textSecondary">
              Time spent: {formatTime(timeElapsed)}
            </Typography>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Practice Mode
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {currentCase.title}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip label={currentCase.domain} size="small" sx={{ mr: 1 }} />
            <Chip label={currentCase.complexity} size="small" sx={{ mr: 1 }} />
            <Chip label={currentCase.scenario_type} size="small" />
          </Box>
        </Box>

        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">Timer</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isTimerEnabled}
                    onChange={(e) => setIsTimerEnabled(e.target.checked)}
                    size="small"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
            
            {isTimerEnabled && (
              <>
                <Typography variant="h4" sx={{ textAlign: 'center', mb: 1 }}>
                  {formatTime(timeElapsed)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleStartTimer}
                    disabled={isTimerRunning}
                    startIcon={<PlayArrow />}
                  >
                    Start
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleStopTimer}
                    disabled={!isTimerRunning}
                    startIcon={<Stop />}
                  >
                    Stop
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {step.content}
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmitPractice : handleNext}
                    sx={{ mr: 1 }}
                    startIcon={index === steps.length - 1 ? undefined : <NavigateNext />}
                  >
                    {index === steps.length - 1 ? 'Complete Practice' : 'Next'}
                  </Button>
                  
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    startIcon={<NavigateBefore />}
                  >
                    Back
                  </Button>

                  {index > 0 && index < steps.length - 1 && (
                    <Button
                      onClick={() => setShowHints(!showHints)}
                      startIcon={<Lightbulb />}
                      sx={{ ml: 1 }}
                    >
                      {showHints ? 'Hide' : 'Show'} Hints
                    </Button>
                  )}
                </Box>

                {showHints && index > 0 && index < steps.length - 1 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Hint:</strong> Consider the key concepts, stakeholders, and potential outcomes when analyzing this question.
                      Think about both immediate and long-term implications.
                    </Typography>
                  </Alert>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Practice Completed!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Great job working through this case study. Your practice session has been saved.
            </Typography>
            
            {currentCase.answers && (
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => setShowHints(!showHints)}
                  startIcon={<Lightbulb />}
                >
                  {showHints ? 'Hide' : 'Show'} Model Answers
                </Button>
                
                {showHints && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Model Answers
                    </Typography>
                    <MarkdownRenderer content={currentCase.answers} />
                  </Box>
                )}
              </Box>
            )}
            
            <Button
              onClick={() => {
                setActiveStep(0);
                setAnswers([]);
                setNotes('');
                setTimeElapsed(0);
                setIsTimerRunning(false);
                setShowHints(false);
              }}
              sx={{ mt: 2 }}
            >
              Start New Practice
            </Button>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};