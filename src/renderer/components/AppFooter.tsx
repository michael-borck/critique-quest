import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info,
  TrendingUp,
  AttachMoney,
  Computer,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';

interface UsageStats {
  totalTokens: number;
  totalCost: number;
  sessionTokens: number;
  sessionCost: number;
  mostUsedProvider: string;
}

export const AppFooter: React.FC = () => {
  const { preferences } = useAppStore();
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalTokens: 0,
    totalCost: 0,
    sessionTokens: 0,
    sessionCost: 0,
    mostUsedProvider: 'N/A',
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadUsageStats();
    // Set up interval to refresh stats periodically
    const interval = setInterval(loadUsageStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadUsageStats = async () => {
    try {
      const stats = await window.electronAPI.getUsageStats();
      setUsageStats({
        totalTokens: stats.totalTokens,
        totalCost: stats.totalCost,
        sessionTokens: stats.sessionTokens,
        sessionCost: stats.sessionCost,
        mostUsedProvider: stats.mostUsedProvider === 'None' 
          ? preferences?.default_ai_provider || 'N/A'
          : stats.mostUsedProvider,
      });
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      // Fallback to basic data
      setUsageStats({
        totalTokens: 0,
        totalCost: 0,
        sessionTokens: 0,
        sessionCost: 0,
        mostUsedProvider: preferences?.default_ai_provider || 'N/A',
      });
    }
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens === 0) return '0';
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 32,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        zIndex: 1000,
        fontSize: '0.75rem',
      }}
    >
      {/* Left section - Provider */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Computer sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          Provider: 
        </Typography>
        <Chip
          label={preferences?.default_ai_provider === 'ollama' ? 'Ollama (Local)' : preferences?.default_ai_provider || 'None'}
          color={preferences?.default_ai_provider === 'ollama' ? 'success' : 'primary'}
          size="small"
          sx={{ 
            height: 20, 
            fontSize: '0.7rem',
            '& .MuiChip-label': { px: 1 }
          }}
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Center section - Usage stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Session usage (tokens used this session)">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Session: {formatTokens(usageStats.sessionTokens)} tokens
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title="Session cost (estimated cost this session)">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoney sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatCost(usageStats.sessionCost)}
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Right section - Total stats and info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Total usage across all sessions">
          <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }}>
            Total: {formatTokens(usageStats.totalTokens)} tokens • {formatCost(usageStats.totalCost)}
          </Typography>
        </Tooltip>
        
        <Tooltip title="Click for detailed usage statistics">
          <IconButton
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            sx={{ p: 0.25 }}
          >
            <Info sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};