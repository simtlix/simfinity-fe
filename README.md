# Simfinity Frontend

A Next.js 15.4.6 frontend application for Simfinity, featuring a dynamic, schema-driven form management system built with GraphQL, Apollo Client, and Material-UI v7.3.1.

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
- **GraphQL Integration**: Native Apollo Client support with dynamic queries

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
- **Real-time Updates**: Apollo Client cache management

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

The system provides extensive customization capabilities for form behavior and appearance.

#### **Field-Level Customization**
```typescript
type FieldCustomization = {
  visible?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  enabled?: boolean | ((fieldName: string, value: unknown, formData: FormData) => boolean);
  size?: GridSize; // Material-UI grid sizing
  order?: number;  // Display order
  onChange?: (fieldName: string, value: unknown, formData: FormData, actions: FormCustomizationActions) => FieldChangeResult;
};
```

#### **Customization Examples**
```typescript
// Field visibility based on business logic
const customization = {
  "episode.season": {
    visible: (fieldName, value, formData) => {
      // Only show season field if series has seasons
      return formData.series?.seasons?.length > 0;
    }
  },
  
  // Field enable/disable logic
  "episode.number": {
    enabled: (fieldName, value, formData) => {
      // Disable episode number if season is locked
      return !formData.season?.locked;
    }
  },
  
  // Custom field sizing
  "episode.name": {
    size: { xs: 12, sm: 8, md: 6 } // Responsive grid sizing
  },
  
  // Field ordering
  "episode.date": {
    order: 3 // Display as third field
  }
};
```

### 🔧 **Advanced Features**

#### **Collection Management**
- **Add Items**: Create new collection items during entity creation
- **Edit Items**: Modify existing collection items with change tracking
- **Delete Items**: Mark items for deletion with restore capability
- **Bulk Operations**: Manage multiple items efficiently

#### **Embedded Object Support**
- **Nested Validation**: Individual field validation within objects
- **Accordion Layout**: Collapsible sections for better organization
- **Custom Sizing**: Flexible field layout within sections
- **Recursive Support**: Handle deeply nested structures

#### **GraphQL Integration**
- **Dynamic Queries**: Automatically generated based on schema
- **Mutation Support**: Create, update, and delete operations
- **Cache Management**: Apollo Client integration with invalidation
- **Schema Introspection**: Real-time field discovery

#### **Internationalization**
- **Multi-Language**: English and Spanish support
- **Dynamic Labels**: Field labels resolved from i18n system
- **Context-Aware**: Entity and field-specific translations
- **Fallback Support**: Graceful degradation for missing keys

## Examples

### 📺 **TV Series Management**

#### **Entity Structure**
```typescript
interface Serie {
  id: string;
  name: string;
  description: string;
  year: number;
  categories: string[];
  director: Director;        // Embedded object
  seasons: Season[];         // Collection
}

interface Director {
  name: string;
  country: string;
}

interface Season {
  id: string;
  number: number;
  year: number;
  episodes: Episode[];       // Nested collection
}

interface Episode {
  id: string;
  number: number;
  name: string;
  date: string;
  season: Season;            // Reference
}
```

#### **Usage Example**
```tsx
// Create a new series with episodes
<EntityForm 
  listField="series" 
  action="create"
/>

// The form will automatically:
// 1. Generate fields for Serie properties
// 2. Create embedded section for Director
// 3. Provide collection management for Seasons
// 4. Support nested Episode collections within Seasons
```

### 🎬 **Movie Database**

#### **Complex Relationships**
```typescript
interface Movie {
  id: string;
  title: string;
  releaseDate: string;
  director: Director;        // Embedded
  cast: Actor[];             // Collection
  genres: string[];          // List of scalars
  ratings: Rating[];         // Collection
}

interface Actor {
  id: string;
  name: string;
  role: string;
  movie: Movie;              // Reference back
}

interface Rating {
  id: string;
  score: number;
  review: string;
  user: User;                // Reference
}
```

## Architecture

### 🏗️ **System Design**

The Simfinity Frontend follows a component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    EntityTable                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Column Gen    │  │   Sorting       │  │ Pagination  │ │
│  │   (Schema)      │  │   (GraphQL)     │  │ (Server)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EntityForm                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Field Discovery │  │ Form Generation │  │ Validation  │ │
│  │ (Introspection) │  │ (Dynamic)       │  │ (Rules)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Collections     │  │ Embedded Obj    │  │ Submission  │ │
│  │ (CRUD)          │  │ (Accordion)     │  │ (GraphQL)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 **Technical Stack**

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5 (strict mode)
- **UI Library**: Material-UI v7.3.1 (MUI)
- **Data Layer**: Apollo Client 3.13.9 + GraphQL 16.11.0
- **Styling**: Tailwind CSS 4 + Emotion
- **State Management**: React hooks + custom hooks
- **Internationalization**: i18n support (en/es)

### 📊 **Data Flow**

1. **Schema Introspection** → Field Discovery → Form Generation
2. **User Input** → Field Change → Customization Processing → State Update
3. **Collection Changes** → Local State → Parent Form Integration
4. **Form Submission** → Data Validation → GraphQL Mutation → Success/Error Handling

### 🎯 **Key Principles**

- **SOLID Design**: Single responsibility, open/closed, dependency inversion
- **Schema-Driven**: All behavior derived from GraphQL schema
- **Composable**: Modular components with clear interfaces
- **Extensible**: Customization system for business logic
- **Accessible**: WCAG compliance and keyboard navigation

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

For more information about the Apache License 2.0, visit [https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0).
