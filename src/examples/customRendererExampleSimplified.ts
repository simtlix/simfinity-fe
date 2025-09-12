import * as React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { registerFormCustomization, FormField, FormCustomizationActions, ParentFormAccess } from '@/components/simfinity-fe/lib/formCustomization';

// Simplified example of custom field renderers without React hooks
export function setupCustomRendererExamples() {
  
  // Example 1: Custom field renderer for a rich text field (without hooks)
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      description: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 2,
        customRenderer: (
          field: FormField, 
          customizationActions: FormCustomizationActions, 
          handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, 
          disabled: boolean
        ) => {
          return React.createElement(Box, null, [
            React.createElement(TextField, {
              key: 'description-field',
              fullWidth: true,
              label: 'Description',
              multiline: true,
              rows: 4,
              value: field.value as string || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                handleFieldChange(field.name, e.target.value),
              disabled,
              error: !!field.error,
              helperText: field.error,
              variant: 'outlined'
            }),
            React.createElement(Typography, {
              key: 'helper-text',
              variant: 'caption',
              sx: { mt: 1, color: 'text.secondary' }
            }, 'Custom rich text field renderer')
          ]);
        }
      },
      
      // Example 2: Custom renderer for a simple field with validation
      title: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 1,
        customRenderer: (
          field: FormField, 
          customizationActions: FormCustomizationActions, 
          handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, 
          disabled: boolean
        ) => {
          const value = field.value as string || '';
          const isLong = value.length > 50;
          
          return React.createElement(Box, null, [
            React.createElement(TextField, {
              key: 'title-field',
              fullWidth: true,
              label: 'Title',
              value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                handleFieldChange(field.name, e.target.value),
              disabled,
              error: !!field.error || isLong,
              helperText: field.error || (isLong ? 'Title should be under 50 characters' : `${value.length}/50 characters`),
              variant: 'outlined'
            })
          ]);
        }
      }
    }
  });

  // Example 3: Custom collection renderer (basic example without hooks)
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      episodes: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 4,
        customCollectionRenderer: (
          collectionFieldName: string,
          _parentFormAccess: ParentFormAccess,
          collectionState: Record<string, unknown>
        ) => {
          const state = collectionState as { added?: Record<string, unknown>[], modified?: Record<string, unknown>[], original?: Record<string, unknown>[] };
          const allItems = [
            ...(state?.added || []),
            ...(state?.modified || []),
            ...(state?.original || [])
          ].filter((item: Record<string, unknown>) => item.__status !== 'deleted');
          
          return React.createElement(Box, {
            key: 'episodes-collection',
            sx: { p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }
          }, [
            React.createElement(Typography, {
              key: 'title',
              variant: 'h6',
              sx: { mb: 2 }
            }, `Custom Episodes Renderer (${allItems.length} items)`),
            React.createElement(Typography, {
              key: 'info',
              variant: 'body2',
              color: 'text.secondary'
            }, 'This is a simplified custom collection renderer without complex state management.')
          ]);
        }
      }
    }
  });
}

// Call this function in your app initialization
// setupCustomRendererExamples();
