import React from 'react';
import { Box, Typography, TextField, Grid, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  registerFormCustomization, 
  FormField, 
  FormCustomizationActions 
} from '../lib/formCustomization';

/**
 * Example: Custom Embedded Renderer
 * 
 * This example demonstrates how to use the customEmbeddedRenderer feature
 * to completely customize how an embedded object section is rendered.
 * 
 * Instead of the default accordion layout, you can create:
 * - Custom layouts (side-by-side fields, card layouts, etc.)
 * - Custom styling and visual presentation
 * - Custom interaction patterns
 * - Conditional field rendering based on complex business logic
 */

// Example 1: Custom Director Card Renderer for Series
const customDirectorRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleEmbeddedFieldChange: (
    sectionName: string, 
    fieldName: string, 
    value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }, 
    error?: string
  ) => void,
  disabled: boolean,
  formData: Record<string, unknown>
) => {
  // Extract embedded field values from formData
  const nameField = field.embeddedFields?.find(f => f.name.endsWith('.name'));
  const ageField = field.embeddedFields?.find(f => f.name.endsWith('.age'));
  const bioField = field.embeddedFields?.find(f => f.name.endsWith('.bio'));
  
  const nameValue = (formData[nameField?.name || ''] as { value?: string })?.value || '';
  const ageValue = (formData[ageField?.name || ''] as { value?: number })?.value || 0;
  const bioValue = (formData[bioField?.name || ''] as { value?: string })?.value || '';

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        🎬 Director Information
      </Typography>
      
      <Grid container spacing={2}>
        {/* Name field - full width */}
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Director Name"
            value={nameValue}
            onChange={(e) => handleEmbeddedFieldChange(field.name, 'name', e.target.value)}
            disabled={disabled}
            fullWidth
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'primary.light' },
                '&:hover fieldset': { borderColor: 'primary.main' },
              }
            }}
          />
        </Grid>
        
        {/* Age field - half width */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Age"
            type="number"
            value={ageValue}
            onChange={(e) => handleEmbeddedFieldChange(field.name, 'age', parseInt(e.target.value) || 0)}
            disabled={disabled}
            fullWidth
            variant="outlined"
          />
        </Grid>
        
        {/* Bio field - grows to fill remaining space */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Biography"
            value={bioValue}
            onChange={(e) => handleEmbeddedFieldChange(field.name, 'bio', e.target.value)}
            disabled={disabled}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

// Example 2: Compact Side-by-Side Layout for Production Details
const customProductionRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleEmbeddedFieldChange: (
    sectionName: string, 
    fieldName: string, 
    value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }, 
    error?: string
  ) => void,
  disabled: boolean,
  formData: Record<string, unknown>
) => {
  const budgetField = field.embeddedFields?.find(f => f.name.endsWith('.budget'));
  const studioField = field.embeddedFields?.find(f => f.name.endsWith('.studio'));
  const countryField = field.embeddedFields?.find(f => f.name.endsWith('.country'));
  
  const budgetValue = (formData[budgetField?.name || ''] as { value?: number })?.value || 0;
  const studioValue = (formData[studioField?.name || ''] as { value?: string })?.value || '';
  const countryValue = (formData[countryField?.name || ''] as { value?: string })?.value || '';

  return (
    <Box 
      sx={{ 
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 2,
        p: 2,
        backgroundColor: 'grey.50'
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        💼 Production Details
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Budget ($)"
            type="number"
            value={budgetValue}
            onChange={(e) => handleEmbeddedFieldChange(field.name, 'budget', parseFloat(e.target.value) || 0)}
            disabled={disabled}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Studio"
            value={studioValue}
            onChange={(e) => handleEmbeddedFieldChange(field.name, 'studio', e.target.value)}
            disabled={disabled}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Country"
            value={countryValue}
            onChange={(e) => handleEmbeddedFieldChange(field.name, 'country', e.target.value)}
            disabled={disabled}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Example 3: Collapsible with Custom Header showing current values
const CustomCollapsibleRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleEmbeddedFieldChange: (
    sectionName: string, 
    fieldName: string, 
    value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }, 
    error?: string
  ) => void,
  disabled: boolean,
  formData: Record<string, unknown>
) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Get summary values for the header
  const nameField = field.embeddedFields?.find(f => f.name.includes('name'));
  const yearField = field.embeddedFields?.find(f => f.name.includes('year'));
  
  const nameValue = (formData[nameField?.name || ''] as { value?: string })?.value || 'Unnamed';
  const yearValue = (formData[yearField?.name || ''] as { value?: number })?.value || new Date().getFullYear();

  return (
    <Accordion 
      expanded={expanded} 
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{ 
        border: '2px solid',
        borderColor: 'primary.light',
        borderRadius: 2,
        '&:before': { display: 'none' },
        boxShadow: 3
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
          minHeight: 64,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        }}
      >
        <Typography variant="h6">
          📋 Technical Specifications
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {nameValue} ({yearValue})
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {field.embeddedFields?.map(embeddedField => {
            const fieldName = embeddedField.name.split('.').pop() || '';
            const currentValue = (formData[embeddedField.name] as { value?: unknown })?.value;
            
            return (
              <Grid key={embeddedField.name} size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                  value={currentValue || ''}
                  onChange={(e) => {
                    const value = embeddedField.isNumeric 
                      ? (parseFloat(e.target.value) || 0)
                      : e.target.value;
                    handleEmbeddedFieldChange(field.name, fieldName, value);
                  }}
                  disabled={disabled}
                  fullWidth
                  type={embeddedField.isNumeric ? 'number' : 'text'}
                  multiline={fieldName.includes('description') || fieldName.includes('bio')}
                  rows={fieldName.includes('description') || fieldName.includes('bio') ? 3 : 1}
                />
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

// Register customizations for different entities and modes
export function registerCustomEmbeddedRendererExamples() {
  // Example 1: Series with custom director renderer
  registerFormCustomization("series", "edit", {
    fieldsCustomization: {
      director: {
        size: { xs: 12, md: 6 }, // Half width on desktop
        customEmbeddedRenderer: customDirectorRenderer
      },
      production: {
        size: { xs: 12, md: 6 }, // Half width on desktop 
        customEmbeddedRenderer: customProductionRenderer
      }
    }
  });

  // Example 2: Movies with collapsible technical specs
  registerFormCustomization("movie", "create", {
    fieldsCustomization: {
      technicalSpecs: {
        customEmbeddedRenderer: CustomCollapsibleRenderer,
        order: 10 // Render after main fields
      }
    }
  });

  // Example 3: View mode with read-only custom renderer
  registerFormCustomization("series", "view", {
    fieldsCustomization: {
      director: {
        customEmbeddedRenderer: (field, actions, handleChange, disabled, formData) => {
          const nameValue = (formData[`${field.name}.name`] as { value?: string })?.value || 'Unknown';
          const ageValue = (formData[`${field.name}.age`] as { value?: number })?.value || 0;
          
          return (
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
              <Typography variant="h6" color="primary">
                🎬 {nameValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Age: {ageValue} years
              </Typography>
            </Paper>
          );
        }
      }
    }
  });
}

/**
 * Usage Notes:
 * 
 * 1. The customEmbeddedRenderer receives the complete FormField for the embedded section,
 *    which includes all embedded fields in the embeddedFields array.
 * 
 * 2. You have access to the current form data via the formData parameter, allowing you
 *    to read values from any field (not just the embedded section).
 * 
 * 3. Use handleEmbeddedFieldChange(sectionName, fieldName, value, error?) to update
 *    embedded field values. The sectionName should be field.name, and fieldName should
 *    be the name of the specific embedded field (without the section prefix).
 * 
 * 4. The disabled parameter indicates whether the entire section should be disabled
 *    (view mode, or section-level disable).
 * 
 * 5. You can use customizationActions to programmatically control other form fields:
 *    - setFieldData(fieldName, value) - Update any form field
 *    - setFieldVisible(fieldName, visible) - Show/hide fields
 *    - setFieldEnabled(fieldName, enabled) - Enable/disable fields
 * 
 * 6. Size control: Use the size property in the embedded section customization to
 *    control how much space the entire custom renderer takes in the main form layout.
 * 
 * 7. Order control: Use the order property to control where the embedded section
 *    appears relative to other form fields and sections.
 */
