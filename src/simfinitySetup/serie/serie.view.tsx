import * as React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { registerFormCustomization, FormField, FormCustomizationActions } from '@simtlix/simfinity-fe-components';

export function registerSerieViewCustomization() {
  registerFormCustomization("serie", "view", {
    fieldsCustomization: {
      name: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 1
      },

      categories: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 2,
        customRenderer: (field: FormField) => {
          const categories = field.value as string[] || [];
          return (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.length > 0 ? (
                  categories.map((category: string) => (
                    <Chip
                      key={category}
                      label={category}
                      variant="outlined"
                      size="small"
                      sx={{ backgroundColor: '#e3f2fd', borderColor: '#1976d2' }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No categories assigned
                  </Typography>
                )}
              </Box>
            </Box>
          );
        }
      },

      description: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 3,
        customRenderer: (field: FormField) => {
          return (
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Description
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  color: field.value ? 'text.primary' : 'text.secondary'
                }}
              >
                {typeof field.value === 'string' ? field.value : 'No description provided'}
              </Typography>
            </Paper>
          );
        }
      },

      director: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 4,
        customEmbeddedRenderer: (
          field: FormField,
          customizationActions: FormCustomizationActions,
          handleEmbeddedFieldChange: (sectionName: string, fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }, error?: string) => void,
          disabled: boolean,
          formData: Record<string, unknown>
        ) => {
          const nameField = field.embeddedFields?.find(f => f.name.endsWith('.name'));
          const countryField = field.embeddedFields?.find(f => f.name.endsWith('.country'));
          const nameValue = (formData[nameField?.name || ''] as { value?: string })?.value || '';
          const countryValue = (formData[countryField?.name || ''] as { value?: string })?.value || '';

          return (
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Director Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Director Name
                  </Typography>
                  <Typography variant="body1">
                    {nameValue || 'Not specified'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Country
                  </Typography>
                  <Typography variant="body1">
                    {countryValue || 'Not specified'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        }
      }
    }
  });
}
