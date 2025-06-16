import React, { useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  Description,
  CheckBoxOutlineBlank,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import type { CaseStudy } from '../../shared/types';

interface CollectionSelectorProps {
  value?: number | 'all' | 'organized' | 'unorganized';
  onChange: (value: number | 'all' | 'organized' | 'unorganized') => void;
  showViewModes?: boolean;
}

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  value = 'all',
  onChange,
  showViewModes = true,
}) => {
  const { collections, cases, loadCollections } = useAppStore();

  useEffect(() => {
    loadCollections();
  }, []); // Run only once on mount

  const buildCollectionHierarchy = () => {
    const rootCollections = collections.filter(c => !c.parent_collection_id);
    const childCollections = collections.filter(c => c.parent_collection_id);

    const addChildren = (parentId: number, level: number = 0): any[] => {
      return childCollections
        .filter(c => c.parent_collection_id === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap(collection => [
          { ...collection, level },
          ...addChildren(collection.id!, level + 1),
        ]);
    };

    return rootCollections
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(collection => [
        { ...collection, level: 0 },
        ...addChildren(collection.id!, 1),
      ]);
  };

  const hierarchicalCollections = buildCollectionHierarchy();

  const getCollectionCounts = () => {
    const totalCases = cases.length;
    const organizedCases = collections.reduce((sum, c) => sum + (c.case_count || 0), 0);
    const unorganizedCount = Math.max(0, totalCases - organizedCases);
    
    return {
      all: totalCases,
      organized: organizedCases,
      unorganized: unorganizedCount,
    };
  };

  const counts = getCollectionCounts();

  return (
    <FormControl fullWidth>
      <InputLabel>Filter by Collection</InputLabel>
      <Select
        value={value}
        label="Filter by Collection"
        onChange={(e) => onChange(e.target.value as any)}
        renderValue={(selectedValue) => {
          if (selectedValue === 'all') return 'All Cases';
          if (selectedValue === 'organized') return 'Organized Cases';
          if (selectedValue === 'unorganized') return 'Unorganized Cases';
          
          const collection = collections.find(c => c.id === selectedValue);
          return collection ? collection.name : 'Unknown Collection';
        }}
      >
        {/* View Modes */}
        {showViewModes && [
          <MenuItem key="all" value="all">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1 }} />
                All Cases
              </Box>
              <Chip label={counts.all} size="small" />
            </Box>
          </MenuItem>,
          <MenuItem key="organized" value="organized">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderOpen sx={{ mr: 1 }} />
                Organized Cases
              </Box>
              <Chip label={counts.organized} size="small" />
            </Box>
          </MenuItem>,
          <MenuItem key="unorganized" value="unorganized">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckBoxOutlineBlank sx={{ mr: 1 }} />
                Unorganized Cases
              </Box>
              <Chip label={counts.unorganized} size="small" />
            </Box>
          </MenuItem>,
        ]}

        {/* Separator */}
        {showViewModes && collections.length > 0 && (
          <MenuItem disabled key="separator" sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Collections
            </Typography>
          </MenuItem>
        )}

        {/* Collections */}
        {hierarchicalCollections.map((collection) => (
          <MenuItem key={collection.id} value={collection.id}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              width: '100%',
              pl: collection.level * 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Folder sx={{ color: collection.color || '#666', mr: 1 }} />
                <Typography variant="body2">
                  {collection.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Chip 
                  label={collection.case_count || 0} 
                  size="small" 
                  variant="outlined"
                />
                {collection.subcollection_count && collection.subcollection_count > 0 && (
                  <Chip 
                    label={`+${collection.subcollection_count}`} 
                    size="small" 
                    variant="outlined"
                    color="secondary"
                  />
                )}
              </Box>
            </Box>
          </MenuItem>
        ))}

        {collections.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              No collections yet
            </Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};