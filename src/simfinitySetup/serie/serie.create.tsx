import * as React from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { registerFormCustomization, FormField, FormCustomizationActions } from '@simtlix/simfinity-fe-components';
import { RichTextEditor, CountrySelector, CategoriesInput } from '@/components/custom';

export function registerSerieCreateCustomization() {
  registerFormCustomization("serie", "create", {
    mode: "stepper",
    steps: [
      {
        stepId: "basic-info",
        stepLabel: 'serie.step.basicInfo',
        onNext: async (formData, collectionChanges, transformedData) => {
          console.log('On next:', { formData, collectionChanges, transformedData });
          return true;
        },
        onBack(formData, collectionChanges, transformedData) {
          console.log('On back:', { formData, collectionChanges, transformedData });
          return true;
        },
      },
      {
        stepId: "description",
        stepLabel: 'serie.step.description',
      },
      {
        stepId: "director",
        stepLabel: 'serie.step.director',
      },
      {
        stepId: "seasons",
        stepLabel: 'serie.step.seasons',
      }
    ],

    fieldsCustomization: {
      name: {
        stepId: "basic-info",
        size: { xs: 12, sm: 12, md: 12 },
        order: 1,
        onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
          console.log('Serie name changed:', { fieldName, value, formData });
          if (value && String(value).trim() !== '') {
            setFieldEnabled('description', true);
          } else {
            setFieldEnabled('description', false);
          }
          return { value, error: undefined };
        }
      },

      categories: {
        stepId: "basic-info",
        size: { xs: 12, sm: 12, md: 12 },
        order: 2,
        customRenderer: (field: FormField, customizationActions: FormCustomizationActions, handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, disabled: boolean) => {
          return (
            <Box>
              <CategoriesInput
                value={field.value as string[] || []}
                onChange={(value) => handleFieldChange(field.name, value)}
                disabled={disabled}
                error={field.error}
              />
            </Box>
          );
        }
      },

      description: {
        stepId: "description",
        size: { xs: 12, sm: 12, md: 12 },
        order: 3,
        enabled: false,
        customRenderer: (field: FormField, customizationActions: FormCustomizationActions, handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, disabled: boolean) => {
          return (
            <RichTextEditor
              value={field.value as string || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              disabled={disabled}
              error={field.error}
            />
          );
        }
      },

      director: {
        stepId: "director",
        size: { xs: 12, sm: 12, md: 12 },
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
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Director Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Director Name"
                  value={nameValue}
                  onChange={(e) => handleEmbeddedFieldChange(field.name, 'name', e.target.value)}
                  disabled={disabled}
                  fullWidth
                  variant="filled"
                  required
                />
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Country
                  </Typography>
                  <CountrySelector
                    value={countryValue}
                    onChange={(value) => handleEmbeddedFieldChange(field.name, 'country', value)}
                    disabled={disabled}
                    error={undefined}
                  />
                </Box>
              </Box>
            </Paper>
          );
        }
      },

      seasons: {
        stepId: "seasons",
        size: { xs: 12, sm: 12, md: 12 },
        order: 5,
      }
    },
    beforeSubmit: async (formData, collectionChanges, transformedData) => {
      console.log('Before submitting:', { formData, collectionChanges, transformedData });
      return true;
    },
    onSuccess: async (result) => {
      console.log('Success:', result);
      return;
    },
    onError: async (error) => {
      console.log('Error:', error);
      return;
    }
  });
}
