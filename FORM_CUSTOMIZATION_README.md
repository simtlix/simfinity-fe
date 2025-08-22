# Form Customization System

The Form Customization System allows you to control the layout, behavior, and validation of form fields in EntityForm components. This system provides a flexible way to customize forms without modifying the core component code.

## Features

- **Responsive Grid Layout**: Control field sizes across different breakpoints (xs, sm, md, lg, xl)
- **Field Ordering**: Define the sequence in which fields appear in the form
- **Field Visibility**: Show/hide fields dynamically based on conditions
- **Field State**: Enable/disable fields based on business logic
- **Custom Validation**: Add custom error messages for fields
- **Custom onChange Events**: Implement complex field interactions and dependencies

## Basic Usage

### 1. Import the Registration Function

```typescript
import { registerFormCustomization } from '@/lib/formCustomization';
```

### 2. Register Customizations for an Entity Type

```typescript
registerFormCustomization("serie", {
  name: {
    size: { xs: 12, sm: 6, md: 4 },
    order: 1,
    enabled: true,
    visible: true,
    errorMessage: (value) => {
      if (!value || String(value).trim() === '') {
        return "Name is required";
      }
      return undefined;
    }
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

### Custom Error Messages (`errorMessage`)

Provide custom validation logic:

```typescript
errorMessage: (value) => {
  if (!value || String(value).trim() === '') {
    return "This field is required";
  }
  if (String(value).length < 3) {
    return "Must be at least 3 characters";
  }
  return undefined; // No error
}
```

**Return Value**: 
- `string`: Error message to display
- `undefined`: No error

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

#### onChange Return Value

- `value`: The processed value (can be modified)
- `error`: Optional error message

## Complete Example

```typescript
registerFormCustomization("serie", {
  name: {
    size: { xs: 12, sm: 6, md: 4 },
    order: 1,
    errorMessage: (value) => {
      if (!value || String(value).trim() === '') {
        return "Name is required";
      }
      return undefined;
    },
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
      
      return { value: capitalized, error: undefined };
    }
  },
  
  director: {
    size: { xs: 12, sm: 6, md: 4 },
    order: 2,
    visible: false, // Initially hidden
    errorMessage: (value) => {
      if (!value) return "Director is required for movies";
      return undefined;
    }
  },
  
  year: {
    size: { xs: 12, sm: 6, md: 4 },
    order: 3,
    visible: false, // Initially hidden
    errorMessage: (value) => {
      if (!value) return undefined;
      const year = Number(value);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        return `Year must be between 1900 and ${new Date().getFullYear()}`;
      }
      return undefined;
    }
  },
  
  description: {
    size: { xs: 12, sm: 12, md: 8 }, // Larger field
    order: 4,
    enabled: false, // Initially disabled
    onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
      // Enable description field when name is long enough
      if (String(formData.name?.value).length > 10) {
        setFieldEnabled('description', true);
      } else {
        setFieldEnabled('description', false);
      }
      
      return { value, error: undefined };
    }
  }
});
```

## Integration with EntityForm

The EntityForm component automatically detects and applies customizations:

1. **Automatic Detection**: Customizations are applied based on the entity type from the schema
2. **State Management**: Field visibility, enabled state, and order are managed automatically
3. **Error Display**: Custom error messages appear below fields using FormHelperText
4. **Event Handling**: Custom onChange events are executed before the default field change handler

## Best Practices

1. **Register Early**: Call `registerFormCustomization` early in your app initialization
2. **Use Meaningful Names**: Use descriptive field names that match your schema
3. **Handle Edge Cases**: Always validate input values in custom functions
4. **Performance**: Keep custom onChange functions lightweight
5. **Error Handling**: Return appropriate error messages for validation failures
6. **State Consistency**: Use the provided setter functions to maintain form state

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

### `registerFormCustomization(entityType, customization)`

Registers form customizations for a specific entity type.

**Parameters:**
- `entityType`: String - The entity type name (e.g., "serie", "episode")
- `customization`: FormCustomization - Object containing field customizations

### `FormCustomization`

Type definition for the customization object:

```typescript
type FormCustomization = Record<string, FieldCustomization>;
```

### `FieldCustomization`

Type definition for individual field customization:

```typescript
type FieldCustomization = {
  size?: FieldSize;
  enabled?: boolean;
  visible?: boolean;
  order?: number;
  errorMessage?: (value: unknown) => string | undefined;
  onChange?: (fieldName: string, value: string | number | boolean | string[] | null, formData: Record<string, unknown>, setFieldData: (fieldName: string, value: string | number | boolean | string[] | null) => void, setFieldVisible: (fieldName: string, visible: boolean) => void, setFieldEnabled: (fieldName: string, enabled: boolean) => void) => { value: string | number | boolean | string[] | null; error?: string };
};
```
