import * as React from 'react';
import { TextField, Box, Typography, Paper, Chip } from '@mui/material';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
}

export const RichTextEditor = ({ value, onChange, disabled, error }: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <Paper 
      elevation={isFocused ? 2 : 1} 
      sx={{ 
        transition: 'all 0.2s ease-in-out',
        border: error ? '2px solid #d32f2f' : '1px solid #e0e0e0',
        '&:hover': {
          borderColor: error ? '#d32f2f' : '#1976d2',
          boxShadow: error ? '0 0 0 2px rgba(211, 47, 47, 0.2)' : '0 0 0 2px rgba(25, 118, 210, 0.2)'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 1, fontWeight: 500 }}
        >
          Rich Text Editor
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
          helperText={error}
          variant="filled"
          placeholder="Enter a rich description for the serie..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          sx={{
            '& .MuiFilledInput-root': {
              backgroundColor: '#fafafa',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff'
              }
            }
          }}
        />
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Bold" size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
          <Chip label="Italic" size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
          <Chip label="Link" size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
          <Chip label="List" size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
        </Box>
      </Box>
    </Paper>
  );
};
