# Entity Form Component

This component provides a dynamic form for creating, editing, and viewing entities based on the GraphQL schema introspection.

## Features

- **Dynamic Form Fields**: Automatically generates form fields based on the entity's scalar type fields from the GraphQL schema
- **CRUD Operations**: Supports Create, Read, Update operations
- **MUI Design**: Follows Material-UI design patterns with breadcrumbs and proper form styling
- **Type Safety**: Full TypeScript support with proper type checking
- **Internationalization**: Integrates with the existing i18n system
- **Validation**: Basic form validation for required fields and data types

## Usage

### URL Structure

The form component is accessible through the following URL patterns:

- **Create**: `/entities/[listField]/create`
- **Edit**: `/entities/[listField]/[id]/edit`
- **View**: `/entities/[listField]/[id]/view`

Where `[listField]` is the plural entity name (e.g., "series", "episodes") and `[id]` is the entity ID.

### Component Props

```typescript
type EntityFormProps = {
  listField: string;        // e.g., "series"
  entityId?: string;        // undefined for create, string for edit/view
  action: "create" | "edit" | "view"; // action from URL
};
```

### Example Usage

```tsx
// Create new entity
<EntityForm listField="series" action="create" />

// Edit existing entity
<EntityForm listField="series" entityId="123" action="edit" />

// View entity (read-only)
<EntityForm listField="series" entityId="123" action="view" />
```

## Field Types Supported

The form automatically detects and renders appropriate input types for:

- **String**: Text input
- **Number**: Number input with validation
- **Boolean**: Checkbox
- **Date/DateTime**: Date-time picker
- **Enum**: Select dropdown (future enhancement)

## GraphQL Integration

The component dynamically builds GraphQL queries and mutations based on the schema:

- Automatically generates field selections based on available scalar fields
- Creates appropriate mutation names (e.g., `createSeries`, `updateSeries`)
- Handles input types and response data dynamically

## Styling and Layout

- **Breadcrumbs**: Navigation breadcrumbs showing current location
- **Responsive Grid**: Form fields arranged in a responsive grid layout
- **Action Buttons**: Create/Update buttons with loading states
- **Error Handling**: Snackbar notifications for errors and success messages
- **Loading States**: Proper loading indicators during data fetching and mutations

## Integration with EntityTable

The EntityTable component has been updated to include:

- **Create Button**: Button to navigate to the create form
- **Action Column**: View and Edit buttons for each row
- **Navigation**: Seamless navigation between table and form views

## Future Enhancements

- Support for object/relation fields
- Enhanced validation rules from schema
- File upload support
- Bulk operations
- Advanced field types (rich text, markdown, etc.)

## Dependencies

- Material-UI (MUI) components
- Apollo Client for GraphQL operations
- Next.js routing
- TypeScript for type safety
