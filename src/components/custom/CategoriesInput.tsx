import * as React from 'react';
import { TextField, Box, Typography, Chip } from '@mui/material';

export interface CategoriesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  error?: string;
}

export const CategoriesInput = ({ value, onChange, disabled, error }: CategoriesInputProps) => {
  const [newCategory, setNewCategory] = React.useState('');
  const categories = value || [];

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      onChange(updatedCategories);
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    const updatedCategories = categories.filter(cat => cat !== categoryToRemove);
    onChange(updatedCategories);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Type and press Enter to add categories..."
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        error={!!error}
        helperText={error}
        variant="filled"
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category: string) => (
          <Chip
            key={category}
            label={category}
            onDelete={disabled ? undefined : () => removeCategory(category)}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              borderColor: '#1976d2',
              '&:hover': { backgroundColor: '#bbdefb' }
            }}
          />
        ))}
        {categories.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            No categories added yet
          </Typography>
        )}
      </Box>
    </Box>
  );
};
