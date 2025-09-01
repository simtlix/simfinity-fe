import * as React from 'react';
import { 
  TextField, 
  Box, 
  Typography, 
  Paper, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput
} from '@mui/material';
import { registerFormCustomization, FormField, FormCustomizationActions } from '@/lib/formCustomization';

// Rich Text Editor Component for Description
const RichTextEditor = ({ 
  value, 
  onChange, 
  disabled, 
  error 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  disabled: boolean; 
  error?: string; 
}) => {
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
          variant="outlined"
          placeholder="Enter a rich description for the serie..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          sx={{
            '& .MuiOutlinedInput-root': {
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
          <Chip 
            label="Bold" 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip 
            label="Italic" 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip 
            label="Link" 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip 
            label="List" 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

// Custom Country Selector for Director
const CountrySelector = ({ 
  value, 
  onChange, 
  disabled, 
  error 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  disabled: boolean; 
  error?: string; 
}) => {
  // List of countries - in a real app, this could come from an API or configuration
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'ES', name: 'Spain' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'CL', name: 'Chile' },
    { code: 'BR', name: 'Brazil' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'DE', name: 'Germany' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' }
  ];

  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      <InputLabel id="country-select-label">Country</InputLabel>
      <Select
        labelId="country-select-label"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        input={<OutlinedInput label="Country" />}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#fafafa',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff'
            }
          }
        }}
      >
        {countries.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                {country.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  backgroundColor: '#e3f2fd', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.7rem'
                }}
              >
                {country.code}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Custom Categories Input with Tags
const CategoriesInput = ({ 
  value, 
  onChange, 
  disabled, 
  error 
}: { 
  value: string[]; 
  onChange: (value: string[]) => void; 
  disabled: boolean; 
  error?: string; 
}) => {
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
        variant="outlined"
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
              '&:hover': {
                backgroundColor: '#bbdefb'
              }
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

// Serie Form Customization Setup
export function setupSerieFormCustomization() {
  // Register customization for create mode
  registerFormCustomization("serie", "create", {
    fieldsCustomization: {
      // Name field - 50% width on first line
      name: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 1,
        onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
          console.log('Serie name changed:', { fieldName, value, formData });
          
          // Auto-enable description when name is provided
          if (value && String(value).trim() !== '') {
            setFieldEnabled('description', true);
          } else {
            setFieldEnabled('description', false);
          }
          
          return { value, error: undefined };
        }
      },
      
      // Categories field - 50% width on first line
      categories: {
        size: { xs: 12, sm: 6, md: 6 },
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
      
      // Description field - full width with rich text editor
      description: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 3,
        enabled: false, // Initially disabled until name is provided
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
      
      // Embedded object customization for director
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
          // Extract embedded field values from formData
          const nameField = field.embeddedFields?.find(f => f.name.endsWith('.name'));
          const countryField = field.embeddedFields?.find(f => f.name.endsWith('.country'));
          
          const nameValue = (formData[nameField?.name || ''] as { value?: string })?.value || '';
          const countryValue = (formData[countryField?.name || ''] as { value?: string })?.value || '';

          return (
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                🎬 Director Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Director Name field */}
                <TextField
                  label="Director Name"
                  value={nameValue}
                  onChange={(e) => handleEmbeddedFieldChange(field.name, 'name', e.target.value)}
                  disabled={disabled}
                  fullWidth
                  variant="outlined"
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'primary.light' },
                      '&:hover fieldset': { borderColor: 'primary.main' },
                    }
                  }}
                />
                
                {/* Country field with custom selector */}
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
      }
    }
  });

  // Register customization for edit mode
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      // Name field - 50% width on first line
      name: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 1,
        onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
          console.log('Serie name changed in edit mode:', { fieldName, value, formData });
          return { value, error: undefined };
        }
      },
      
      // Categories field - 50% width on first line
      categories: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 2,
        customRenderer: (field: FormField, customizationActions: FormCustomizationActions, handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, disabled: boolean) => {
          return (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Categories
              </Typography>
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
      
      // Description field - full width with rich text editor
      description: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 3,
        enabled: true, // Always enabled in edit mode
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
      
      // Embedded object customization for director
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
          // Extract embedded field values from formData
          const nameField = field.embeddedFields?.find(f => f.name.endsWith('.name'));
          const countryField = field.embeddedFields?.find(f => f.name.endsWith('.country'));
          
          const nameValue = (formData[nameField?.name || ''] as { value?: string })?.value || '';
          const countryValue = (formData[countryField?.name || ''] as { value?: string })?.value || '';

          return (
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                🎬 Director Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Director Name field */}
                <TextField
                  label="Director Name"
                  value={nameValue}
                  onChange={(e) => handleEmbeddedFieldChange(field.name, 'name', e.target.value)}
                  disabled={disabled}
                  fullWidth
                  variant="outlined"
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'primary.light' },
                      '&:hover fieldset': { borderColor: 'primary.main' },
                    }
                  }}
                />
                
                {/* Country field with custom selector */}
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
      }
    }
  });

  // Register customization for view mode
  registerFormCustomization("serie", "view", {
    fieldsCustomization: {
      // Name field - 50% width on first line
      name: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 1
      },
      
      // Categories field - 50% width on first line
      categories: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 2,
        customRenderer: (field: FormField, customizationActions: FormCustomizationActions, handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, disabled: boolean) => {
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
                      sx={{
                        backgroundColor: '#e3f2fd',
                        borderColor: '#1976d2'
                      }}
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
      
      // Description field - full width with rich text display
      description: {
        size: { xs: 12, sm: 12, md: 12 },
        order: 3,
        customRenderer: (field: FormField, customizationActions: FormCustomizationActions, handleFieldChange: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, disabled: boolean) => {
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
      
      // Embedded object customization for director (view mode)
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
          // Extract embedded field values from formData
          const nameField = field.embeddedFields?.find(f => f.name.endsWith('.name'));
          const countryField = field.embeddedFields?.find(f => f.name.endsWith('.country'));
          
          const nameValue = (formData[nameField?.name || ''] as { value?: string })?.value || '';
          const countryValue = (formData[countryField?.name || ''] as { value?: string })?.value || '';

          return (
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                🎬 Director Information
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

// Call this function in your app initialization
// setupSerieFormCustomization();
