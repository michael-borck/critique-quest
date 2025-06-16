import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Visibility,
  GetApp,
  Delete,
  Star,
  StarBorder,
  Close,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { Collection, CaseStudy } from '../../shared/types';

interface CollectionContentDialogProps {
  open: boolean;
  onClose: () => void;
  collection: Collection | null;
}

export const CollectionContentDialog: React.FC<CollectionContentDialogProps> = ({
  open,
  onClose,
  collection,
}) => {
  const {
    getCasesByCollection,
    setCurrentCase,
    updateCase,
    deleteCase,
    removeCaseFromCollection,
  } = useAppStore();

  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  useEffect(() => {
    if (open && collection?.id) {
      loadCollectionCases();
    }
  }, [open, collection?.id]);

  const loadCollectionCases = async () => {
    if (!collection?.id) return;

    setLoading(true);
    setError(null);

    try {
      const collectionCases = await getCasesByCollection(collection.id);
      setCases(collectionCases);
    } catch (error) {
      setError(`Failed to load collection contents: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (caseStudy: CaseStudy) => {
    const updatedCase = { ...caseStudy, is_favorite: !caseStudy.is_favorite };
    try {
      await updateCase(updatedCase);
      // Update local state
      setCases(prevCases => 
        prevCases.map(c => c.id === caseStudy.id ? updatedCase : c)
      );
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  };

  const handleDeleteCase = async (caseId: number) => {
    if (window.confirm('Are you sure you want to delete this case study?')) {
      try {
        await deleteCase(caseId);
        // Remove from local state
        setCases(prevCases => prevCases.filter(c => c.id !== caseId));
      } catch (error) {
        console.error('Failed to delete case:', error);
      }
    }
  };

  const handleRemoveFromCollection = async (caseId: number) => {
    if (!collection?.id) return;

    if (window.confirm('Remove this case from the collection? (The case will still exist in your library)')) {
      try {
        await removeCaseFromCollection(caseId, collection.id);
        // Remove from local state
        setCases(prevCases => prevCases.filter(c => c.id !== caseId));
      } catch (error) {
        console.error('Failed to remove case from collection:', error);
      }
    }
  };

  const handleExport = async (caseStudy: CaseStudy) => {
    try {
      await window.electronAPI.exportCase(caseStudy, 'pdf');
    } catch (error) {
      console.error('Failed to export case:', error);
    }
  };

  const handlePractice = (caseStudy: CaseStudy) => {
    setCurrentCase(caseStudy);
    onClose();
    // Navigation to practice view would happen here
  };

  const handleViewCase = (caseStudy: CaseStudy) => {
    setSelectedCase(caseStudy);
  };

  const handleCloseDialog = () => {
    setSelectedCase(null);
    setError(null);
    onClose();
  };

  if (!collection) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: collection.color || '#2563EB' 
                }} 
              />
              <Typography variant="h6">
                {collection.name}
              </Typography>
            </Box>
            <Chip 
              label={`${cases.length} case${cases.length !== 1 ? 's' : ''}`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
          {collection.description && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {collection.description}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && cases.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No cases in this collection
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Add cases to this collection from the library view
              </Typography>
            </Box>
          )}

          {!loading && cases.length > 0 && (
            <Grid container spacing={2}>
              {cases.map((caseStudy) => (
                <Grid item xs={12} sm={6} md={4} key={caseStudy.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3,
                      }
                    }}
                    onClick={() => handleViewCase(caseStudy)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                          {caseStudy.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(caseStudy);
                          }}
                        >
                          {caseStudy.is_favorite ? <Star color="primary" /> : <StarBorder />}
                        </IconButton>
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
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePractice(caseStudy);
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
                        color="warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (caseStudy.id) handleRemoveFromCollection(caseStudy.id);
                        }}
                        title="Remove from collection"
                      >
                        <Close fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (caseStudy.id) handleDeleteCase(caseStudy.id);
                        }}
                        title="Delete case"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
                onClick={() => handlePractice(selectedCase)} 
                startIcon={<PlayArrow />}
                variant="contained"
              >
                Practice
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};