import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Link, CircularProgress } from '@mui/material';
import { login, register } from '../api/auth';

interface AuthScreenProps {
  onAuthed: (username: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthed }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = mode === 'login' ? await login(username, password) : await register(username, password);
      onAuthed(user.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }} component="form" onSubmit={submit}>
        <Typography variant="h5" gutterBottom>CritiqueQuest</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth label="Username" value={username} autoFocus autoComplete="username"
          onChange={(e) => setUsername(e.target.value)} sx={{ mb: 2 }}
        />
        <TextField
          fullWidth label="Password" type="password" value={password}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }}
        />

        <Button fullWidth type="submit" variant="contained" disabled={busy || !username || !password}>
          {busy ? <CircularProgress size={24} /> : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <Link
            component="button" type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};
