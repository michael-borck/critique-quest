import React, { useEffect, useRef } from 'react';
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
  Button,
} from '@mui/material';
import {
  LibraryBooks,
  Add,
  PlayArrow,
  Settings,
  Star,
  MenuBook,
  Info,
  Gavel,
} from '@mui/icons-material';
import { useAppStore } from './store/appStore';
import { GenerationView } from './components/GenerationView';
import { LibraryView } from './components/LibraryView';
import { PracticeView } from './components/PracticeView';
import { DocumentationView } from './components/DocumentationView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { LegalView } from './components/LegalView';
import { AppFooter } from './components/AppFooter';

const DRAWER_WIDTH = 240;

type View = 'generation' | 'library' | 'practice' | 'documentation' | 'settings' | 'about' | 'legal';

const App: React.FC = () => {
  const { 
    cases, 
    preferences, 
    selectedView, 
    setSelectedView, 
    loadPreferences, 
    loadCollections,
    filters,
    addTagFilter,
    removeTagFilter,
    clearTagFilters,
    loadCases
  } = useAppStore();
  const currentView = (selectedView as View) || 'generation';

  useEffect(() => {
    // Load preferences and collections on app startup
    loadPreferences();
    loadCollections();
  }, [loadPreferences, loadCollections]); // Run only once on mount

  // Set the initial view from the user's default home page — but only ONCE.
  // Otherwise any later preferences reload (e.g. SettingsView refreshing them on
  // mount) would re-fire this effect and bounce the user back to the home page,
  // making the Settings view unreachable.
  const homePageApplied = useRef(false);
  useEffect(() => {
    if (!homePageApplied.current && preferences?.default_home_page) {
      homePageApplied.current = true;
      setSelectedView(preferences.default_home_page);
    }
  }, [preferences, setSelectedView]);

  // Get recent tags based on case modification dates
  const getRecentTags = () => {
    // Sort cases by modification date (most recent first)
    const recentCases = [...cases]
      .filter(c => c.modified_date || c.created_date)
      .sort((a, b) => {
        const dateA = new Date(a.modified_date || a.created_date || 0).getTime();
        const dateB = new Date(b.modified_date || b.created_date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 20); // Get the 20 most recent cases

    // Extract unique tags from recent cases, preserving order of appearance
    const tagCounts = new Map<string, number>();
    recentCases.forEach(caseStudy => {
      caseStudy.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Sort tags by frequency and return top 6
    return Array.from(tagCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([tag]) => tag);
  };

  const handleTagClick = (tag: string) => {
    const isActiveTag = filters.tags?.includes(tag);
    
    if (isActiveTag) {
      removeTagFilter(tag);
    } else {
      addTagFilter(tag);
    }
    
    // Switch to library view to see filtered results
    if (selectedView !== 'library') {
      setSelectedView('library');
    }
    
    // Reload cases with new filters
    loadCases();
  };

  const handleClearAllTagFilters = () => {
    clearTagFilters();
    loadCases();
  };

  const renderView = () => {
    switch (currentView) {
      case 'generation':
        return <GenerationView />;
      case 'library':
        return <LibraryView />;
      case 'practice':
        return <PracticeView />;
      case 'documentation':
        return <DocumentationView />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutView />;
      case 'legal':
        return <LegalView />;
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
      id: 'documentation' as View,
      label: 'Documentation',
      icon: <MenuBook />,
    },
    {
      id: 'settings' as View,
      label: 'Settings',
      icon: <Settings />,
    },
    {
      id: 'about' as View,
      label: 'About',
      icon: <Info />,
    },
    {
      id: 'legal' as View,
      label: 'Legal',
      icon: <Gavel />,
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Recent Tags
              </Typography>
              {filters.tags && filters.tags.length > 0 && (
                <Button
                  size="small"
                  onClick={handleClearAllTagFilters}
                  sx={{ 
                    fontSize: '0.65rem', 
                    color: '#9CA3AF',
                    minWidth: 'auto',
                    p: 0.5,
                    '&:hover': { color: '#D1D5DB' }
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {getRecentTags().map((tag) => {
                const isActive = filters.tags?.includes(tag);
                return (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant={isActive ? "filled" : "outlined"}
                    clickable
                    onClick={() => handleTagClick(tag)}
                    sx={{ 
                      fontSize: '0.7rem', 
                      height: 20,
                      backgroundColor: isActive ? '#2563EB' : 'transparent',
                      color: isActive ? 'white' : '#D1D5DB',
                      borderColor: isActive ? '#2563EB' : '#374151',
                      '&:hover': {
                        backgroundColor: isActive ? '#1D4ED8' : '#374151',
                        borderColor: isActive ? '#1D4ED8' : '#4B5563',
                        color: isActive ? 'white' : 'white',
                      },
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                );
              })}
              {getRecentTags().length === 0 && (
                <Typography variant="caption" sx={{ color: '#6B7280', fontStyle: 'italic' }}>
                  No tags yet
                </Typography>
              )}
            </Box>
            {filters.tags && filters.tags.length > 0 && (
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
                Filtering by {filters.tags.length} tag{filters.tags.length > 1 ? 's' : ''}
              </Typography>
            )}
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