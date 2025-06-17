import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  MenuBook,
  School,
  Business,
  Computer,
  LocalHospital,
  Science,
  Settings as SettingsIcon,
  Close,
  AccessTime,
  Person,
  Category,
  Lightbulb,
  Help,
} from '@mui/icons-material';
import { documentationService } from '../services/documentationService';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { DocumentationPage, DocumentationFilters } from '../../shared/types';

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

export const DocumentationView: React.FC = () => {
  const [docs, setDocs] = useState<DocumentationPage[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentationPage[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);

  // Filter options
  const categories = [
    { value: 'all', label: 'All Categories', icon: <MenuBook /> },
    { value: 'Getting Started', label: 'Getting Started', icon: <Lightbulb /> },
    { value: 'User Guides', label: 'User Guides', icon: <Person /> },
    { value: 'AI Setup', label: 'AI Setup', icon: <SettingsIcon /> },
    { value: 'Technical', label: 'Technical', icon: <Computer /> },
    { value: 'Reference', label: 'Reference', icon: <Help /> },
  ];

  const userTypes = [
    { value: 'all', label: 'All Users', icon: <Person /> },
    { value: 'student', label: 'Students', icon: <School /> },
    { value: 'educator', label: 'Educators', icon: <Business /> },
    { value: 'administrator', label: 'Administrators', icon: <SettingsIcon /> },
    { value: 'developer', label: 'Developers', icon: <Computer /> },
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  useEffect(() => {
    loadDocumentation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [docs, searchQuery, selectedCategory, selectedUserType, selectedDifficulty]);

  const loadDocumentation = async () => {
    try {
      setLoading(true);
      const documentation = await documentationService.getDocumentationPages();
      setDocs(documentation);
    } catch (error) {
      console.error('Failed to load documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filters: DocumentationFilters = {
      searchQuery: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      userType: selectedUserType !== 'all' ? selectedUserType : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
    };

    let filtered = [...docs];

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }

    // Apply user type filter
    if (filters.userType) {
      filtered = filtered.filter(doc => 
        doc.userType === filters.userType || doc.userType === 'all'
      );
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(doc => doc.difficulty === filters.difficulty);
    }

    setFilteredDocs(filtered);
  };

  const handleDocumentClick = (doc: DocumentationPage) => {
    setSelectedDoc(doc);
  };

  const handleCloseDocument = () => {
    setSelectedDoc(null);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.icon || <MenuBook />;
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'student': return <School />;
      case 'educator': return <Business />;
      case 'administrator': return <SettingsIcon />;
      case 'developer': return <Computer />;
      default: return <Person />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  // Group docs by category for tabbed view
  const docsByCategory = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocumentationPage[]>);

  const categoryTabs = Object.keys(docsByCategory);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBook color="primary" />
          Documentation
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive guides and resources for mastering CritiqueQuest
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.icon}
                      {category.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>User Type</InputLabel>
              <Select
                value={selectedUserType}
                label="User Type"
                onChange={(e) => setSelectedUserType(e.target.value)}
              >
                {userTypes.map(userType => (
                  <MenuItem key={userType.value} value={userType.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {userType.icon}
                      {userType.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={selectedDifficulty}
                label="Difficulty"
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {difficulties.map(difficulty => (
                  <MenuItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary">
              {filteredDocs.length} of {docs.length} guides
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredDocs.length === 0 ? (
        <Alert severity="info">
          No documentation found matching your criteria. Try adjusting your filters or search terms.
        </Alert>
      ) : (
        <>
          {/* Category Tabs */}
          {categoryTabs.length > 1 && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(_, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label={`All (${filteredDocs.length})`} />
                {categoryTabs.map((category, index) => (
                  <Tab 
                    key={category} 
                    label={`${category} (${docsByCategory[category].length})`}
                    icon={getCategoryIcon(category)}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Box>
          )}

          {/* Documentation Cards */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {filteredDocs.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header with category icon */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {getCategoryIcon(doc.category)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'medium' }}>
                            {doc.category}
                          </Typography>
                          {doc.section && (
                            <Typography variant="caption" color="textSecondary">
                              {doc.section}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Title and description */}
                      <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'medium' }}>
                        {doc.title}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                        {doc.description}
                      </Typography>

                      {/* Metadata chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        <Chip 
                          size="small" 
                          icon={getUserTypeIcon(doc.userType)}
                          label={doc.userType === 'all' ? 'All Users' : doc.userType.charAt(0).toUpperCase() + doc.userType.slice(1)}
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={doc.difficulty}
                          color={getDifficultyColor(doc.difficulty) as any}
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          icon={<AccessTime />}
                          label={`${doc.estimatedReadTime} min`}
                          variant="outlined"
                        />
                      </Box>

                      {/* Tags */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {doc.tags.slice(0, 3).map((tag) => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {doc.tags.length > 3 && (
                          <Chip 
                            label={`+${doc.tags.length - 3}`} 
                            size="small" 
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentClick(doc);
                        }}
                        startIcon={<MenuBook />}
                      >
                        Read Guide
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Category-specific tabs */}
          {categoryTabs.map((category, index) => (
            <TabPanel key={category} value={tabValue} index={index + 1}>
              <Grid container spacing={3}>
                {docsByCategory[category].map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 }
                      }}
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                          {doc.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {doc.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                          <Chip size="small" label={doc.userType} />
                          <Chip size="small" label={doc.difficulty} color={getDifficultyColor(doc.difficulty) as any} />
                          <Chip size="small" label={`${doc.estimatedReadTime} min`} />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" startIcon={<MenuBook />}>
                          Read Guide
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          ))}
        </>
      )}

      {/* Document Detail Dialog */}
      <Dialog
        open={!!selectedDoc}
        onClose={handleCloseDocument}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        {selectedDoc && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 6 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getCategoryIcon(selectedDoc.category)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{selectedDoc.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedDoc.category} • {selectedDoc.estimatedReadTime} min read
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  {selectedDoc.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip 
                    icon={getUserTypeIcon(selectedDoc.userType)}
                    label={selectedDoc.userType === 'all' ? 'All Users' : selectedDoc.userType}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={selectedDoc.difficulty}
                    color={getDifficultyColor(selectedDoc.difficulty) as any}
                  />
                  <Chip 
                    icon={<AccessTime />}
                    label={`${selectedDoc.estimatedReadTime} minutes`}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <MarkdownRenderer content={selectedDoc.content} />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseDocument} startIcon={<Close />}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};