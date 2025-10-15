# Simfinity Frontend

A Next.js 15.4.6 frontend application for Simfinity, featuring a dynamic, schema-driven form management system built with GraphQL, urql, and Material-UI v7.3.1.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

This application automatically generates forms from GraphQL schema introspection and supports complex entity management including embedded objects, collections, and extensive customization capabilities.

The system provides two main components:
- **EntityTable**: Dynamic data tables with sorting, filtering, and pagination
- **EntityForm**: Schema-driven forms for creating, editing, and viewing entities

## Features

### 🚀 **Core Capabilities**
- **Dynamic Form Generation**: Automatically creates forms from GraphQL schema
- **Schema Introspection**: Real-time field discovery and type detection
- **Collection Management**: Handle complex nested collections with add/edit/delete
- **Embedded Objects**: Support for nested object structures
- **Internationalization**: Multi-language support (English/Spanish)
- **Form Customization**: Field-level visibility, validation, and layout control
- **State Machine Support**: Entity state transitions with business rule validation
- **GraphQL Integration**: Native urql support with dynamic queries

### 🎯 **Entity Management**
- **Create Mode**: Build new entities with collections from scratch
- **Edit Mode**: Modify existing entities with change tracking
- **View Mode**: Read-only display of entity data
- **Collection Support**: Manage related entities (e.g., episodes in a series)
- **Validation**: Built-in form validation with custom rules

### 🎨 **UI/UX Features**
- **Material-UI v7**: Modern, responsive design system
- **Responsive Layout**: Mobile-first approach with grid system
- **Custom Field Renderers**: Specialized input components for different data types
- **Accordion Sections**: Organized embedded object display
- **Real-time Updates**: urql cache management with graphcache

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Components

### 📊 **EntityTable**

The EntityTable component provides dynamic data tables with automatic column generation based on GraphQL schema introspection.

#### **Features**
- **Automatic Column Detection**: Columns generated from schema fields
- **Sorting**: Server-side sorting with GraphQL integration
- **Pagination**: Server-side pagination with configurable page sizes
- **Filtering**: Advanced filtering capabilities
- **Custom Column Renderers**: Specialized display for different data types
- **Responsive Design**: Mobile-friendly table layout

#### **Usage**
```tsx
import EntityTable from '@/components/EntityTable';

// Basic usage
<EntityTable 
  listField="series" 
  entityTypeName="Serie"
/>

// With customization
<EntityTable 
  listField="episodes"
  entityTypeName="Episode"
  customizationState={customState}
  onCustomizationChange={handleCustomization}
/>
```

#### **Props**
- `listField`: The plural field name (e.g., "series", "episodes")
- `entityTypeName`: The singular entity type name (e.g., "Serie", "Episode")
- `customizationState`: Form customization state for field behavior
- `onCustomizationChange`: Callback for customization updates

#### **Example Output**
```
┌─────────────────────────────────────────────────────────────┐
│ Serie Name    │ Director    │ Year │ Episodes │ Actions   │
├─────────────────────────────────────────────────────────────┤
│ Breaking Bad  │ Vince G.    │ 2008 │ 62       │ [Edit] [Delete] │
│ Game of Thrones│ David B.   │ 2011 │ 73       │ [Edit] [Delete] │
│ Stranger Things│ Duffer Bros│ 2016 │ 34       │ [Edit] [Delete] │
└─────────────────────────────────────────────────────────────┘
```

### 📝 **EntityForm**

The EntityForm component automatically generates forms from GraphQL schema introspection, supporting create, edit, and view modes with embedded objects and collections.

#### **Features**
- **Dynamic Form Generation**: Forms built automatically from schema
- **Three Modes**: Create, Edit, and View with appropriate behaviors
- **Embedded Objects**: Nested object support with accordion sections
- **Collection Management**: Add/edit/delete related entities
- **Field Validation**: Built-in validation with custom rules
- **Internationalization**: Multi-language field labels and messages
- **Responsive Layout**: Material-UI grid system with customization

#### **Usage**
```tsx
import EntityForm from '@/components/EntityForm';

// Create new entity
<EntityForm 
  listField="series" 
  action="create"
/>

// Edit existing entity
<EntityForm 
  listField="series" 
  entityId="123"
  action="edit"
/>

// View entity (read-only)
<EntityForm 
  listField="series" 
  entityId="123"
  action="view"
/>
```

#### **Props**
- `listField`: The plural field name (e.g., "series")
- `entityId`: Entity ID for edit/view modes (undefined for create)
- `action`: Form mode ("create" | "edit" | "view")

#### **Form Modes**

##### **Create Mode**
- **Purpose**: Build new entities from scratch
- **Collections**: Add items to empty collections
- **Validation**: Required field validation
- **Submission**: Creates new entity with collections

##### **Edit Mode**
- **Purpose**: Modify existing entities
- **Collections**: Add/modify/delete collection items
- **Change Tracking**: Tracks all modifications
- **Submission**: Updates existing entity with changes

##### **View Mode**
- **Purpose**: Read-only display of entity data
- **Collections**: Display collection items
- **No Editing**: All fields are disabled
- **Navigation**: Links to edit mode

#### **Field Types Supported**

##### **Scalar Fields**
- **Text**: String inputs with validation
- **Numbers**: Numeric inputs with type checking
- **Booleans**: Checkbox inputs
- **Dates**: Date picker inputs
- **Enums**: Dropdown selections
- **Lists**: Tag-based input for arrays

##### **Object Fields**
- **References**: Foreign key relationships
- **Search**: Object selector with search
- **Display**: Custom field rendering

##### **Embedded Objects**
- **Nested Fields**: Fields within objects
- **Accordion Sections**: Collapsible sections
- **Validation**: Individual field validation
- **Layout**: Customizable field sizing

##### **Collection Fields**
- **Grid Display**: Data grid for items
- **Add/Edit/Delete**: Full CRUD operations
- **Change Tracking**: Local state management
- **Bulk Operations**: Multiple item management

#### **Example Form Structure**
```
┌─────────────────────────────────────────────────────────────┐
│ Create Serie                                               │
├─────────────────────────────────────────────────────────────┤
│ Name:        [Breaking Bad                    ]            │
│ Description: [A chemistry teacher turns...    ]            │
│ Year:        [2008                            ]            │
│ Categories:  [Crime] [Drama] [Thriller] [+Add]            │
├─────────────────────────────────────────────────────────────┤
│ Director (Embedded Object)                    [▼]         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name:    [Vince Gilligan                ]              │ │
│ │ Country: [United States                 ]              │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Episodes (Collection)                        [▼]          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Add Episode]                                          │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Number: [1] Name: [Pilot] Date: [2008-01-20]      │ │
│ │ │ [Edit] [Remove]                                    │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Cancel]                                    [Create]      │
└─────────────────────────────────────────────────────────────┘
```

## Customization

### 🎨 **Form Customization System**

The system provides extensive customization capabilities for form behavior and appearance through the `@simtlix/simfinity-fe-components` package.

#### **Setup Configuration**
All customizations are registered in `src/examples/setupConfiguration.ts`:

```typescript
import { setupEpisodeFormCustomization } from "./episodeFormCustomization";
import { setupSerieFormCustomization } from "./serieFormCustomization";
import { setupI18n } from "./i18nSetup";
import { setupColumnRenderers } from "./columnRenderersSetup";
import { setupSeasonStateMachine } from "./seasonStateMachineExample";

export const setupConfigurations = () => {
  // Setup i18n labels
  setupI18n();
  
  // Setup custom column renderers
  setupColumnRenderers();
  
  // Setup form customizations
  setupEpisodeFormCustomization();
  setupSerieFormCustomization();
  
  // Setup state machines
  setupSeasonStateMachine();
};
```

#### **Form Customization Examples**

##### **Basic Field Customization**
```typescript
import { registerFormCustomization } from '@simtlix/simfinity-fe-components';

export function setupEpisodeFormCustomization() {
  registerFormCustomization("episode", "create", {
    fieldsCustomization: {
      name: {
        size: { xs: 12, sm: 6, md: 6 }, // Half width
        order: 1,
        onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
          // Custom logic: enable other fields when name has value
          if (value && String(value).trim() !== '') {
            setFieldEnabled('number', true);
            setFieldEnabled('season', true);
            setFieldData('number', 1);
          } else {
            setFieldEnabled('number', false);
            setFieldEnabled('season', false);
            setFieldData('number', "");
            setFieldData('season', "");
          }
          
          // Note: parentFormAccess is undefined for main entity fields
          // It's only available in collection item context
          return { value, error: undefined };
        }
      },
      number: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 2,
        // Dynamic enabled state based on form data
        enabled: (fieldName, value, formData) => {
          const nameValue = formData.name?.value;
          return !!(nameValue && String(nameValue).trim() !== '');
        }
      }
    }
  });
}
```

##### **Custom Renderer for Fields**
```typescript
export function setupSerieFormCustomization() {
  registerFormCustomization("serie", "create", {
    fieldsCustomization: {
      description: {
        size: { xs: 12 },
        order: 3,
        customRenderer: (field, customizationActions, handleFieldChange, disabled) => {
          return (
            <RichTextEditor
              value={field.value as string || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              disabled={disabled}
              error={field.error}
            />
          );
        }
      }
    }
  });
}
```

##### **Custom Embedded Renderer**
```typescript
export function setupSerieFormCustomization() {
  registerFormCustomization("serie", "create", {
    fieldsCustomization: {
      // Embedded section customization
      director: {
        size: { xs: 12, sm: 6, md: 6 }, // Section size
        order: 4,
        customEmbeddedRenderer: (
          field,
          customizationActions,
          handleEmbeddedFieldChange,
          disabled,
          formData
        ) => {
          const nameField = field.embeddedFields?.find(f => f.name.endsWith('.name'));
          const countryField = field.embeddedFields?.find(f => f.name.endsWith('.country'));
  
  return (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>🎬 Director Information</Typography>
              <TextField
                label="Director Name"
                value={(formData[nameField?.name || ''] as { value?: string })?.value || ''}
                onChange={(e) => handleEmbeddedFieldChange(field.name, 'name', e.target.value)}
                disabled={disabled}
                fullWidth
              />
              <CountrySelector
                value={(formData[countryField?.name || ''] as { value?: string })?.value || ''}
                onChange={(value) => handleEmbeddedFieldChange(field.name, 'country', value)}
                disabled={disabled}
              />
            </Paper>
          );
        }
      }
    }
  });
}
```

##### **Custom Collection Renderer**
```typescript
export function setupCastCustomization() {
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      cast: {
        size: { xs: 12 },
        order: 5,
        customCollectionRenderer: (
          collectionFieldName,
          parentFormAccess,
          collectionState,
          onCollectionStateChange,
          parentEntityId,
          isEditMode
        ) => {
          const allItems = [
            ...(collectionState.added || []),
            ...(collectionState.modified || []),
            ...(collectionState.original || [])
          ].filter(item => item.__status !== 'deleted');
          
          const handleAddActor = () => {
            const newActor = {
              id: `temp-${Date.now()}`,
              name: 'New Actor',
              role: 'Character',
              __status: 'added'
            };
            
            onCollectionStateChange({
              ...collectionState,
              added: [...(collectionState.added || []), newActor]
            });
          };
  
  return (
            <Box>
              <Typography variant="h6">Cast</Typography>
              <List>
                {allItems.map((actor) => (
                  <ListItem key={actor.id}>
                    <ListItemText primary={actor.name} secondary={actor.role} />
                    <IconButton onClick={() => handleRemoveActor(actor)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <Button onClick={handleAddActor}>Add Cast Member</Button>
    </Box>
  );
        }
      }
    }
  });
}
```

##### **Entity-Level Callbacks (beforeSubmit, onSuccess, onError)**
```typescript
export function setupEpisodeCallbacks() {
  registerFormCustomization("episode", "create", {
    fieldsCustomization: {},
    beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
      // Validate episode number
      const episodeNumber = formData.number?.value;
      if (episodeNumber === 1) {
        actions.setFormMessage({
          type: 'warning',
          message: 'Episode 1 is typically the pilot. Please verify this is correct.'
        });
      }
      
      // Auto-generate description if empty
      if (!formData.description?.value) {
        const name = formData.name?.value;
        if (name) {
          actions.setFieldData('description', `Episode ${episodeNumber}: ${name}`);
        }
      }
      
      // Validate collection changes
      if (collectionChanges.guestStars) {
        const { added, modified } = collectionChanges.guestStars;
        if (added.length + modified.length > 5) {
          actions.setFormMessage({
            type: 'warning',
            message: 'You have many guest stars. Consider if this is a special episode.'
          });
        }
      }
      
      // Return true to continue, false to cancel submission
      return true;
    },
    onSuccess: async (result) => {
      console.log('Episode created successfully:', result);
      return {
        message: 'Episode created successfully! Would you like to add another?',
        navigateTo: undefined, // Stay on current page
        action: () => console.log('Custom success action')
      };
    },
    onError: async (error, formData, actions) => {
      console.error('Error creating episode:', error);
      
      if (error.message.includes('duplicate')) {
        actions.setFormMessage({
          type: 'error',
          message: 'An episode with this number already exists in this season.'
        });
        actions.setFieldData('number', '');
      } else {
        actions.setFormMessage({
          type: 'error',
          message: `Failed to create episode: ${error.message}`
        });
      }
    }
  });
}
```

##### **Collection Field Customization**
```typescript
export function setupSeasonCollectionCustomization() {
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      seasons: {
        size: { xs: 12 },
        order: 2,
        
        // Delete callback - executed when delete button is pressed
        onDelete: async (item, setMessage) => {
          if (item.episodeCount > 0) {
            setMessage({
              type: 'error',
              message: `Cannot delete season "${item.name}" - it has episodes`
            });
            return false; // Cancel deletion
          }
          return true; // Allow deletion
        },
        
        // Edit mode customization for collection items
        onEdit: {
          fieldsCustomization: {
            name: {
              size: { xs: 12, sm: 6 },
              order: 1,
              onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
                // Can access parent form data
                if (parentFormAccess) {
                  const seriesTitle = parentFormAccess.parentFormData.title?.value;
                  console.log('Editing season for series:', seriesTitle);
                }
                return { value, error: undefined };
              }
            }
          },
          onSubmit: async (item, setFieldData, formData, setFieldVisible, setFieldEnabled, setMessage, parentFormAccess) => {
            // Validate before saving
            if (!item.name?.trim()) {
              setMessage({
            type: 'error',
                message: 'Season name is required'
              });
              return false;
            }
            
            // Auto-generate slug
            if (!item.slug) {
              const slug = String(item.name).toLowerCase().replace(/\s+/g, '-');
              setFieldData('slug', slug);
            }
            
            return true;
          }
        },
        
        // Create mode customization for collection items
        onCreate: {
          fieldsCustomization: {
            number: {
              size: { xs: 12, sm: 6 },
              order: 1
            }
          },
          onSubmit: async (item, setFieldData, formData, setFieldVisible, setFieldEnabled, setMessage, parentFormAccess) => {
            // Auto-increment season number
            if (!item.number) {
              const nextNumber = getNextSeasonNumber();
              setFieldData('number', nextNumber);
            }
            return true;
          }
        }
      }
    }
  });
}
```

### 🔄 **State Machine System**

State machines allow you to manage entity state transitions with custom validation and business logic.

#### **State Machine Registration**
```typescript
import { registerEntityStateMachine } from '@simtlix/simfinity-fe-components';

export function setupSeasonStateMachine() {
  registerEntityStateMachine("season", {
    actions: {
      activate: {
        mutation: 'activate_season',
        from: 'SCHEDULED',
        to: 'ACTIVE',
        onBeforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
          console.log('Before activating season:', { formData, collectionChanges, transformedData });
          
          // Validate business rules before transition
          const episodesChanges = collectionChanges.episodes || { added: [], modified: [], deleted: [] };
          const newEpisodesCount = episodesChanges.added.length;
          
          if (newEpisodesCount === 0) {
            actions.setFormMessage({
              type: 'error',
              message: 'Cannot activate season without episodes'
            });
            return { shouldProceed: false, error: 'Season must have at least one episode' };
          }
          
          return { shouldProceed: true };
        },
        onSuccess: async (result, formData, collectionChanges, transformedData, actions) => {
          console.log('Season activated successfully:', result);
          
          actions.setFormMessage({
            type: 'success',
            message: 'Season activated successfully!'
          });
        },
        onError: async (error, formData, collectionChanges, transformedData, actions) => {
          console.error('Failed to activate season:', error);
          
          actions.setFormMessage({
            type: 'error',
            message: `Failed to activate season: ${error.message}`
          });
        }
      },
      finalize: {
        mutation: 'finalize_season',
        from: 'ACTIVE',
        to: 'FINISHED',
        onBeforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
          // Query server for validation
          const GET_EPISODES = gql`
            query GetEpisodes($seasonId: QLValue!) {
              episodes(season: { terms: { path: "id", operator: EQ, value: $seasonId } }) {
                id
                date
              }
            }
          `;
          
          const result = await urqlClient.query(GET_EPISODES, {
            seasonId: transformedData.id
          }).toPromise();
          const { data } = result;
          });
          
          const existingEpisodes = data?.episodes || [];
          const incompleteEpisodes = existingEpisodes.filter(ep => 
            !ep.date || new Date(ep.date) > new Date()
          );
          
          if (incompleteEpisodes.length > 0) {
            actions.setFormMessage({
              type: 'error',
              message: 'Cannot finalize season with incomplete episodes'
            });
            return { shouldProceed: false, error: 'All episodes must be completed' };
          }
          
          return { shouldProceed: true };
        },
        onSuccess: async (result, formData, collectionChanges, transformedData, actions) => {
          actions.setFormMessage({
            type: 'success',
            message: 'Season finalized successfully!'
          });
        },
        onError: async (error, formData, collectionChanges, transformedData, actions) => {
          actions.setFormMessage({
            type: 'error',
            message: `Failed to finalize season: ${error.message}`
          });
        }
      }
    }
  });
}
```

#### **State Machine Callbacks**

**onBeforeSubmit Parameters:**
- `formData` - Current form field values
- `collectionChanges` - Changes to collection fields (added, modified, deleted)
- `transformedData` - Processed entity data ready for mutation
- `actions` - Actions to manipulate form state

**onBeforeSubmit Return Value:**
- `{ shouldProceed: true }` - Allow state transition
- `{ shouldProceed: false, error: string }` - Cancel state transition

**onSuccess/onError Parameters:**
- `result` - GraphQL mutation result
- `formData` - Current form field values
- `collectionChanges` - Collection changes
- `transformedData` - Processed entity data
- `actions` - Actions to manipulate form state

#### **State Machine Integration**

The EntityForm automatically detects registered state machines and:
1. **Shows Actions Button** - Displays "Actions" button in edit mode
2. **Dynamic Menu** - Shows available actions based on current entity state
3. **Field Management** - Excludes state machine fields from create forms
4. **Read-only Display** - Shows state machine fields as read-only
5. **Form Refresh** - Reloads entity data after successful transitions

#### **State Machine i18n Labels**
```json
{
  "stateMachine.season.action.activate": "Activate",
  "stateMachine.season.action.finalize": "Finalize",
  "stateMachine.season.state.SCHEDULED": "Scheduled",
  "stateMachine.season.state.ACTIVE": "Active",
  "stateMachine.season.state.FINISHED": "Finished",
  "stateMachine.actions": "Actions"
}
```

### 📊 **Column Customization System**

Custom column renderers for specialized data display in EntityTable:

```typescript
import { registerColumnRenderer } from "@simtlix/simfinity-fe-components";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export const setupColumnRenderers = () => {
  // Custom date renderer with icon
  registerColumnRenderer("episode.date", ({ value }) => {
    if (value == null) return "";
    const d = new Date(value as string | number);
    const text = isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <CalendarMonthIcon fontSize="small" />
        {text}
      </span>
    );
  });

  // Custom renderer with context
  registerColumnRenderer("season.year", ({ value, rowData }) => {
    if (value == null) return "";
    return (
      <span style={{ fontWeight: "bold", color: "#1976d2" }}>
        Year {value}
      </span>
    );
  });
};
```

### 🌍 **Internationalization (i18n) System**

The project supports two types of internationalization:

#### **1. Static JSON Files (public/i18n/)**
**Location**: `public/i18n/en.json`, `public/i18n/es.json`
**Usage**: Static labels for entities, fields, and common UI elements

```json
{
  "entity.serie.single": "Serie",
  "entity.serie.plural": "Series",
  "serie.name": "Name",
  "serie.description": "Description",
  "form.create": "Create",
  "form.edit": "Edit",
  "form.view": "View",
  "grid.filter.contains": "contains",
  "grid.filter.equals": "equals"
}
```

#### **2. Function-based Labels (src/i18n/)**
**Location**: `src/i18n/en.ts`, `src/i18n/es.ts`
**Usage**: Dynamic labels with context and custom column renderers

```typescript
import { registerFunctionLabels, registerColumnRenderer } from "@simtlix/simfinity-fe-components";

export const labels: Record<string, LabelValue> = {
  // Dynamic labels with context
  "season.year": (ctx) => `Year (${ctx.entity})`,
  "serie.name": "Title", // Override JSON labels
};

// Register function-based labels
registerFunctionLabels("en", labels);

// Register custom column renderers
registerColumnRenderer("episode.date", ({ value }) => {
  if (value == null) return "";
  const d = new Date(value as string | number);
  const text = isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  return React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    React.createElement(CalendarMonthIcon, { fontSize: "small" }),
    text
  );
});
```

#### **Label Resolution Strategy**
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

#### **Label Patterns**
- **Entity Labels**: `entity.{entityType}.{form}` (e.g., "serie.single", "serie.plural")
- **Field Labels**: `{entityType}.{fieldName}` (e.g., "serie.name", "serie.description")
- **Form Labels**: `form.{action}` (e.g., "form.create", "form.edit", "form.view")
- **Grid Labels**: `grid.filter.{type}` (e.g., "grid.filter.contains", "grid.filter.equals")
- **State Machine Labels**: `stateMachine.{entity}.{type}.{value}` (e.g., "stateMachine.season.state.ACTIVE")




## Simfinity.js Compatibility

This frontend application is designed to work seamlessly with **Simfinity.js**, a Node.js framework that automatically generates GraphQL schemas, mutations, and queries. The components automatically introspect the GraphQL schema to understand entity structures and generate appropriate forms and tables.

### 🔗 **Simfinity.js Integration**

- **Automatic Schema Introspection**: Components read GraphQL schema metadata to understand entity structures
- **Generated Mutations**: All mutations follow Simfinity.js naming conventions (`addserie`, `updateserie`, `deleteserie`)
- **Generated Queries**: Queries and filters are compatible with Simfinity.js generated endpoints
- **Metadata-Driven**: Forms and tables are automatically generated based on schema extensions

### 📊 **Schema Metadata Fields**

Simfinity.js uses GraphQL schema extensions to define relationships and behavior:

#### **1. `displayField` - Object Reference Display**
```typescript
// In Simfinity.js type definition
director: {
  type: new GraphQLNonNull(directorType),
  extensions: {
    relation: {
      displayField: 'name'  // Shows director name instead of ID
    }
  }
}
```

**Usage in EntityForm/EntityTable:**
- **ObjectFieldSelector**: Uses `displayField` to show human-readable values
- **Table Display**: Shows the `displayField` value instead of raw object data
- **Search**: Users can search by the display field value

#### **2. `connectionField` - Collection Relationships**
```typescript
// In Simfinity.js type definition
seasons: {
  type: new GraphQLList(seasonType),
  extensions: {
    relation: {
      connectionField: 'serie'  // Links seasons to parent serie
    }
  }
}
```

**Usage in CollectionFieldGrid:**
- **Parent Reference**: Automatically sets the connection field value
- **Filtering**: Only shows items related to the parent entity
- **Data Integrity**: Ensures proper parent-child relationships

#### **3. `embedded: true` - Embedded Objects**
```typescript
// In Simfinity.js type definition
director: {
  type: directorType,
  extensions: {
    relation: {
      embedded: true  // Treats as embedded object, not reference
    }
  }
}
```

**Usage in EntityForm:**
- **Inline Editing**: Director fields appear directly in the serie form
- **No Separate Entity**: Director data is stored within the serie record
- **Simplified UI**: No need for object selection or separate forms

### 📺 **TV Series Management Example**

Based on the [Simfinity.js series-sample project](https://github.com/simtlix/series-sample), here's how the schema metadata works:

#### **Simfinity.js Type Definition**
```typescript
// types/serie.js (from series-sample)
const serieType = new GraphQLObjectType({
  name: 'serie',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    categories: { type: new GraphQLList(GraphQLString) },
    description: { type: GraphQLString },
    director: {
      type: directorType,
      extensions: {
        relation: {
          embedded: true,
          displayField: 'name'
        }
      }
    },
    seasons: {
      type: new GraphQLList(seasonType),
      extensions: {
        relation: {
          connectionField: 'serie'
        }
      }
    }
  })
});
```

#### **Generated GraphQL Schema**
```graphql
type Serie {
  id: ID!
  name: String!
  categories: [String]
  description: String
  director: Director  # Embedded object
  seasons: [Season]   # Collection with connectionField
}

type Director {
  name: String!
  country: String!
}

type Season {
  id: ID!
  number: Int!
  year: Int!
  serie: Serie!  # Back-reference to parent
}
```

#### **Generated Mutations**
```graphql
# Create serie with embedded director and collection seasons
mutation AddSerie($input: serieInput!) {
  addserie(input: $input) {
    id
    name
    description
    director { name country }
    seasons { number year }
  }
}
```

#### **Generated Queries**
```graphql
# List series with embedded and collection data
query Series {
  series {
    id
    name
    description
    director { name country }
    seasons { number year }
  }
}
```

### 🔄 **How Metadata Drives Component Behavior**

#### **EntityForm Behavior**
1. **Schema Introspection**: Reads GraphQL schema to discover fields and metadata
2. **Field Detection**: Identifies embedded objects, collections, and references
3. **Form Generation**: Automatically generates appropriate form controls
4. **Validation**: Applies validation rules based on field types and metadata
5. **Mutation Generation**: Creates proper Simfinity.js compatible mutations

#### **EntityTable Behavior**
1. **Column Generation**: Creates columns based on schema fields and metadata
2. **Object Display**: Uses `displayField` to show human-readable values
3. **Collection Handling**: Manages collection fields with proper filtering
4. **Filtering**: Generates Simfinity.js compatible filter queries
5. **Sorting**: Supports sorting by object display fields

#### **CollectionFieldGrid Behavior**
1. **Connection Field**: Automatically sets parent entity reference
2. **Local State Management**: Tracks added, modified, and deleted items
3. **Schema-Driven**: Uses metadata to understand collection structure
4. **Mutation Integration**: Generates proper collection mutations for Simfinity.js

### 📝 **Usage Example**

```typescript
// In your GraphQL server (Simfinity.js)
const serieType = new GraphQLObjectType({
  name: 'serie',
  fields: () => ({
    director: {
      type: directorType,
      extensions: { relation: { embedded: true, displayField: 'name' } }
    },
    seasons: {
      type: new GraphQLList(seasonType),
      extensions: { relation: { connectionField: 'serie' } }
    }
  })
});

// Frontend automatically handles:
// - Embedded director editing in the same form
// - Season collection management with parent reference
// - Proper mutations for create/update/delete
```

### 🔧 **Customization Integration**

#### **Form Customization Setup**
```typescript
// src/examples/setupConfiguration.ts
import { setupEpisodeFormCustomization } from "./episodeFormCustomization";
import { setupSerieFormCustomization } from "./serieFormCustomization";
import { setupI18n } from "./i18nSetup";
import { setupColumnRenderers } from "./columnRenderersSetup";
import { setupSeasonStateMachine } from "./seasonStateMachineExample";

export const setupConfigurations = () => {
  setupI18n();
  setupColumnRenderers();
setupEpisodeFormCustomization();
  setupSerieFormCustomization();
  setupSeasonStateMachine();
};
```

#### **Column Customization Setup**
```typescript
// src/examples/columnRenderersSetup.tsx
import { registerColumnRenderer } from "@simtlix/simfinity-fe-components";

export const setupColumnRenderers = () => {
registerColumnRenderer("episode.date", ({ value }) => {
    // Custom date rendering with icon
    return <DateWithIcon value={value} />;
  });
};
```

## Architecture

### 📁 **Project Structure**
```
src/
├── app/                    # Next.js App Router pages
│   ├── entities/          # Dynamic entity pages
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # App providers
├── components/            # Reusable UI components
│   └── app/              # App-specific components
├── examples/             # Usage examples and patterns
│   ├── columnRenderersSetup.tsx
│   ├── episodeFormCustomization.ts
│   ├── i18nSetup.ts
│   ├── serieFormCustomization.tsx
│   ├── setupConfiguration.ts
│   └── seasonStateMachineExample.ts
├── i18n/                 # Function-based i18n
│   ├── en.ts
│   └── es.ts
├── lib/                  # Utilities and configurations
│   ├── urqlClient.ts
│   └── themeContext.tsx
└── public/
    └── i18n/            # Static JSON i18n
        ├── en.json
        └── es.json
```

### 🔄 **Data Flow**
1. **Schema Introspection** → Field Discovery → Form Generation
2. **User Input** → Field Change → Customization Processing → State Update
3. **Collection Changes** → Local State → Parent Form Integration
4. **Form Submission** → Data Validation → GraphQL Mutation → Success/Error Handling

### 🛠 **Tech Stack**
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5 (strict mode)
- **UI Library**: Material-UI v7.3.1
- **Data Layer**: urql 5.0.1 + GraphQL 16.11.0
- **Styling**: Tailwind CSS 4 + Emotion
- **State Management**: React hooks + custom hooks
- **Internationalization**: i18n support (en/es)
- **Simfinity Components**: @simtlix/simfinity-fe-components v1.0.3

## Documentation

### Core Documentation
- **[EntityForm Guide](ENTITY_FORM_README.md)** - Complete guide to the EntityForm component architecture, field types, and usage patterns
- **[Form Customization](FORM_CUSTOMIZATION_README.md)** - Comprehensive documentation for customizing form layouts, field behavior, validation, and entity-level callbacks

### Advanced Features
- **[Entity-Level Callbacks](ENTITY_LEVEL_CALLBACKS_README.md)** - In-depth guide to beforeSubmit, onSuccess, and onError callbacks for custom business logic

### Examples & Patterns
- **src/examples/** - Working examples of form customizations, column renderers, i18n setup, and state machines

## Learn More

To learn more about the technologies used in this project:

- **[Next.js Documentation](https://nextjs.org/docs)** - Learn about Next.js features and API
- **[Material-UI Documentation](https://mui.com/)** - Material-UI components and theming
- **[urql Documentation](https://commerce.nearform.com/open-source/urql/docs/)** - GraphQL client for React
- **[Simfinity.js](https://github.com/simtlix/simfinity-js)** - GraphQL schema and API generator

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
