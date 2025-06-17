import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Timer,
  School,
} from '@mui/icons-material';
import { formatTime } from '../../shared/textAnalysis';

interface PracticeSession {
  id: number;
  case_id: number;
  start_time: string;
  end_time: string;
  notes: string;
  answers?: string[];
  analysis?: any;
}

export const ProgressView: React.FC = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      // TODO: Implement getting all practice sessions
      // For now, this is a placeholder since we need to implement the backend method
      setLoading(false);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageWordsPerSession: 0,
        averageCompletionRate: 0,
        improvementTrend: 'neutral' as 'improving' | 'declining' | 'neutral'
      };
    }

    const totalTimeSpent = sessions.reduce((total, session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      return total + (end.getTime() - start.getTime()) / 1000;
    }, 0);

    const sessionsWithAnalysis = sessions.filter(s => s.analysis);
    const averageWordsPerSession = sessionsWithAnalysis.length > 0
      ? sessionsWithAnalysis.reduce((total, s) => total + (s.analysis?.totalWordCount || 0), 0) / sessionsWithAnalysis.length
      : 0;

    const averageCompletionRate = sessionsWithAnalysis.length > 0
      ? sessionsWithAnalysis.reduce((total, s) => total + (s.analysis?.completionRate || 0), 0) / sessionsWithAnalysis.length
      : 0;

    // Simple trend calculation based on last 5 vs previous 5 sessions
    let improvementTrend: 'improving' | 'declining' | 'neutral' = 'neutral';
    if (sessionsWithAnalysis.length >= 10) {
      const recent5 = sessionsWithAnalysis.slice(-5);
      const previous5 = sessionsWithAnalysis.slice(-10, -5);
      
      const recentAvg = recent5.reduce((sum, s) => sum + (s.analysis?.completionRate || 0), 0) / 5;
      const previousAvg = previous5.reduce((sum, s) => sum + (s.analysis?.completionRate || 0), 0) / 5;
      
      if (recentAvg > previousAvg + 5) improvementTrend = 'improving';
      else if (recentAvg < previousAvg - 5) improvementTrend = 'declining';
    }

    return {
      totalSessions: sessions.length,
      totalTimeSpent,
      averageWordsPerSession: Math.round(averageWordsPerSession),
      averageCompletionRate: Math.round(averageCompletionRate),
      improvementTrend
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Learning Progress
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Learning Progress
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Track your practice sessions and improvement over time
      </Typography>

      {sessions.length === 0 ? (
        <Alert severity="info">
          No practice sessions yet. Complete a case study practice to start tracking your progress!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Stats Overview */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment />
              Overview Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.totalSessions}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Practice Sessions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {formatTime(stats.totalTimeSpent)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Study Time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.averageWordsPerSession}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Words/Session
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.averageCompletionRate}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Completion
                    </Typography>
                    {stats.improvementTrend === 'improving' && (
                      <Chip 
                        label="Improving" 
                        color="success" 
                        size="small" 
                        sx={{ mt: 1 }}
                        icon={<TrendingUp />}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Sessions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <School />
              Recent Practice Sessions
            </Typography>
            <Card>
              <CardContent>
                <List>
                  {sessions.slice(-10).reverse().map((session, index) => (
                    <ListItem key={session.id}>
                      <ListItemText
                        primary={`Practice Session ${session.id}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(session.start_time).toLocaleDateString()} • 
                              Duration: {formatTime((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000)}
                            </Typography>
                            {session.analysis && (
                              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                  label={`${session.analysis.completionRate}% Complete`} 
                                  size="small" 
                                  color={session.analysis.completionRate >= 80 ? 'success' : 'warning'}
                                />
                                <Chip 
                                  label={`${session.analysis.totalWordCount} words`} 
                                  size="small" 
                                  variant="outlined"
                                />
                                <Chip 
                                  label={session.analysis.overallComplexityLevel} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};