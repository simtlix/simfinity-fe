# Entity-Level Callbacks in Form Customization

This document explains the new entity-level callback functions available in the Simfinity form customization system. These callbacks provide powerful hooks for executing custom logic at key points in the form lifecycle.

## Overview

Entity-level callbacks are functions that execute at the entity level (not field level) and provide access to the entire form state, collection changes, and form manipulation actions. They are defined per entity type and action (create/edit/view).

## Available Callbacks

### 1. `beforeSubmit` - Pre-submission Validation & Processing

**Purpose**: Execute logic before the form is submitted to the server.

**When it runs**: 
- Before form validation
- Before GraphQL mutation execution
- After user clicks submit but before data is sent

**Use cases**:
- Business rule validation
- Data transformation and auto-generation
- Collection change validation
- Pre-submission warnings
- Field state modifications

**Parameters**:
- `formData`: Current form field values
- `collectionChanges`: Changes to collection fields (added/modified/deleted items)
- `transformedData`: Form data after transformation for GraphQL
- `actions`: Functions to manipulate form state

**Example**:
```typescript
beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
  // Validate business rules
  const genre = (formData.genre as any)?.value;
  const targetAudience = (formData.targetAudience as any)?.value;
  
  if (genre === 'horror' && targetAudience === 'children') {
    actions.setFormMessage({
      type: 'error',
      message: 'Horror content is not suitable for children.'
    });
    
    // Prevent submission by clearing required field
    actions.setFieldData('genre', '');
    return;
  }
  
  // Auto-generate slug from title
  const title = (formData.title as any)?.value;
  if (title && !(formData.slug as any)?.value) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    actions.setFieldData('slug', slug);
  }
}
```

### 2. `afterSuccess` - Post-success Processing

**Purpose**: Handle successful form submission and provide custom success behavior.

**When it runs**: After successful GraphQL mutation execution

**Use cases**:
- Custom success messages
- Navigation to different pages
- Triggering additional actions
- Data refresh or state updates

**Parameters**:
- `result`: The result from the GraphQL mutation
- `actions`: Functions to manipulate form state

**Return value**: Can return an `EntityFormSuccessResult` object with:
- `message`: Custom success message
- `navigateTo`: URL to navigate to
- `action`: Function to execute

**Example**:
```typescript
afterSuccess: async (result, actions) => {
  console.log('Entity created successfully:', result);
  
  return {
    message: 'Entity created successfully! You can now add related items.',
    navigateTo: `/entities/${(result as any)?.id}/edit`,
    action: () => {
      console.log('Navigating to edit page');
    }
  };
}
```

### 3. `onError` - Custom Error Handling

**Purpose**: Override default error handling with custom logic.

**When it runs**: When an error occurs during form submission

**Use cases**:
- Custom error messages
- Field-specific error handling
- Business logic error recovery
- User guidance for error resolution

**Parameters**:
- `error`: The error that occurred
- `formData`: Current form field values
- `actions`: Functions to manipulate form state

**Example**:
```typescript
onError: async (error, formData, actions) => {
  console.error('Error occurred:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('duplicate')) {
      actions.setFormMessage({
        type: 'error',
        message: 'A record with this name already exists.'
      });
      
      // Highlight the problematic field
      actions.setFieldData('name', '');
    } else if (error.message.includes('permission')) {
      actions.setFormMessage({
        type: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
  }
}
```

## Available Actions

All callback functions receive an `actions` object with the following functions:

### `setFieldData(fieldName: string, value: unknown)`
Set the value of a form field.

### `setFieldVisible(fieldName: string, visible: boolean)`
Show or hide a form field.

### `setFieldEnabled(fieldName: string, enabled: boolean)`
Enable or disable a form field.

### `setCollectionChanges(fieldName: string, changes: CollectionFieldState)`
Update the state of a collection field.

### `setFormMessage(message: FormMessage)`
Display a form-level message (error, warning, info, success).

### `setError(errorMessage: string)`
Display an error message (shortcut for setFormMessage with error type).

## Message Types

The `setFormMessage` function accepts messages with these types:

- `'error'`: Error messages (red styling)
- `'warning'`: Warning messages (orange styling)
- `'info'`: Information messages (blue styling)
- `'success'`: Success messages (green styling)

## Collection Changes Structure

Collection changes provide access to modifications in collection fields:

```typescript
type CollectionFieldState = {
  added: Array<CollectionItem>;      // New items
  modified: Array<CollectionItem>;   // Modified existing items
  deleted: Array<CollectionItem>;    // Items marked for deletion
};

type CollectionItem = {
  id?: string;
  [key: string]: unknown;
  __status?: 'added' | 'modified' | 'deleted';
  __originalData?: Record<string, unknown>;
};
```

## Registration

Entity-level callbacks are registered using the existing `registerFormCustomization` function:

```typescript
import { registerFormCustomization } from '@/lib/formCustomization';

registerFormCustomization("entityType", "action", {
  // Entity-level callbacks
  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    // Your logic here
  },
  
  afterSuccess: async (result, actions) => {
    // Your success handling here
  },
  
  onError: async (error, formData, actions) => {
    // Your error handling here
  },
  
  // Field-level customizations (existing functionality)
  fieldName: {
    size: { xs: 12, sm: 6 },
    order: 1
  }
});
```

## Best Practices

### 1. Async Operations
- Use `async/await` for callbacks that need to perform asynchronous operations
- Handle promises properly in error scenarios

### 2. Error Handling
- Always provide fallback error messages
- Use specific error types for better user experience
- Log errors for debugging purposes

### 3. State Modifications
- Use actions to modify form state rather than direct manipulation
- Consider the impact of state changes on user experience
- Validate data before making changes

### 4. Performance
- Keep callback logic lightweight
- Avoid expensive operations in `beforeSubmit`
- Use debouncing for real-time validation if needed

### 5. User Experience
- Provide clear, actionable error messages
- Use appropriate message types (error, warning, info, success)
- Guide users to resolve issues

## Examples

See `src/examples/entityLevelCallbacksExample.ts` for comprehensive examples of:

- Episode creation with validation
- Series creation with business rules
- Season editing with change tracking
- Collection change validation
- Custom error handling
- Success navigation

## Integration with Existing System

Entity-level callbacks integrate seamlessly with the existing form customization system:

- **Field-level customizations**: Continue to work as before
- **Collection management**: Access to collection changes and state
- **Form validation**: Execute before or after standard validation
- **Error handling**: Can override or complement default error handling
- **Success handling**: Can replace default success behavior

## Migration from Field-Level Only

If you're upgrading from field-level customizations only:

1. **Keep existing field customizations**: They continue to work unchanged
2. **Add entity-level callbacks**: For cross-field logic and business rules
3. **Gradually migrate complex logic**: Move complex field interactions to `beforeSubmit`
4. **Test thoroughly**: Ensure callbacks don't interfere with existing functionality

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Use proper type assertions for formData access
2. **Callback not executing**: Ensure callback is properly registered
3. **State not updating**: Use actions object, not direct state manipulation
4. **Performance issues**: Keep callbacks lightweight and efficient

### Debugging

- Use console.log in callbacks to trace execution
- Check browser console for errors
- Verify callback registration with proper entity type and action
- Test with simple examples before adding complex logic

## Future Enhancements

Potential future additions to the callback system:

- **Pre-validation callbacks**: Execute before field validation
- **Post-load callbacks**: Execute after form data is loaded
- **Field change callbacks**: Execute on specific field changes
- **Conditional callbacks**: Execute based on form state conditions
- **Batch operations**: Handle multiple entity operations
