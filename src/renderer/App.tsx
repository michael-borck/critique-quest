import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  LibraryBooks,
  Add,
  PlayArrow,
  Settings,
  Star,
  History,
  Tag,
} from '@mui/icons-material';
import { useAppStore } from './store/appStore';
import { GenerationView } from './components/GenerationView';
import { LibraryView } from './components/LibraryView';
import { PracticeView } from './components/PracticeView';
import { SettingsView } from './components/SettingsView';
import { AppFooter } from './components/AppFooter';

const DRAWER_WIDTH = 240;

type View = 'generation' | 'library' | 'practice' | 'settings';

const App: React.FC = () => {
  const { cases, aiStatus, preferences, selectedView, setSelectedView, loadPreferences, loadCollections } = useAppStore();
  const currentView = (selectedView as View) || 'generation';

  useEffect(() => {
    // Load preferences and collections on app startup
    loadPreferences();
    loadCollections();
  }, []); // Run only once on mount

  // Set initial view based on user preferences
  useEffect(() => {
    if (preferences?.default_home_page) {
      setSelectedView(preferences.default_home_page);
    }
  }, [preferences, setSelectedView]);

  const renderView = () => {
    switch (currentView) {
      case 'generation':
        return <GenerationView />;
      case 'library':
        return <LibraryView />;
      case 'practice':
        return <PracticeView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <GenerationView />;
    }
  };

  const menuItems = [
    {
      id: 'generation' as View,
      label: 'Generate',
      icon: <Add />,
    },
    {
      id: 'library' as View,
      label: 'Library',
      icon: <LibraryBooks />,
    },
    {
      id: 'practice' as View,
      label: 'Practice',
      icon: <PlayArrow />,
    },
    {
      id: 'settings' as View,
      label: 'Settings',
      icon: <Settings />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#1F2937',
            color: 'white',
            borderRight: '1px solid #374151',
          },
        }}
      >
        {/* App Header in Sidebar */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #374151',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
            CritiqueQuest
          </Typography>
        </Box>
        
        <Box sx={{ overflow: 'auto', p: 1 }}>
          {/* Navigation */}
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.id}
                button
                selected={currentView === item.id}
                onClick={() => setSelectedView(item.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  color: currentView === item.id ? 'white' : '#D1D5DB',
                  backgroundColor: currentView === item.id ? '#2563EB' : 'transparent',
                  '&:hover': {
                    backgroundColor: currentView === item.id ? '#2563EB' : '#374151',
                  },
                  '& .MuiListItemIcon-root': {
                    color: currentView === item.id ? 'white' : '#D1D5DB',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2, borderColor: '#374151' }} />

          {/* Quick Stats */}
          <Box sx={{ px: 2 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Library
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32, color: '#D1D5DB' }}>
                  <LibraryBooks fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`${cases.length} Cases`}
                  primaryTypographyProps={{ variant: 'body2', style: { color: '#D1D5DB' } }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 32, color: '#D1D5DB' }}>
                  <Star fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`${cases.filter(c => c.is_favorite).length} Favorites`}
                  primaryTypographyProps={{ variant: 'body2', style: { color: '#D1D5DB' } }}
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Recent Tags */}
          <Box sx={{ px: 2 }}>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: '#9CA3AF' }}>
              Recent Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {Array.from(new Set(cases.flatMap(c => c.tags)))
                .slice(0, 6)
                .map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                ))}
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          paddingBottom: '32px', // Account for footer height
        }}
      >
        <Box sx={{ p: 3 }}>
          {renderView()}
        </Box>
      </Box>

      {/* App Footer */}
      <AppFooter />
    </Box>
  );
};

export default App;