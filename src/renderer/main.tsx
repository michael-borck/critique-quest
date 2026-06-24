import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Box, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AppThemeProvider } from './contexts/ThemeContext';
import App from './App';
import { AuthScreen } from './components/AuthScreen';
import { httpApi } from './api/httpApi';
import { currentUser } from './api/auth';

// Transport detection: the Electron preload injects window.electronAPI. When it
// is absent we're running as the self-hosted web app, so install the HTTP
// transport and gate the UI behind login.
const isDesktop = !!window.electronAPI;
if (!isDesktop) {
  window.electronAPI = httpApi;
}

const Root: React.FC = () => {
  const [authed, setAuthed] = useState<boolean | null>(isDesktop ? true : null);

  useEffect(() => {
    if (isDesktop) return;
    currentUser().then((u) => setAuthed(!!u)).catch(() => setAuthed(false));
    const onUnauthorized = () => setAuthed(false);
    window.addEventListener('cq-unauthorized', onUnauthorized);
    return () => window.removeEventListener('cq-unauthorized', onUnauthorized);
  }, []);

  if (authed === null) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!authed) return <AuthScreen onAuthed={() => setAuthed(true)} />;
  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <CssBaseline />
      <Root />
    </AppThemeProvider>
  </React.StrictMode>
);
