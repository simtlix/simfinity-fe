# EntityForm System Architecture & Design Context

## Overview
The EntityForm system is a dynamic, schema-driven form management system built for Next.js applications that automatically generates forms based on GraphQL schema introspection. It supports complex entity management including embedded objects, collections, and extensive customization capabilities.

## Core Architecture

### 1. Schema-Driven Form Generation
The system uses GraphQL schema introspection to automatically discover and render form fields:
- **Dynamic Field Detection**: Automatically identifies field types (scalar, object, list, enum, embedded)
- **Type Inference**: Determines field properties like `isNumeric`, `isBoolean`, `isDate`, `isObject`, `isCollection`
- **Relationship Mapping**: Automatically detects object relationships and connection fields

### 2. Component Hierarchy
```
EntityForm (Main Container)
├── FormFieldRenderer (Generic Field Renderer)
├── ObjectFieldSelector (Object Reference Selector)
├── CollectionFieldGrid (Collection Management)
│   └── CollectionItemEditForm (Individual Item Editor)
└── Embedded Object Sections (Accordion-based)
```

## Key Components

### EntityForm.tsx
**Purpose**: Main form container that orchestrates the entire form system

**Key Responsibilities**:
- Schema introspection and field discovery
- Dynamic GraphQL query generation
- Form state management
- Collection field integration
- Form customization coordination

**Core Features**:
- **Action Modes**: `create`, `edit`, `view` with different behaviors
- **Dynamic Queries**: Generates GraphQL queries based on discovered fields
- **Collection Integration**: Manages collection fields separately from main form
- **Embedded Objects**: Handles nested object structures with accordion sections

### FormFieldRenderer.tsx
**Purpose**: Generic component for rendering any form field type

**Supported Field Types**:
- **Scalar Fields**: Text, Number, Boolean, Date, Enum
- **Object Fields**: Foreign key relationships with search/select
- **List Fields**: Tag-based input for scalar lists
- **Embedded Fields**: Nested object structures

**Customization Integration**:
- Field visibility control
- Field enable/disable logic
- Field sizing and layout
- Custom onChange handlers

### ObjectFieldSelector.tsx
**Purpose**: Handles object reference selection (foreign keys)

**Features**:
- Search functionality for object lists
- Display field rendering (e.g., name, title)
- Object data preservation (stores full objects, not just IDs)
- Integration with form customization system

### CollectionFieldGrid.tsx
**Purpose**: Manages collections of related entities (e.g., seasons in a series)

**State Management**:
- **Added Items**: New items being created
- **Modified Items**: Existing items with changes
- **Deleted Items**: Items marked for removal
- **Original Data**: Preserves initial state for comparison

**Key Features**:
- **Add Button**: Opens CollectionItemEditForm for new items
- **Edit Functionality**: Modifies existing items
- **Delete/Restore**: Manages item lifecycle
- **Connection Field Hiding**: Automatically hides parent entity reference columns
- **Status Tracking**: Uses `__status` and `__originalData` for change management

### CollectionItemEditForm.tsx
**Purpose**: Dialog form for editing individual collection items

**Modes**:
- **Edit Mode**: Modifies existing items
- **Add Mode**: Creates new items (ensures connection field remains null)

**Features**:
- Schema-driven field generation
- Form customization inheritance from parent entity
- Object field support with full data preservation
- Validation and error handling

## Form Customization System

### Core Concepts
The customization system provides fine-grained control over form behavior:

```typescript
type FormCustomizationState = {
  customization: FormCustomization;        // Field-level customization
  fieldVisibility: Record<string, boolean>; // Field visibility rules
  fieldEnabled: Record<string, boolean>;    // Field enable/disable rules
  fieldOrder: string[];                    // Field ordering
};
```

### Customization Levels

#### 1. Field-Level Customization
```typescript
type FieldCustomization = {
  visible?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  enabled?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  size?: GridSize; // Material-UI grid sizing
  order?: number;  // Display order
  onChange?: (fieldName: string, value: unknown, formData: FormData, actions: FormCustomizationActions) => FieldChangeResult;
};
```

#### 2. Embedded Object Customization
```typescript
type EmbeddedSectionCustomization = {
  visible?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  enabled?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  size?: GridSize;
  order?: number;
};
```

#### 3. Collection Item Customization
```typescript
type CollectionItemCustomization = {
  visible?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  enabled?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  size?: GridSize;
  order?: number;
  onChange?: (fieldName: string, value: unknown, formData: FormData, actions: FormCustomizationActions) => FieldChangeResult;
};
```

### Customization Actions
```typescript
type FormCustomizationActions = {
  setFieldData: (fieldName: string, value: unknown) => void;
  setFieldVisible: (fieldName: string, visible: boolean) => void;
  setFieldEnabled: (fieldName: string, enabled: boolean) => void;
  setFieldOrder: (fieldOrder: string[]) => void;
};
```

## Data Flow & State Management

### 1. Form Data Structure
```typescript
type FormField = {
  name: string;
  type: string;
  required: boolean;
  value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown };
  error?: string;
  isNumeric: boolean;
  isBoolean: boolean;
  isDate: boolean;
  isList: boolean;
  isEnum: boolean;
  enumValues?: string[];
  isObject: boolean;
  objectTypeName?: string;
  descriptionField?: string;
  descriptionFieldType?: string;
  listQueryName?: string;
  singleQueryName?: string;
  isEmbedded?: boolean;
  embeddedFields?: FormField[];
  isCollection?: boolean;
  collectionObjectTypeName?: string;
  connectionField?: string;
};
```

### 2. Collection State Management
```typescript
type CollectionFieldState = {
  added: CollectionItem[];
  modified: CollectionItem[];
  deleted: CollectionItem[];
};

type CollectionItem = {
  id?: string;
  [key: string]: unknown;
  __status?: 'added' | 'modified' | 'deleted';
  __originalData?: Record<string, unknown>;
};
```

### 3. Data Flow Patterns
1. **Schema Introspection** → Field Discovery → Form Generation
2. **User Input** → Field Change → Customization Processing → State Update
3. **Collection Changes** → Local State → Parent Form Integration
4. **Form Submission** → Data Validation → GraphQL Mutation → Success/Error Handling

## Field Type Detection & Rendering

### Scalar Field Detection
```typescript
// Automatic type detection from GraphQL schema
const isNumeric = isNumericScalarName(typeName);      // Int, Float
const isBoolean = isBooleanScalarName(typeName);      // Boolean
const isDate = isDateTimeScalarName(typeName);        // Date, DateTime
const isEnum = current?.kind === "ENUM";              // Enum types
```

### Object Field Detection
```typescript
// Object fields with foreign key relationships
const isObject = current?.kind === "OBJECT" && !isList;
const descriptionField = field.extensions?.relation?.displayField || "name";
const connectionField = field.extensions?.relation?.connectionField;
```

### Collection Field Detection
```typescript
// List of objects that form collections
const isCollection = isList && current?.kind === "OBJECT";
const collectionObjectTypeName = typeName;
const connectionField = field.extensions?.relation?.connectionField;
```

### Embedded Object Detection
```typescript
// Nested objects within the main entity
const isEmbedded = field.extensions?.relation?.embedded === true;
const embeddedFields = processEmbeddedObjectFields(schema, objectTypeName, field.name);
```

## Internationalization (i18n)

### Label Resolution Strategy
```typescript
// Multi-level fallback system
const getFieldLabel = (fieldName: string): string => {
  const entityKey = listField.slice(0, -1); // Remove 's' from end
  const fieldKey = `${entityKey}.${fieldName}`;
  
  return resolveLabel([
    fieldKey,           // entity.field (e.g., "serie.name")
    fieldName,          // field name as fallback
  ], { entity: listField, field: fieldName }, fieldName);
};
```

### Label Patterns
- **Entity Labels**: `entity.{entityType}.{form}` (e.g., "serie.single", "serie.plural")
- **Field Labels**: `{entityType}.{fieldName}` (e.g., "serie.name", "serie.description")
- **Form Labels**: `form.{action}` (e.g., "form.create", "form.edit", "form.view")

## GraphQL Integration

### Dynamic Query Generation
```typescript
// Automatically generates queries based on discovered fields
const generateQueries = React.useMemo(() => {
  const fieldSelections = formFields
    .filter(field => !field.isCollection) // Exclude collection fields
    .map(field => {
      if (field.isObject && !field.isEmbedded) {
        return `${field.name} { id ${field.descriptionField} }`;
      }
      return field.name;
    });
  
  // Generate Get, Create, Update queries dynamically
}, [formFields, listField]);
```

### Collection Field Handling
- Collection fields are excluded from main entity queries
- Collection data is managed separately through dedicated components
- Changes are tracked locally and integrated during form submission

## Validation & Error Handling

### Validation System
```typescript
const validateForm = (): boolean => {
  let isValid = true;
  
  formFields.forEach(field => {
    // Required field validation
    if (field.required && (field.value === "" || field.value === null)) {
      setFieldError(field.name, "This field is required");
      isValid = false;
    }
    
    // Type-specific validation
    if (field.isNumeric && typeof field.value === "string" && isNaN(Number(field.value))) {
      setFieldError(field.name, "Must be a valid number");
      isValid = false;
    }
  });
  
  return isValid;
};
```

### Error Display
- Field-level error messages below each field
- Form-level error alerts for submission failures
- Success messages with auto-hide functionality

## Performance Optimizations

### 1. Memoization
```typescript
// Heavy computations are memoized
const formFields = React.useMemo(() => {
  // Field discovery and processing
}, [schemaData, listField]);

const generateQueries = React.useMemo(() => {
  // Query generation
}, [formFields, listField]);
```

### 2. Conditional Rendering
- Fields are only rendered when visible and enabled
- Embedded sections are collapsed by default
- Collection grids load data on-demand

### 3. State Updates
- Batched state updates for form data
- Local state management for collections
- Efficient re-rendering through proper dependency arrays

## Extension Points

### 1. Custom Field Types
- Add new field types by extending `FormField` interface
- Implement custom renderers in `FormFieldRenderer`
- Register new field processors in field discovery logic

### 2. Custom Validation Rules
- Extend validation system with field-specific rules
- Implement custom error messages
- Add async validation support

### 3. Custom Form Actions
- Extend form submission logic
- Add pre/post submission hooks
- Implement custom success/error handling

## Best Practices

### 1. Field Naming
- Use descriptive field names that match GraphQL schema
- Follow consistent naming conventions for relationships
- Use clear, human-readable labels

### 2. Customization
- Leverage the customization system for dynamic behavior
- Use function-based customization for complex logic
- Maintain consistent field ordering and sizing

### 3. Error Handling
- Provide clear, actionable error messages
- Validate data at multiple levels (field, form, submission)
- Handle GraphQL errors gracefully

### 4. Performance
- Memoize expensive computations
- Use proper React dependency arrays
- Implement conditional rendering for large forms

## Common Use Cases

### 1. Simple Entity Forms
- Basic CRUD operations with scalar fields
- Automatic field type detection and rendering
- Built-in validation and error handling

### 2. Complex Entity Forms
- Embedded objects with nested fields
- Object references with search/select
- Collection management with add/edit/delete

### 3. Dynamic Forms
- Field visibility based on other field values
- Conditional field enabling/disabling
- Dynamic field ordering and sizing

### 4. Multi-Step Forms
- Form sections with accordion layout
- Step-by-step validation
- Progress tracking and navigation

This system provides a robust, flexible foundation for building complex entity management interfaces while maintaining clean separation of concerns and extensive customization capabilities.
