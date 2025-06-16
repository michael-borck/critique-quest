import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Box } from '@mui/material';

interface MarkdownRendererProps {
  content: string;
  maxLines?: number;
  sx?: any;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  maxLines,
  sx = {}
}) => {
  const baseStyles = {
    '& h1': {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      marginTop: '1rem',
      '&:first-of-type': {
        marginTop: 0,
      },
    },
    '& h2': {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      marginTop: '1rem',
    },
    '& h3': {
      fontSize: '1.1rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      marginTop: '0.75rem',
    },
    '& p': {
      marginBottom: '0.75rem',
      lineHeight: 1.6,
      '&:last-child': {
        marginBottom: 0,
      },
    },
    '& ul, & ol': {
      marginBottom: '0.75rem',
      paddingLeft: '1.5rem',
    },
    '& li': {
      marginBottom: '0.25rem',
      lineHeight: 1.6,
    },
    '& blockquote': {
      borderLeft: '4px solid #e0e0e0',
      paddingLeft: '1rem',
      margin: '1rem 0',
      fontStyle: 'italic',
      color: '#666',
    },
    '& code': {
      backgroundColor: '#f5f5f5',
      padding: '0.125rem 0.25rem',
      borderRadius: '0.25rem',
      fontSize: '0.875em',
      fontFamily: 'monospace',
    },
    '& pre': {
      backgroundColor: '#f5f5f5',
      padding: '1rem',
      borderRadius: '0.5rem',
      overflow: 'auto',
      marginBottom: '0.75rem',
      '& code': {
        backgroundColor: 'transparent',
        padding: 0,
      },
    },
    '& strong': {
      fontWeight: 600,
    },
    '& em': {
      fontStyle: 'italic',
    },
    '& hr': {
      border: 'none',
      borderTop: '1px solid #e0e0e0',
      margin: '1.5rem 0',
    },
    // Truncation styles when maxLines is specified
    ...(maxLines && {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: maxLines,
      WebkitBoxOrient: 'vertical',
      textOverflow: 'ellipsis',
    }),
    ...sx,
  };

  return (
    <Box sx={baseStyles}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};