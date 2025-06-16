import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Folder,
  Check,
  Close,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import type { CaseStudy, Collection } from '../../shared/types';

interface CollectionAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  caseStudies: CaseStudy[]; // Support single or multiple cases
  onSuccess?: () => void;
}

export const CollectionAssignmentDialog: React.FC<CollectionAssignmentDialogProps> = ({
  open,
  onClose,
  caseStudies,
  onSuccess,
}) => {
  const {
    collections,
    loadCollections,
    addCaseToCollection,
    removeCaseFromCollection,
    getCollectionsByCase,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentAssignments, setCurrentAssignments] = useState<Map<number, number[]>>(new Map());
  const [newAssignments, setNewAssignments] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      loadCollections();
      loadCurrentAssignments();
    }
  }, [open, loadCollections, caseStudies]);

  const loadCurrentAssignments = async () => {
    const assignments = new Map<number, number[]>();
    
    for (const caseStudy of caseStudies) {
      if (caseStudy.id) {
        try {
          const caseCollections = await getCollectionsByCase(caseStudy.id);
          assignments.set(caseStudy.id, caseCollections.map(c => c.id!).filter(id => id !== undefined));
        } catch (error) {
          console.error(`Failed to load collections for case ${caseStudy.id}:`, error);
          assignments.set(caseStudy.id, []);
        }
      }
    }
    
    setCurrentAssignments(assignments);

    // Initialize new assignments with collections that are assigned to ALL selected cases
    if (caseStudies.length > 1) {
      const commonCollections = collections.filter(collection => 
        caseStudies.every(caseStudy => 
          caseStudy.id && assignments.get(caseStudy.id)?.includes(collection.id!)
        )
      );
      setNewAssignments(new Set(commonCollections.map(c => c.id!).filter(id => id !== undefined)));
    } else if (caseStudies.length === 1 && caseStudies[0].id) {
      const caseAssignments = assignments.get(caseStudies[0].id) || [];
      setNewAssignments(new Set(caseAssignments));
    }
  };

  const handleCollectionToggle = (collectionId: number) => {
    const newSet = new Set(newAssignments);
    if (newSet.has(collectionId)) {
      newSet.delete(collectionId);
    } else {
      newSet.add(collectionId);
    }
    setNewAssignments(newSet);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // For each case study, determine what changes need to be made
      for (const caseStudy of caseStudies) {
        if (!caseStudy.id) continue;

        const currentCaseAssignments = currentAssignments.get(caseStudy.id) || [];
        const newCaseAssignments = Array.from(newAssignments);

        // Find collections to add
        const toAdd = newCaseAssignments.filter(id => !currentCaseAssignments.includes(id));
        
        // Find collections to remove
        const toRemove = currentCaseAssignments.filter(id => !newCaseAssignments.includes(id));

        // Add to new collections
        for (const collectionId of toAdd) {
          await addCaseToCollection(caseStudy.id, collectionId);
        }

        // Remove from old collections
        for (const collectionId of toRemove) {
          await removeCaseFromCollection(caseStudy.id, collectionId);
        }
      }

      const message = caseStudies.length === 1 
        ? `Successfully updated collections for "${caseStudies[0].title}"`
        : `Successfully updated collections for ${caseStudies.length} case studies`;
      
      setSuccess(message);
      
      if (onSuccess) {
        onSuccess();
      }

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      setError(`Failed to update collection assignments: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  const getCollectionStatus = (collectionId: number) => {
    if (caseStudies.length === 1) {
      // Single case - show if assigned
      const caseId = caseStudies[0].id;
      if (!caseId) return 'none';
      const assignments = currentAssignments.get(caseId) || [];
      return assignments.includes(collectionId) ? 'assigned' : 'none';
    } else {
      // Multiple cases - show partial/full assignment status
      const assignedCount = caseStudies.filter(caseStudy => {
        if (!caseStudy.id) return false;
        const assignments = currentAssignments.get(caseStudy.id) || [];
        return assignments.includes(collectionId);
      }).length;

      if (assignedCount === 0) return 'none';
      if (assignedCount === caseStudies.length) return 'all';
      return 'partial';
    }
  };

  const renderCollectionCheckbox = (collection: Collection) => {
    const status = getCollectionStatus(collection.id!);
    const isChecked = newAssignments.has(collection.id!);
    
    return (
      <FormControlLabel
        key={collection.id}
        control={
          <Checkbox
            checked={isChecked}
            onChange={() => handleCollectionToggle(collection.id!)}
            disabled={loading}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Folder sx={{ color: collection.color || '#666', fontSize: 20 }} />
            <Typography variant="body2">
              {collection.name}
            </Typography>
            {status === 'partial' && (
              <Chip label="Partial" size="small" color="warning" variant="outlined" />
            )}
            {collection.description && (
              <Typography variant="caption" color="textSecondary">
                - {collection.description}
              </Typography>
            )}
          </Box>
        }
        sx={{ display: 'block', mb: 1 }}
      />
    );
  };

  const rootCollections = collections.filter(c => !c.parent_collection_id);
  const childCollections = collections.filter(c => c.parent_collection_id);

  const renderCollectionTree = () => {
    const renderLevel = (parentId?: number, level: number = 0) => {
      const collectionsAtLevel = parentId 
        ? childCollections.filter(c => c.parent_collection_id === parentId)
        : rootCollections;

      return collectionsAtLevel.map(collection => (
        <Box key={collection.id} sx={{ ml: level * 3 }}>
          {renderCollectionCheckbox(collection)}
          {renderLevel(collection.id, level + 1)}
        </Box>
      ));
    };

    return renderLevel();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {caseStudies.length === 1 
          ? `Assign "${caseStudies[0].title}" to Collections`
          : `Assign ${caseStudies.length} Cases to Collections`
        }
      </DialogTitle>
      
      <DialogContent>
        {caseStudies.length > 1 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Changes will be applied to all {caseStudies.length} selected case studies.
            Checked collections will be assigned to all cases.
          </Alert>
        )}

        {collections.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Folder sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="textSecondary">
              No collections yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create collections first to organize your case studies
            </Typography>
          </Box>
        ) : (
          <FormGroup>
            {renderCollectionTree()}
          </FormGroup>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={loading || collections.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : <Check />}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};