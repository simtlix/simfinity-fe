# Form Customization System

The Form Customization System allows you to control the layout, behavior, and validation of form fields in EntityForm components. This system provides a flexible way to customize forms without modifying the core component code.

## Features

- **Responsive Grid Layout**: Control field sizes across different breakpoints (xs, sm, md, lg, xl)
- **Field Ordering**: Define the sequence in which fields appear in the form
- **Field Visibility**: Show/hide fields dynamically based on conditions
- **Field State**: Enable/disable fields based on business logic
- **Custom Validation**: Add custom error messages for fields
- **Custom onChange Events**: Implement complex field interactions and dependencies
- **Entity-Level Callbacks**: Execute custom logic before/after form submissions and handle errors
- **Form-Level Messages**: Display messages at the form level with different severity types
- **Collection Management**: Handle collection changes in both create and edit modes

## Basic Usage

### 1. Import the Registration Function

```typescript
import { registerFormCustomization } from '@/lib/formCustomization';
```

### 2. Register Customizations for an Entity Type

```typescript
registerFormCustomization("serie", "create", {
  fieldsCustomization: {
    name: {
      size: { xs: 12, sm: 6, md: 4 },
      order: 1,
      enabled: true,
      visible: true,
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
        if (!value || String(value).trim() === '') {
          return { value, error: "Name is required" };
        }
        return { value, error: undefined };
      }
    }
  },
  // Entity-level callbacks (optional)
  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    // Custom validation or data processing before submission
    console.log('About to submit:', { formData, collectionChanges, transformedData });
  },
  onSuccess: async (result) => {
    // Custom actions after successful submission
    return {
      message: 'Entity created successfully!',
      navigateTo: '/entities/series'
    };
  },
  onError: async (error, formData, actions) => {
    // Custom error handling
    actions.setFormMessage({
      type: 'error',
      message: `Failed to create entity: ${error.message}`
    });
  }
});
```

### 3. Call Registration Early in Your App

```typescript
// In your app initialization (e.g., layout.tsx, app.tsx)
import { setupFormCustomizations } from '@/examples/formCustomizationExample';

setupFormCustomizations();
```

## Configuration Options

### Field Size (`size`)

Control the responsive grid layout using Material-UI's 12-column grid system:

```typescript
size: {
  xs: 12,    // Full width on extra small screens
  sm: 6,     // Half width on small screens
  md: 4,     // One-third width on medium screens
  lg: 3,     // One-quarter width on large screens
  xl: 2      // One-sixth width on extra large screens
}
```

**Default**: `{ xs: 12, sm: 6, md: 4 }`

### Embedded Object Sections

For embedded objects, you can customize both the section and individual fields:

#### Section-Level Customization
Control the embedded object section's size and position in the main form:

```typescript
director: {
  size: { xs: 12, sm: 6, md: 6 }, // Section takes half the screen
  order: 3,                        // Section appears after other fields
  visible: true,                   // Section is visible
  enabled: true                    // Section is enabled
}
```

#### Field-Level Customization
Control individual fields within the embedded object, with sizes relative to the section:

```typescript
"director.name": {
  size: { xs: 12, sm: 6, md: 6 }, // Field takes half the section width
  errorMessage: (value) => { /* validation logic */ },
  onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
    // Custom logic for this specific field
    return { value, error: undefined };
  }
}
```

### Field Order (`order`)

Control the sequence of fields in the form. Lower numbers appear first:

```typescript
order: 1  // First field
order: 2  // Second field
order: 3  // Third field
```

**Default**: Fields appear in schema order

### Field Visibility (`visible`)

Control whether a field is visible:

```typescript
visible: true   // Field is visible
visible: false  // Field is hidden
```

**Default**: `true`

### Field State (`enabled`)

Control whether a field is enabled/disabled:

```typescript
enabled: true   // Field is enabled
enabled: false  // Field is disabled
```

**Default**: `true`



### Custom onChange Events (`onChange`)

Implement complex field interactions:

```typescript
onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
  // Your custom logic here
  
  // Example: Show/hide fields based on value
  if (value === 'movie') {
    setFieldVisible('director', true);
    setFieldVisible('year', true);
  } else {
    setFieldVisible('director', false);
    setFieldVisible('year', false);
  }
  
  // Example: Enable/disable fields
  if (String(value).length > 10) {
    setFieldEnabled('description', true);
  } else {
    setFieldEnabled('description', false);
  }
  
  // Example: Auto-fill related fields
  setFieldData('category', 'drama');
  
  // Return the processed value and any errors
  return { 
    value: processedValue, 
    error: undefined 
  };
}
```

#### onChange Parameters

- `fieldName`: Name of the current field
- `value`: Current field value
- `formData`: Current state of all form fields
- `setFieldData`: Function to set a field's value
- `setFieldVisible`: Function to show/hide a field
- `setFieldEnabled`: Function to enable/disable a field

#### setFieldData Usage Examples

The `setFieldData` function supports setting values for different types of fields:

**Regular Fields:**
```typescript
setFieldData('name', 'Breaking Bad');
setFieldData('year', 2008);
setFieldData('isActive', true);
setFieldData('categories', ['Drama', 'Crime']);
```

**Embedded Object Fields (using dot notation):**
```typescript
setFieldData('director.name', 'Vince Gilligan');
setFieldData('director.country', 'United States');
setFieldData('production.company', 'AMC Networks');
setFieldData('production.year', 2008);
```

**Object Fields (ObjectFieldSelector):**
```typescript
// Set the selected object ID
setFieldData('serie', 'serie-123');
setFieldData('category', 'category-456');
```

**Complex Auto-fill Examples:**
```typescript
onChange: (fieldName, value, formData, setFieldData) => {
  // When director name changes, auto-fill related fields
  if (value && typeof value === 'string') {
    if (value.toLowerCase().includes('gilligan')) {
      setFieldData('director.country', 'United States');
      setFieldData('director.genre', 'Drama');
      setFieldData('production.company', 'AMC Networks');
    }
  }
  
  return { value, error: undefined };
}
```

#### onChange Return Value

- `value`: The processed value (can be modified)
- `error`: Optional error message

## Entity-Level Callbacks

Entity-level callbacks allow you to execute custom logic at key points in the form lifecycle: before submission, after success, and on error. These callbacks provide powerful hooks for business logic, validation, and custom user experience flows.

### Registration Format

```typescript
registerFormCustomization("entityType", "mode", {
  fieldsCustomization: {
    // Field-level customizations go here
  },
  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    // Execute before form submission
  },
  onSuccess: async (result) => {
    // Execute after successful submission
  },
  onError: async (error, formData, actions) => {
    // Execute when errors occur
  }
});
```

### beforeSubmit Callback

Executed before the form is submitted to the server. Use this for final validation, data transformation, or business rule enforcement.

**Parameters:**
- `formData`: Current form field values
- `collectionChanges`: Changes to collection fields (added, modified, deleted items)
- `transformedData`: Data prepared for the GraphQL mutation
- `actions`: Object containing functions to modify form state

**Available Actions:**
- `setFieldData(fieldName, value)`: Set a field's value
- `setFieldVisible(fieldName, visible)`: Show/hide a field
- `setFieldEnabled(fieldName, enabled)`: Enable/disable a field
- `setCollectionChanges(fieldName, changes)`: Update collection state
- `setFormMessage(message)`: Display a form-level message
- `setError(errorMessage)`: Set a form-level error

**Example:**
```typescript
beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
  // Validate business rules
  const title = formData.title?.value;
  const genre = formData.genre?.value;
  
  if (genre === 'horror' && title?.includes('kids')) {
    actions.setFormMessage({
      type: 'error',
      message: 'Horror content cannot be marketed to children'
    });
    throw new Error('Validation failed'); // Prevents submission
  }
  
  // Auto-generate missing data
  if (!formData.slug?.value && title) {
    const slug = String(title).toLowerCase().replace(/\s+/g, '-');
    actions.setFieldData('slug', slug);
  }
  
  // Validate collection changes
  if (collectionChanges.episodes?.added.length > 50) {
    actions.setFormMessage({
      type: 'warning',
      message: 'You are adding many episodes. This may take longer to process.'
    });
  }
}
```

### onSuccess Callback

Executed after successful form submission. Use this for custom success messages, navigation, or follow-up actions.

**Parameters:**
- `result`: The GraphQL mutation result

**Return Value (Optional):**
```typescript
{
  message?: string | React.ReactNode;  // Custom success message
  navigateTo?: string;                 // Custom navigation URL
  action?: () => void;                 // Custom action to execute
}
```

**Examples:**
```typescript
// Simple success message
onSuccess: async (result) => {
  return {
    message: 'Series created successfully! You can now add seasons and episodes.',
    navigateTo: `/entities/series/${result.data.addSerie.id}/edit`
  };
}

// Complex success flow
onSuccess: async (result) => {
  const seriesId = result.data.addSerie.id;
  
  // Log analytics
  analytics.track('series_created', { id: seriesId });
  
  // Custom navigation with delay
  return {
    message: 'Series created! Redirecting to edit page...',
    action: () => {
      setTimeout(() => {
        window.location.href = `/entities/series/${seriesId}/edit`;
      }, 1000);
    }
  };
}
```

### onError Callback

Executed when form submission fails. Use this for custom error handling, user-friendly error messages, or error recovery actions.

**Parameters:**
- `error`: The error object from the failed mutation
- `formData`: Current form field values  
- `actions`: Object containing functions to modify form state

**Important:** If this callback is provided, it completely overrides the default error handling. Make sure to handle all error scenarios.

**Example:**
```typescript
onError: async (error, formData, actions) => {
  console.error('Form submission failed:', error);
  
  if (error.message.includes('duplicate')) {
    actions.setFormMessage({
      type: 'error',
      message: 'A series with this title already exists. Please choose a different title.'
    });
    actions.setFieldData('title', ''); // Clear the title field
  } else if (error.message.includes('permission')) {
    actions.setFormMessage({
      type: 'error',
      message: 'You do not have permission to create series. Please contact an administrator.'
    });
  } else if (error.message.includes('network')) {
    actions.setFormMessage({
      type: 'error', 
      message: 'Network error. Please check your connection and try again.'
    });
  } else {
    // Generic error handling
    actions.setFormMessage({
      type: 'error',
      message: `Failed to create series: ${error.message}`
    });
  }
}
```

### Form Message Types

Form messages can have different severity levels:

```typescript
actions.setFormMessage({
  type: 'error',    // Red background, error icon
  type: 'warning',  // Orange background, warning icon
  type: 'info',     // Blue background, info icon
  type: 'success',  // Green background, success icon
  message: 'Your message here'
});
```

### Collection Changes Structure

The `collectionChanges` parameter contains information about modifications to collection fields:

```typescript
{
  [fieldName]: {
    added: CollectionItem[],      // New items being added
    modified: CollectionItem[],   // Existing items with changes
    deleted: CollectionItem[]     // Items being removed
  }
}
```

**Example:**
```typescript
beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
  // Check episode changes
  if (collectionChanges.episodes) {
    const { added, modified, deleted } = collectionChanges.episodes;
    
    if (added.length > 0) {
      actions.setFormMessage({
        type: 'info',
        message: `Adding ${added.length} new episode(s)`
      });
    }
    
    if (deleted.length > 0) {
      actions.setFormMessage({
        type: 'warning',
        message: `Deleting ${deleted.length} episode(s). This action cannot be undone.`
      });
    }
  }
}
```

### Mode-Specific Customizations

You can register different customizations for create, edit, and view modes:

```typescript
// Create mode - focus on data entry assistance
registerFormCustomization("serie", "create", {
  fieldsCustomization: { /* ... */ },
  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    // Auto-generate slug, validate required fields
  },
  onSuccess: async (result) => {
    return {
      message: 'Series created! You can now add episodes.',
      navigateTo: `/entities/series/${result.data.addSerie.id}/edit`
    };
  }
});

// Edit mode - focus on change tracking and validation
registerFormCustomization("serie", "edit", {
  fieldsCustomization: { /* ... */ },
  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    // Track significant changes, validate business rules
  },
  onSuccess: async (result) => {
    return {
      message: 'Series updated successfully!',
      navigateTo: undefined // Stay on edit page
    };
  }
});
```

## Complete Examples

### Basic Field Customization

```typescript
registerFormCustomization("serie", "create", {
  fieldsCustomization: {
    name: {
      size: { xs: 12, sm: 6, md: 4 },
      order: 1,
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
        // Auto-capitalize first letter
        const capitalized = String(value).charAt(0).toUpperCase() + String(value).slice(1);
        
        // Show movie-specific fields if name contains 'movie'
        if (String(value).toLowerCase().includes('movie')) {
          setFieldVisible('director', true);
          setFieldVisible('year', true);
        } else {
          setFieldVisible('director', false);
          setFieldVisible('year', false);
        }
        
        // Validation
        if (!value || String(value).trim() === '') {
          return { value: capitalized, error: "Name is required" };
        }
        
        return { value: capitalized, error: undefined };
      }
    },
    
    director: {
      size: { xs: 12, sm: 6, md: 4 },
      order: 2,
      visible: false, // Initially hidden
      onChange: (fieldName, value) => {
        if (!value) {
          return { value, error: "Director is required for movies" };
        }
        return { value, error: undefined };
      }
    },
    
    year: {
      size: { xs: 12, sm: 6, md: 4 },
      order: 3,
      visible: false, // Initially hidden
      onChange: (fieldName, value) => {
        if (!value) return { value, error: undefined };
        const year = Number(value);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
          return { value, error: `Year must be between 1900 and ${new Date().getFullYear()}` };
        }
        return { value, error: undefined };
      }
    }
  },
  
  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    const name = formData.name?.value;
    const isMovie = String(name).toLowerCase().includes('movie');
    
    // Enforce business rules
    if (isMovie && !formData.director?.value) {
      actions.setFormMessage({
        type: 'error',
        message: 'Director is required for movies'
      });
      throw new Error('Validation failed');
    }
  },
  
  onSuccess: async (result) => {
    return {
      message: 'Series created successfully!',
      navigateTo: `/entities/series/${result.data.addSerie.id}/edit`
    };
  }
});
```

### Advanced Embedded Object Customization

```typescript
registerFormCustomization("serie", "edit", {
  fieldsCustomization: {
    // Section-level customization for embedded objects
    director: {
      size: { xs: 12, sm: 6, md: 6 }, // Section takes half the screen
      order: 3,                        // Appears after name and categories
      visible: true,
      enabled: true
    },
    
    // Field-level customization within the director section
    "director.name": {
      size: { xs: 12, sm: 6, md: 6 }, // Field takes half the section width
      onChange: (fieldName, value, formData, setFieldData) => {
        // Auto-capitalize director name
        if (value && typeof value === 'string') {
          const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
          if (!value || String(value).trim() === '') {
            return { value: capitalized, error: "Director name is required" };
          }
          return { value: capitalized, error: undefined };
        }
        return { value, error: undefined };
      }
    },
    
    "director.country": {
      size: { xs: 12, sm: 6, md: 6 }, // Field takes the other half of the section
      onChange: (fieldName, value) => {
        if (!value || String(value).trim() === '') {
          return { value, error: "Director country is required" };
        }
        return { value, error: undefined };
      }
    },
    
    // Another section that can appear in the same row
    production: {
      size: { xs: 12, sm: 6, md: 6 }, // Section takes the other half of the screen
      order: 4,                        // Appears after director section
      visible: true,
      enabled: true
    },
    
    "production.company": {
      size: { xs: 12, sm: 12, md: 12 }, // Field takes full width of its section
      onChange: (fieldName, value) => {
        if (!value || String(value).trim() === '') {
          return { value, error: "Production company is required" };
        }
        return { value, error: undefined };
      }
    },
    
    "production.year": {
      size: { xs: 12, sm: 6, md: 6 } // Field takes half the section width
    },
    
    "production.budget": {
      size: { xs: 12, sm: 6, md: 6 } // Field takes the other half of the section
    }
  },
  
  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    // Validate embedded object completeness
    const directorName = formData['director.name']?.value;
    const directorCountry = formData['director.country']?.value;
    
    if (directorName && !directorCountry) {
      actions.setFormMessage({
        type: 'warning',
        message: 'Director country is recommended when director name is provided'
      });
    }
    
    // Track significant changes
    const originalTitle = formData.title?.__originalValue;
    const currentTitle = formData.title?.value;
    
    if (originalTitle !== currentTitle) {
      actions.setFormMessage({
        type: 'info',
        message: 'Title changed. This may affect search rankings and bookmarks.'
      });
    }
  },
  
  onSuccess: async (result) => {
    return {
      message: 'Series updated successfully!',
      navigateTo: undefined // Stay on edit page
    };
  }
});
```

This creates a layout where:
- **Name and Categories** take full width
- **Director section** (left half) contains name and country fields side by side
- **Production section** (right half) contains company (full width), year and budget side by side

## Integration with EntityForm

The EntityForm component automatically detects and applies customizations:

1. **Automatic Detection**: Customizations are applied based on the entity type from the schema
2. **State Management**: Field visibility, enabled state, and order are managed automatically
3. **Error Display**: Custom error messages are handled through the onChange function's return value
4. **Event Handling**: Custom onChange events are executed before the default field change handler

## Best Practices

1. **Register Early**: Call `registerFormCustomization` early in your app initialization
2. **Use Meaningful Names**: Use descriptive field names that match your schema
3. **Handle Edge Cases**: Always validate input values in custom functions
4. **Performance**: Keep custom onChange functions lightweight
5. **Error Handling**: Return appropriate error messages for validation failures
6. **State Consistency**: Use the provided setter functions to maintain form state
7. **Mode-Specific Logic**: Use different customizations for create vs edit modes when needed
8. **Collection Management**: Collections work in both create and edit modes - users can add items to collections when creating new entities
9. **Error Recovery**: Always provide user-friendly error messages and recovery options in onError callbacks
10. **Success Flow**: Use onSuccess callbacks to provide clear feedback and appropriate navigation

## Troubleshooting

### Fields Not Appearing
- Check that the entity type name matches exactly (case-sensitive)
- Verify that `visible: true` is set or omitted (defaults to true)
- Ensure the field name exists in your schema

### Custom onChange Not Working
- Verify the function signature matches exactly
- Check that you're returning the correct object format
- Ensure the field name parameter matches the actual field name

### Layout Issues
- Verify size values are valid (1-12 for each breakpoint)
- Check that order values are unique and sequential
- Ensure responsive breakpoints are properly configured

## API Reference

### `registerFormCustomization(entityType, mode, config)`

Registers form customizations for a specific entity type and mode.

**Parameters:**
- `entityType`: String - The entity type name (e.g., "serie", "episode")
- `mode`: String - The form mode ("create", "edit", or "view")
- `config`: FormCustomizationConfig - Object containing field customizations and entity-level callbacks

### `FormCustomizationConfig`

Type definition for the configuration object:

```typescript
type FormCustomizationConfig = {
  fieldsCustomization?: Record<string, FieldCustomization | EmbeddedSectionCustomization | CollectionFieldCustomization>;
  beforeSubmit?: (formData: Record<string, unknown>, collectionChanges: Record<string, CollectionFieldState>, transformedData: Record<string, unknown>, actions: EntityFormCallbackActions) => void | Promise<void>;
  onSuccess?: (result: unknown) => EntityFormSuccessResult | void | Promise<EntityFormSuccessResult | void>;
  onError?: (error: unknown, formData: Record<string, unknown>, actions: EntityFormCallbackActions) => void | Promise<void>;
};
```

### `FieldCustomization`

Type definition for individual field customization:

```typescript
type FieldCustomization = {
  size?: FieldSize;
  enabled?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  visible?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  order?: number;
  onChange?: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }, formData: Record<string, unknown>, setFieldData: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void, setFieldVisible: (fieldName: string, visible: boolean) => void, setFieldEnabled: (fieldName: string, enabled: boolean) => void) => { value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }; error?: string };
};
```

### `EntityFormCallbackActions`

Type definition for actions available in entity-level callbacks:

```typescript
type EntityFormCallbackActions = {
  setFieldData: (fieldName: string, value: unknown) => void;
  setFieldVisible: (fieldName: string, visible: boolean) => void;
  setFieldEnabled: (fieldName: string, enabled: boolean) => void;
  setCollectionChanges: (fieldName: string, changes: CollectionFieldState) => void;
  setFormMessage: (message: FormMessage) => void;
  setError: (errorMessage: string) => void;
};
```

### `FormMessage`

Type definition for form-level messages:

```typescript
type FormMessage = {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string | React.ReactNode;
};
```

### `EntityFormSuccessResult`

Type definition for onSuccess callback return value:

```typescript
type EntityFormSuccessResult = {
  message?: string | React.ReactNode;
  navigateTo?: string;
  action?: () => void;
};
```
