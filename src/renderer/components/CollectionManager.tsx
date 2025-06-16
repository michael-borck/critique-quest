import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Folder,
  FolderOpen,
  Description,
  Visibility,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import { CollectionContentDialog } from './CollectionContentDialog';
import type { Collection } from '../../shared/types';

export const CollectionManager: React.FC = () => {
  const {
    collections,
    loadCollections,
    saveCollection,
    deleteCollection,
  } = useAppStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2563EB',
    parent_collection_id: undefined as number | undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [selectedCollectionForContent, setSelectedCollectionForContent] = useState<Collection | null>(null);

  useEffect(() => {
    loadCollections();
  }, []); // Run only once on mount

  const handleCreateCollection = () => {
    setFormData({
      name: '',
      description: '',
      color: '#2563EB',
      parent_collection_id: undefined,
    });
    setEditingCollection(null);
    setShowCreateDialog(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setFormData({
      name: collection.name,
      description: collection.description || '',
      color: collection.color || '#2563EB',
      parent_collection_id: collection.parent_collection_id,
    });
    setEditingCollection(collection);
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingCollection(null);
    setError(null);
    setSuccess(null);
  };

  const handleSaveCollection = async () => {
    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const collectionData: Collection = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ...(editingCollection && { id: editingCollection.id }),
      };

      await saveCollection(collectionData);
      
      setSuccess(editingCollection ? 'Collection updated successfully' : 'Collection created successfully');
      setShowCreateDialog(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(`Failed to save collection: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (!collection.id) return;

    const hasSubcollections = collection.subcollection_count && collection.subcollection_count > 0;
    const hasCases = collection.case_count && collection.case_count > 0;
    
    let confirmMessage = `Are you sure you want to delete "${collection.name}"?`;
    if (hasSubcollections) {
      confirmMessage += '\n\nThis collection contains subcollections that will be moved to the root level.';
    }
    if (hasCases) {
      confirmMessage += '\n\nThis collection contains case studies that will be removed from this collection.';
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteCollection(collection.id);
        setSuccess('Collection deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError(`Failed to delete collection: ${error}`);
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const buildCollectionTree = () => {
    const rootCollections = collections.filter(c => !c.parent_collection_id);
    const childCollections = collections.filter(c => c.parent_collection_id);

    const addChildren = (parentId: number): Collection[] => {
      return childCollections
        .filter(c => c.parent_collection_id === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    const tree = rootCollections
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(collection => ({
        ...collection,
        children: collection.id ? addChildren(collection.id) : [],
      }));

    return tree;
  };

  const renderCollectionCard = (collection: Collection, level: number = 0) => (
    <Card 
      key={collection.id} 
      sx={{ 
        mb: 1, 
        ml: level * 2,
        border: `2px solid ${collection.color || '#e0e0e0'}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Folder sx={{ color: collection.color || '#666', mr: 1 }} />
            <Typography variant="h6" component="h3">
              {collection.name}
            </Typography>
          </Box>
          <Box>
            <Chip 
              label={`${collection.case_count || 0} cases`} 
              size="small" 
              sx={{ mr: 1 }} 
            />
            {collection.subcollection_count && collection.subcollection_count > 0 && (
              <Chip 
                label={`${collection.subcollection_count} subcollections`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        </Box>

        {collection.description && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {collection.description}
          </Typography>
        )}

        <Typography variant="caption" color="textSecondary">
          Created: {collection.created_date ? new Date(collection.created_date).toLocaleDateString() : 'Unknown'}
          {collection.modified_date && collection.modified_date !== collection.created_date && (
            <> • Modified: {new Date(collection.modified_date).toLocaleDateString()}</>
          )}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => handleEditCollection(collection)}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<Delete />}
          onClick={() => handleDeleteCollection(collection)}
          color="error"
        >
          Delete
        </Button>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => {
            setSelectedCollectionForContent(collection);
            setShowContentDialog(true);
          }}
        >
          View Contents
        </Button>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              color: '#2563EB',
              parent_collection_id: collection.id,
            });
            setEditingCollection(null);
            setShowCreateDialog(true);
          }}
        >
          Add Subcollection
        </Button>
      </CardActions>
    </Card>
  );

  const renderCollectionTree = () => {
    const tree = buildCollectionTree();
    
    const renderNode = (node: any, level: number = 0): React.ReactNode[] => {
      const result = [renderCollectionCard(node, level)];
      
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => {
          result.push(...renderNode(child, level + 1));
        });
      }
      
      return result;
    };

    return tree.flatMap(node => renderNode(node));
  };

  const parentCollectionOptions = collections.filter(c => 
    !editingCollection || c.id !== editingCollection.id
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Collection Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCollection}
        >
          Create Collection
        </Button>
      </Box>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Collections List */}
      {collections.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No collections yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first collection to organize your case studies
          </Typography>
        </Box>
      ) : (
        <Box>
          {renderCollectionTree()}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCollection ? 'Edit Collection' : 'Create Collection'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Collection Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Parent Collection (optional)</InputLabel>
              <Select
                value={formData.parent_collection_id || ''}
                label="Parent Collection (optional)"
                onChange={(e) => setFormData({ 
                  ...formData, 
                  parent_collection_id: e.target.value ? Number(e.target.value) : undefined 
                })}
                disabled={loading}
              >
                <MenuItem value="">None (Root Level)</MenuItem>
                {parentCollectionOptions.map((collection) => (
                  <MenuItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCollection} 
            variant="contained"
            disabled={loading || !formData.name.trim()}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {editingCollection ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collection Content Dialog */}
      <CollectionContentDialog
        open={showContentDialog}
        onClose={() => {
          setShowContentDialog(false);
          setSelectedCollectionForContent(null);
        }}
        collection={selectedCollectionForContent}
      />
    </Box>
  );
};