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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Star,
  StarBorder,
  Delete,
  Edit,
  PlayArrow,
  GetApp,
  FilterList,
  Upload,
  Link,
  FolderOpen,
  CheckBox,
  CheckBoxOutlineBlank,
  SelectAll,
  Clear,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import type { CaseStudy } from '../../shared/types';
import { MarkdownRenderer } from './MarkdownRenderer';

export const LibraryView: React.FC = () => {
  const {
    cases,
    searchQuery,
    filters,
    loadCases,
    setSearchQuery,
    setFilters,
    updateCase,
    deleteCase,
    setCurrentCase,
    saveCase,
  } = useAppStore();

  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importTab, setImportTab] = useState(0);
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedCases, setSelectedCases] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you might debounce this or trigger a search API call
  };

  const handleToggleFavorite = async (caseStudy: CaseStudy) => {
    const updatedCase = { ...caseStudy, is_favorite: !caseStudy.is_favorite };
    try {
      await updateCase(updatedCase);
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  };

  const handleDeleteCase = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this case study?')) {
      try {
        await deleteCase(id);
      } catch (error) {
        console.error('Failed to delete case:', error);
      }
    }
  };

  const handleExport = async (caseStudy: CaseStudy, format?: string) => {
    try {
      const formatToUse = format || exportFormat;
      await window.electronAPI.exportCase(caseStudy, formatToUse);
    } catch (error) {
      console.error('Failed to export case:', error);
    }
  };

  const handleImportFromFile = async () => {
    try {
      setImportLoading(true);
      setImportError(null);
      
      // Note: This would typically open a file picker
      // For now, we'll show a message about implementation
      setImportError('File picker implementation pending. Use URL import for now.');
    } catch (error) {
      setImportError(`Failed to import file: ${error}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportFromURL = async () => {
    if (!importUrl.trim()) {
      setImportError('Please enter a valid URL');
      return;
    }

    try {
      setImportLoading(true);
      setImportError(null);
      setImportSuccess(null);

      // First try bulk import (collection format)
      try {
        const bulkResult = await window.electronAPI.importBulkCasesFromURL(importUrl.trim());
        
        // Save all cases in the collection
        for (const caseStudy of bulkResult.cases) {
          await saveCase(caseStudy);
        }
        
        setImportSuccess(
          `Successfully imported collection: "${bulkResult.collectionInfo.title}" with ${bulkResult.cases.length} case studies`
        );
        setImportUrl('');
        loadCases(); // Refresh the cases list
        
        // Auto-close dialog after success
        setTimeout(() => {
          setShowImportDialog(false);
          setImportSuccess(null);
        }, 3000);
        return;
      } catch (bulkError) {
        // If bulk import fails, try single case import
        console.log('Bulk import failed, trying single case import:', bulkError);
        
        const importedCase = await window.electronAPI.importCaseFromURL(importUrl.trim());
        await saveCase(importedCase);
        
        setImportSuccess(`Successfully imported case: "${importedCase.title}"`);
        setImportUrl('');
        loadCases(); // Refresh the cases list
        
        // Auto-close dialog after success
        setTimeout(() => {
          setShowImportDialog(false);
          setImportSuccess(null);
        }, 2000);
      }
    } catch (error) {
      setImportError(`Failed to import from URL: ${error}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setImportUrl('');
    setImportError(null);
    setImportSuccess(null);
    setImportTab(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const jsonFiles = files.filter(file => 
      file.type === 'application/json' || 
      file.name.toLowerCase().endsWith('.json')
    );

    if (jsonFiles.length === 0) {
      setImportError('Please drop JSON files only');
      setTimeout(() => setImportError(null), 3000);
      return;
    }

    // For now, process only the first JSON file
    const file = jsonFiles[0];
    
    try {
      setImportLoading(true);
      setImportError(null);
      setImportSuccess(null);

      const fileContent = await file.text();
      
      // First try bulk import (collection format)
      try {
        const bulkResult = await window.electronAPI.importBulkCasesFromFile(fileContent);
        
        // Save all cases in the collection
        for (const caseStudy of bulkResult.cases) {
          await saveCase(caseStudy);
        }
        
        setImportSuccess(
          `Successfully imported collection: "${bulkResult.collectionInfo.title}" with ${bulkResult.cases.length} case studies from file "${file.name}"`
        );
        loadCases(); // Refresh the cases list
        
        // Clear success message after 3 seconds
        setTimeout(() => setImportSuccess(null), 3000);
        return;
      } catch (bulkError) {
        // If bulk import fails, try single case import
        console.log('Bulk import failed, trying single case import:', bulkError);
        
        // Try to parse the JSON
        let parsedContent;
        try {
          parsedContent = JSON.parse(fileContent);
        } catch {
          throw new Error('Invalid JSON format');
        }

        // Validate the case study structure
        if (!parsedContent.title || !parsedContent.content) {
          throw new Error('Invalid case study format: missing required fields (title, content)');
        }

        // Clean and validate the imported data (similar to URL import)
        const caseStudy: CaseStudy = {
          title: String(parsedContent.title),
          domain: String(parsedContent.domain || 'General'),
          complexity: ['Beginner', 'Intermediate', 'Advanced'].includes(parsedContent.complexity) 
            ? parsedContent.complexity 
            : 'Intermediate',
          scenario_type: ['Problem-solving', 'Decision-making', 'Ethical Dilemma', 'Strategic Planning'].includes(parsedContent.scenario_type)
            ? parsedContent.scenario_type
            : 'Problem-solving',
          content: String(parsedContent.content),
          questions: String(parsedContent.questions || ''),
          answers: parsedContent.answers ? String(parsedContent.answers) : undefined,
          tags: Array.isArray(parsedContent.tags) ? parsedContent.tags.map(String) : ['imported', 'file'],
          is_favorite: Boolean(parsedContent.is_favorite || false),
          word_count: String(parsedContent.content).split(' ').length,
          usage_count: 0,
          created_date: new Date().toISOString(),
          modified_date: new Date().toISOString(),
        };

        await saveCase(caseStudy);
        
        setImportSuccess(`Successfully imported case: "${caseStudy.title}" from file "${file.name}"`);
        loadCases(); // Refresh the cases list
        
        // Clear success message after 3 seconds
        setTimeout(() => setImportSuccess(null), 3000);
      }
    } catch (error) {
      setImportError(`Failed to import file "${file.name}": ${error}`);
      setTimeout(() => setImportError(null), 5000);
    } finally {
      setImportLoading(false);
    }
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedCases(new Set());
  };

  const handleSelectCase = (caseId: number) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId);
    } else {
      newSelected.add(caseId);
    }
    setSelectedCases(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCases.size === filteredCases.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(filteredCases.map(c => c.id!).filter(id => id !== undefined)));
    }
  };

  const handleBulkExport = async () => {
    if (selectedCases.size === 0) return;

    try {
      const selectedCaseData = cases.filter(c => c.id && selectedCases.has(c.id));
      await window.electronAPI.exportBulkCases(selectedCaseData, exportFormat);
      
      // Show success message and exit bulk mode
      setImportSuccess(`Successfully exported ${selectedCases.size} case studies as collection`);
      setBulkMode(false);
      setSelectedCases(new Set());
      
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (error) {
      setImportError(`Failed to export cases: ${error}`);
      setTimeout(() => setImportError(null), 5000);
    }
  };

  const filteredCases = cases.filter((caseStudy) => {
    if (searchQuery && !caseStudy.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !caseStudy.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.domain && caseStudy.domain !== filters.domain) {
      return false;
    }
    
    if (filters.complexity && caseStudy.complexity !== filters.complexity) {
      return false;
    }
    
    if (filters.favorite && !caseStudy.is_favorite) {
      return false;
    }
    
    return true;
  });

  const domains = Array.from(new Set(cases.map(c => c.domain)));
  const complexities = Array.from(new Set(cases.map(c => c.complexity)));

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        position: 'relative',
        ...(isDragOver && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            border: '2px dashed #1976d2',
            borderRadius: 2,
            zIndex: 1000,
            pointerEvents: 'none',
          }
        })
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            Case Study Library
          </Typography>
          {bulkMode && (
            <Typography variant="body2" color="primary">
              {selectedCases.size} selected
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {bulkMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<SelectAll />}
                onClick={handleSelectAll}
                size="small"
              >
                {selectedCases.size === filteredCases.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                variant="contained"
                startIcon={<GetApp />}
                onClick={handleBulkExport}
                disabled={selectedCases.size === 0}
              >
                Export {selectedCases.size} Cases
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleToggleBulkMode}
                size="small"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<CheckBox />}
                onClick={handleToggleBulkMode}
              >
                Bulk Select
              </Button>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => setShowImportDialog(true)}
              >
                Import
              </Button>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={exportFormat}
                  label="Export Format"
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="markdown">Markdown</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="word">Word</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search case studies..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: showFilters ? 2 : 0 }}
        />

        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Domain</InputLabel>
                <Select
                  value={filters.domain || ''}
                  label="Domain"
                  onChange={(e) => setFilters({ ...filters, domain: e.target.value || undefined })}
                >
                  <MenuItem value="">All Domains</MenuItem>
                  {domains.map((domain) => (
                    <MenuItem key={domain} value={domain}>
                      {domain}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Complexity</InputLabel>
                <Select
                  value={filters.complexity || ''}
                  label="Complexity"
                  onChange={(e) => setFilters({ ...filters, complexity: e.target.value || undefined })}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {complexities.map((complexity) => (
                    <MenuItem key={complexity} value={complexity}>
                      {complexity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Favorites</InputLabel>
                <Select
                  value={filters.favorite ? 'true' : ''}
                  label="Favorites"
                  onChange={(e) => setFilters({ ...filters, favorite: e.target.value === 'true' || undefined })}
                >
                  <MenuItem value="">All Cases</MenuItem>
                  <MenuItem value="true">Favorites Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Drag Overlay Message */}
      {isDragOver && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
            backgroundColor: 'background.paper',
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            textAlign: 'center',
            border: '2px dashed #1976d2',
          }}
        >
          <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" color="primary">
            Drop JSON files here to import
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Supports single case studies or collections with multiple cases
          </Typography>
        </Box>
      )}

      {/* Status Messages for Drag & Drop */}
      {(importError || importSuccess) && (
        <Box sx={{ mb: 2 }}>
          {importError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {importError}
            </Alert>
          )}
          {importSuccess && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {importSuccess}
            </Alert>
          )}
        </Box>
      )}

      {/* Loading Indicator for Drag & Drop */}
      {importLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">
            Processing imported file...
          </Typography>
        </Box>
      )}

      {/* Case Studies Grid */}
      <Grid container spacing={2}>
        {filteredCases.map((caseStudy) => (
          <Grid item xs={12} sm={6} md={4} key={caseStudy.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                border: bulkMode && caseStudy.id && selectedCases.has(caseStudy.id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                backgroundColor: bulkMode && caseStudy.id && selectedCases.has(caseStudy.id) ? 'rgba(25, 118, 210, 0.05)' : 'inherit',
              }}
              onClick={() => bulkMode && caseStudy.id ? handleSelectCase(caseStudy.id) : setSelectedCase(caseStudy)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  {bulkMode && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (caseStudy.id) handleSelectCase(caseStudy.id);
                      }}
                      sx={{ mr: 1 }}
                    >
                      {caseStudy.id && selectedCases.has(caseStudy.id) ? 
                        <CheckBox color="primary" /> : 
                        <CheckBoxOutlineBlank />
                      }
                    </IconButton>
                  )}
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                    {caseStudy.title}
                  </Typography>
                  {!bulkMode && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(caseStudy);
                      }}
                    >
                      {caseStudy.is_favorite ? <Star color="primary" /> : <StarBorder />}
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip label={caseStudy.domain} size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label={caseStudy.complexity} size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label={caseStudy.scenario_type} size="small" sx={{ mb: 1 }} />
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {caseStudy.word_count} words • Used {caseStudy.usage_count} times
                </Typography>

                <MarkdownRenderer 
                  content={caseStudy.content}
                  maxLines={3}
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                  }}
                />

                {caseStudy.tags.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {caseStudy.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                      />
                    ))}
                    {caseStudy.tags.length > 3 && (
                      <Typography variant="caption" color="textSecondary">
                        +{caseStudy.tags.length - 3} more
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<PlayArrow />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentCase(caseStudy);
                    // Navigate to practice view
                  }}
                >
                  Practice
                </Button>
                <Button
                  size="small"
                  startIcon={<GetApp />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(caseStudy);
                  }}
                >
                  Export
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (caseStudy.id) handleDeleteCase(caseStudy.id);
                  }}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCases.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No case studies found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Generate your first case study to get started'
            }
          </Typography>
        </Box>
      )}

      {/* Case Detail Dialog */}
      <Dialog
        open={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedCase && (
          <>
            <DialogTitle>{selectedCase.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Chip label={selectedCase.domain} sx={{ mr: 1 }} />
                <Chip label={selectedCase.complexity} sx={{ mr: 1 }} />
                <Chip label={selectedCase.scenario_type} />
              </Box>
              
              <MarkdownRenderer content={selectedCase.content} />

              {selectedCase.questions && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Analysis Questions
                  </Typography>
                  <MarkdownRenderer content={selectedCase.questions} />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCase(null)}>Close</Button>
              <Button onClick={() => handleExport(selectedCase)} startIcon={<GetApp />}>
                Export
              </Button>
              <Button 
                onClick={() => {
                  setCurrentCase(selectedCase);
                  setSelectedCase(null);
                }} 
                startIcon={<PlayArrow />}
                variant="contained"
              >
                Practice
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Import Dialog */}
      <Dialog 
        open={showImportDialog} 
        onClose={handleCloseImportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Case Study</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={importTab} onChange={(_, newValue) => setImportTab(newValue)}>
              <Tab icon={<Link />} label="From URL" />
              <Tab icon={<FolderOpen />} label="From File" />
            </Tabs>
          </Box>

          {/* URL Import Tab */}
          {importTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Import case studies from a JSON URL. Supports single cases or collections with multiple cases.
              </Typography>
              
              <TextField
                fullWidth
                label="Case Study URL"
                placeholder="https://example.com/case-study.json"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={importLoading}
                sx={{ mb: 2 }}
              />

              <Typography variant="caption" color="textSecondary">
                Supports HTTPS URLs returning JSON case study data or collections.
              </Typography>
            </Box>
          )}

          {/* File Import Tab */}
          {importTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Import case studies from a local JSON file. Supports single cases or collections.
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<FolderOpen />}
                onClick={handleImportFromFile}
                disabled={importLoading}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose File
              </Button>

              <Typography variant="caption" color="textSecondary">
                Select a JSON file exported from CritiqueQuest or compatible format.
              </Typography>
            </Box>
          )}

          {/* Status Messages */}
          {importError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {importError}
            </Alert>
          )}

          {importSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {importSuccess}
            </Alert>
          )}

          {importLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">
                {importTab === 0 ? 'Importing from URL...' : 'Importing file...'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseImportDialog} disabled={importLoading}>
            Cancel
          </Button>
          {importTab === 0 && (
            <Button 
              onClick={handleImportFromURL} 
              variant="contained"
              disabled={importLoading || !importUrl.trim()}
            >
              Import from URL
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};