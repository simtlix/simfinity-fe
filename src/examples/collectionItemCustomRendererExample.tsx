import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Grid, 
  Paper, 
  Chip, 
  Slider, 
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating,
  Switch
} from '@mui/material';
import { 
  registerFormCustomization, 
  FormField, 
  FormCustomizationActions 
} from '../lib/formCustomization';

/**
 * Example: Custom Renderers for Collection Item Forms
 * 
 * This example demonstrates how to use customRenderer for fields
 * within collection item edit forms (e.g., episode forms within a series).
 * 
 * Collection item custom renderers work the same as regular field custom renderers
 * but are specifically applied when editing items in collection grids.
 */

// Example 1: Custom Episode Rating Renderer
const customRatingRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void,
  disabled: boolean
) => {
  const currentValue = field.value as number || 0;
  
  return (
    <Paper elevation={1} sx={{ p: 2, backgroundColor: 'primary.50' }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
        ⭐ Episode Rating
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Rating
          value={currentValue}
          onChange={(_, newValue) => handleFieldChange(field.name, newValue || 0)}
          disabled={disabled}
          max={10}
          precision={0.5}
          size="large"
        />
        <Typography variant="body1" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
          {currentValue}/10
        </Typography>
      </Box>
      
      <Slider
        value={currentValue}
        onChange={(_, newValue) => handleFieldChange(field.name, newValue as number)}
        disabled={disabled}
        min={0}
        max={10}
        step={0.1}
        valueLabelDisplay="auto"
        sx={{ mt: 2 }}
      />
    </Paper>
  );
};

// Example 2: Custom Duration Renderer with Time Format
const customDurationRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void,
  disabled: boolean
) => {
  const minutes = field.value as number || 0;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  const handleHoursChange = (newHours: number) => {
    const totalMinutes = newHours * 60 + remainingMinutes;
    handleFieldChange(field.name, totalMinutes);
  };
  
  const handleMinutesChange = (newMinutes: number) => {
    const totalMinutes = hours * 60 + newMinutes;
    handleFieldChange(field.name, totalMinutes);
  };
  
  return (
    <Box sx={{ 
      border: '2px solid', 
      borderColor: 'secondary.light', 
      borderRadius: 2, 
      p: 2,
      backgroundColor: 'secondary.50'
    }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: 'secondary.main', fontWeight: 'bold' }}>
        ⏱️ Episode Duration
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 5 }}>
          <TextField
            label="Hours"
            type="number"
            value={hours}
            onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            fullWidth
            size="small"
            inputProps={{ min: 0, max: 23 }}
          />
        </Grid>
        
        <Grid size={{ xs: 2 }}>
          <Typography variant="h6" textAlign="center">:</Typography>
        </Grid>
        
        <Grid size={{ xs: 5 }}>
          <TextField
            label="Minutes"
            type="number"
            value={remainingMinutes}
            onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            fullWidth
            size="small"
            inputProps={{ min: 0, max: 59 }}
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Total: {minutes} minutes ({hours}h {remainingMinutes}m)
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

// Example 3: Custom Tags/Categories Renderer
const CustomTagsRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void,
  disabled: boolean
) => {
  const [newTag, setNewTag] = React.useState('');
  const tags = (field.value as string[]) || [];
  
  const predefinedTags = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Sci-Fi', 'Horror', 'Documentary'];
  
  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      handleFieldChange(field.name, [...tags, tag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    handleFieldChange(field.name, tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, backgroundColor: 'info.50' }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: 'info.main', fontWeight: 'bold' }}>
        🏷️ Episode Tags & Categories
      </Typography>
      
      {/* Current tags */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>Current Tags:</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No tags selected</Typography>
          ) : (
            tags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                onDelete={disabled ? undefined : () => removeTag(tag)}
                color="primary"
                variant="filled"
              />
            ))
          )}
        </Box>
      </Box>
      
      {/* Quick add predefined tags */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>Quick Add:</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {predefinedTags
            .filter(tag => !tags.includes(tag))
            .map(tag => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => addTag(tag)}
                disabled={disabled}
                variant="outlined"
                color="secondary"
                sx={{ cursor: disabled ? 'default' : 'pointer' }}
              />
            ))
          }
        </Box>
      </Box>
      
      {/* Add custom tag */}
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 8 }}>
          <TextField
            size="small"
            placeholder="Add custom tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
            disabled={disabled}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <button
            onClick={() => addTag(newTag)}
            disabled={disabled || !newTag.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: disabled ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled ? 'default' : 'pointer',
              width: '100%'
            }}
          >
            Add
          </button>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Example 4: Custom Status Renderer with Icons
const customStatusRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void,
  disabled: boolean
) => {
  const currentValue = field.value as string || 'draft';
  
  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: '📝', color: 'grey' },
    { value: 'review', label: 'In Review', icon: '👀', color: 'orange' },
    { value: 'approved', label: 'Approved', icon: '✅', color: 'green' },
    { value: 'published', label: 'Published', icon: '🚀', color: 'blue' },
    { value: 'archived', label: 'Archived', icon: '📦', color: 'grey' }
  ];
  
  return (
    <Box sx={{ 
      border: '2px solid', 
      borderColor: 'warning.light', 
      borderRadius: 3, 
      p: 2,
      backgroundColor: 'warning.50'
    }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: 'warning.main', fontWeight: 'bold' }}>
        📊 Episode Status
      </Typography>
      
      <FormControl component="fieldset">
        <RadioGroup
          value={currentValue}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
        >
          {statusOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              disabled={disabled}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: '1.2em' }}>{option.icon}</span>
                  <Typography variant="body2">{option.label}</Typography>
                </Box>
              }
              sx={{
                border: currentValue === option.value ? '2px solid' : '1px solid',
                borderColor: currentValue === option.value ? `${option.color}.main` : 'grey.300',
                borderRadius: 2,
                p: 1,
                m: 0.5,
                backgroundColor: currentValue === option.value ? `${option.color}.50` : 'transparent'
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

// Example 5: Simple Toggle Renderer for Featured Episodes
const customFeaturedRenderer = (
  field: FormField,
  customizationActions: FormCustomizationActions,
  handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void,
  disabled: boolean
) => {
  const isFeatured = field.value as boolean || false;
  
  return (
    <Paper elevation={1} sx={{ 
      p: 2, 
      backgroundColor: isFeatured ? 'success.50' : 'grey.50',
      border: '2px solid',
      borderColor: isFeatured ? 'success.main' : 'grey.300'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">{isFeatured ? '⭐' : '☆'}</Typography>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Featured Episode
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isFeatured ? 'This episode will be highlighted' : 'Mark as featured to highlight'}
            </Typography>
          </Box>
        </Box>
        
        <Switch
          checked={isFeatured}
          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
          disabled={disabled}
          color="success"
          size="medium"
        />
      </Box>
    </Paper>
  );
};

// Register customizations for collection items (episodes within series)
export function registerCollectionItemCustomRendererExamples() {
  // Episodes in series - comprehensive example
  registerFormCustomization("series", "edit", {
    fieldsCustomization: {
      episodes: {
        // Mode-specific customizations for creating episodes
        onCreate: {
          fieldsCustomization: {
            rating: {
              customRenderer: customRatingRenderer,
              size: { xs: 12, md: 6 }
            },
            duration: {
              customRenderer: customDurationRenderer,
              size: { xs: 12, md: 6 }
            },
            tags: {
              customRenderer: CustomTagsRenderer,
              size: { xs: 12 }
            }
          }
        },
        
        // Mode-specific customizations for editing episodes
        onEdit: {
          fieldsCustomization: {
            rating: {
              customRenderer: customRatingRenderer,
              size: { xs: 12, md: 4 }
            },
            duration: {
              customRenderer: customDurationRenderer,
              size: { xs: 12, md: 4 }
            },
            status: {
              customRenderer: customStatusRenderer,
              size: { xs: 12, md: 4 }
            },
            tags: {
              customRenderer: CustomTagsRenderer,
              size: { xs: 12, md: 8 }
            },
            featured: {
              customRenderer: customFeaturedRenderer,
              size: { xs: 12, md: 4 }
            }
          }
        }
      }
    }
  });

  // Seasons in series - simpler example
  registerFormCustomization("series", "edit", {
    fieldsCustomization: {
      seasons: {
        onEdit: {
          fieldsCustomization: {
            featured: {
              customRenderer: customFeaturedRenderer,
              size: { xs: 12, sm: 6 }
            }
          }
        },
        onCreate: {
          fieldsCustomization: {
            featured: {
              customRenderer: customFeaturedRenderer,
              size: { xs: 12 }
            }
          }
        }
      }
    }
  });
}

/**
 * Usage Notes for Collection Item Custom Renderers:
 * 
 * 1. Collection item custom renderers work within the CollectionItemEditForm dialog
 *    that opens when you click "Add" or "Edit" on collection items.
 * 
 * 2. You can have different customizations for onCreate vs onEdit modes:
 *    - onCreate: Customizations applied when adding new collection items
 *    - onEdit: Customizations applied when editing existing collection items
 * 
 * 3. The field parameter contains the complete field information including current value.
 * 
 * 4. Use handleFieldChange(fieldName, value) to update the field value in the form.
 * 
 * 5. The disabled parameter indicates if the field should be disabled (based on form state).
 * 
 * 6. You can use customizationActions to control other fields in the collection item form:
 *    - setFieldData(fieldName, value) - Update any field
 *    - setFieldVisible(fieldName, visible) - Show/hide fields
 *    - setFieldEnabled(fieldName, enabled) - Enable/disable fields
 * 
 * 7. Size control: Use the size property to control field layout within the dialog.
 * 
 * 8. These custom renderers only apply to the collection item edit forms, not the
 *    main entity form or the collection grid display.
 * 
 * 9. The customization structure follows this pattern:
 *    entityType -> mode -> fieldsCustomization -> collectionFieldName -> 
 *    onEdit/onCreate -> fieldsCustomization -> fieldName -> customRenderer
 */
