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

### 📊 **Column Customization System**

The column customization system allows you to create specialized renderers for different data types in EntityTable columns.

### 🌍 **Internationalization (i18n) System**

The internationalization system provides multi-language support with dynamic label resolution, entity-specific translations, and function-based internationalization.

#### **Core i18n Function**
```typescript
const { resolveLabel } = useI18n();

// Basic usage
resolveLabel(
  keys: string[],                    // Array of fallback keys
  context?: Record<string, unknown>, // Context variables for interpolation
  fallback?: string                  // Default fallback text
): string
```

#### **Label Resolution Strategy**
The system uses a multi-level fallback strategy for robust label resolution:

1. **Entity-Specific Keys**: `entity.{entityType}.{fieldName}`
2. **Generic Field Keys**: `{fieldName}`
3. **Fallback Text**: Direct string fallback

#### **Entity and Field Labeling**
```typescript
// Entity labels
resolveLabel(["entity.serie.single"], { entity: "series" }, "Serie")           // "Serie"
resolveLabel(["entity.serie.plural"], { entity: "series" }, "Series")          // "Series"
resolveLabel(["entity.episode.single"], { entity: "episodes" }, "Episode")     // "Episode"

// Field labels
resolveLabel(["serie.name"], { entity: "series", field: "name" }, "Name")      // "Nombre" (ES) / "Name" (EN)
resolveLabel(["serie.description"], { entity: "series", field: "description" }, "Description")
resolveLabel(["episode.date"], { entity: "episodes", field: "date" }, "Date")

// Form labels
resolveLabel(["form.create"], { entity: "series" }, "Create")                  // "Crear" (ES) / "Create" (EN)
resolveLabel(["form.edit"], { entity: "series" }, "Edit")                      // "Editar" (ES) / "Edit" (EN)
resolveLabel(["form.view"], { entity: "series" }, "View")                      // "Ver" (ES) / "View" (EN)
```



##### **2. Public i18n Files (public/i18n/)**
These are JSON files served statically and can be loaded dynamically for runtime language switching.

```json
// public/i18n/en.json
{
  "entity.serie.single": "Serie",
  "entity.serie.plural": "Series",
  "entity.season.single": "Season",
  "entity.season.plural": "Seasons",
  "entity.episode.single": "Episode",
  "entity.episode.plural": "Episodes",
  "entity.director.single": "Director",
  "entity.director.plural": "Directors",
  "entity.star.single": "Star",
  "entity.star.plural": "Stars",
  "entity.category.single": "Category",
  "entity.category.plural": "Categories",
  "entity.movie.single": "Movie",
  "entity.movie.plural": "Movies",

  "serie.name": "Name",
  "serie.categories": "Categories",
  "serie.director": "Director",
  "serie.seasons": "Seasons",
  "serie.stars": "Stars",

  "director.name": "Name",
  "director.country": "Country",

  "season.number": "Number",
  "season.year": "Year",
  "season.state": "State",
  "season.serie": "Series",

  "episode.number": "Number",
  "episode.name": "Name",
  "episode.date": "Air Date",
  "episode.season": "Season",

  "star.name": "Name",
  "star.country": "Country",

  "assignedStarAndSerie.id": "ID",
  "assignedStarAndSerie.serie": "Series",
  "assignedStarAndSerie.star": "Star",
  
  "collection.loading": "Loading...",
  "collection.error": "Error loading data",
  "collection.noData": "No data available",
  
  "grid.filter.columns": "Columns",
  "grid.filter.operator": "Operator",
  "grid.filter.value": "Value",
  "grid.filter.contains": "contains",
  "grid.filter.equals": "equals",
  "grid.filter.startsWith": "starts with",
  "grid.filter.endsWith": "ends with",
  "grid.filter.is": "is",
  "grid.filter.not": "not",
  "grid.filter.isAnyOf": "is any of",
  "grid.filter.greaterThan": "greater than",
  "grid.filter.greaterThanOrEqual": "greater than or equal to",
  "grid.filter.lessThan": "less than",
  "grid.filter.lessThanOrEqual": "less than or equal to",

  "form.create": "Create",
  "form.edit": "Edit",
  "form.view": "View",
  "form.cancel": "Cancel",
  "form.update": "Update",
  "form.submit": "Submit",
  "form.required": "This field is required",
  "form.invalidNumber": "Must be a valid number",
  "form.invalidDate": "Must be a valid date",
  "form.successCreated": "Entity created successfully!",
  "form.successUpdated": "Entity updated successfully!",
  "form.errorOccurred": "An error occurred",
  "form.searchAnother": "Search for another...",
  "form.searchObject": "Search {entity}...",
  "form.addField": "Add {field}",
  "form.selectField": "Select {field}",

  "actions.view": "View",
  "actions.edit": "Edit",
  "actions.column": "Actions",
  "button.create": "Create"
}

// public/i18n/es.json
{
  "entity.serie.single": "Serie",
  "entity.serie.plural": "Series",
  "entity.season.single": "Temporada",
  "entity.season.plural": "Temporadas",
  "entity.episode.single": "Episodio",
  "entity.episode.plural": "Episodios",
  "entity.director.single": "Director",
  "entity.director.plural": "Directores",
  "entity.star.single": "Actor",
  "entity.star.plural": "Actores",
  "entity.category.single": "Categoría",
  "entity.category.plural": "Categorías",
  "entity.movie.single": "Película",
  "entity.movie.plural": "Películas",

  "serie.name": "Título",
  "serie.categories": "Categorías",
  "serie.director": "Director",
  "serie.seasons": "Temporadas",
  "serie.stars": "Actores",

  "director.name": "Nombre",
  "director.country": "País",

  "season.number": "N°",
  "season.year": "Año",
  "season.state": "Estado",
  "season.serie": "Serie",

  "episode.number": "N°",
  "episode.name": "Nombre",
  "episode.date": "Fecha",
  "episode.season": "Temporada",

  "star.name": "Nombre",
  "star.country": "País",

  "assignedStarAndSerie.id": "ID",
  "assignedStarAndSerie.serie": "Serie",
  "assignedStarAndSerie.star": "Estrella",
  
  "collection.loading": "Cargando...",
  "collection.error": "Error al cargar datos",
  "collection.noData": "No hay datos disponibles",
  
  "grid.filter.columns": "Columnas",
  "grid.filter.operator": "Operador",
  "grid.filter.value": "Valor",
  "grid.filter.contains": "contiene",
  "grid.filter.equals": "igual a",
  "grid.filter.startsWith": "empieza con",
  "grid.filter.endsWith": "termina con",
  "grid.filter.is": "es",
  "grid.filter.not": "no es",
  "grid.filter.isAnyOf": "cualquiera de",
  "grid.filter.greaterThan": "mayor que",
  "grid.filter.greaterThanOrEqual": "mayor o igual que",
  "grid.filter.lessThan": "menor que",
  "grid.filter.lessThanOrEqual": "menor o igual que",

  "form.create": "Crear",
  "form.edit": "Editar",
  "form.view": "Ver",
  "form.cancel": "Cancelar",
  "form.update": "Actualizar",
  "form.submit": "Enviar",
  "form.required": "Este campo es obligatorio",
  "form.invalidNumber": "Debe ser un número válido",
  "form.invalidDate": "Debe ser una fecha válida",
  "form.successCreated": "¡Entidad creada exitosamente!",
  "form.successUpdated": "¡Entidad actualizada exitosamente!",
  "form.errorOccurred": "Ocurrió un error",
  "form.searchAnother": "Buscar otro...",
  "form.searchObject": "Buscar {entity}...",
  "form.addField": "Agregar {field}",
  "form.selectField": "Seleccionar {field}",

  "actions.view": "Ver",
  "actions.edit": "Editar",
  "actions.column": "Acciones",
  "button.create": "Crear"
}
```

#### **Public i18n File Benefits**

##### **1. Runtime Language Switching**
- **Dynamic loading** of language files without rebuilding
- **User preference** persistence across sessions
- **Automatic locale detection** from browser settings

##### **2. Static File Serving**
- **JSON files** served from public folder
- **Automatic loading** when locale changes
- **Error handling** with graceful fallbacks

#### **How Public i18n Files Work in This Project**

The project automatically loads JSON translation files from the `public/i18n/` folder based on the user's locale. Here's how it works:

##### **1. Automatic Loading**
The `I18nProvider` automatically fetches the appropriate language file when the locale changes:

```typescript
// From src/lib/i18n.tsx
React.useEffect(() => {
  // Load JSON labels from public folder
  fetch(`/i18n/${locale}.json`)
    .then(async (res) => (res.ok ? res.json() : {}))
    .then((json) => {
      if (!cancelled && json && typeof json === "object") 
        setStringLabels(json as Record<string, string>);
    })
    .catch(() => {
      if (!cancelled) setStringLabels({});
    });
}, [locale]);
```

##### **2. Current File Structure**
```
public/
└── i18n/
    ├── en.json          # English translations
    └── es.json          # Spanish translations
```

##### **3. Translation Key Format**
The project uses dot-notation keys for translations:

```json
{
  "entity.serie.single": "Serie",
  "entity.serie.plural": "Series",
  "serie.name": "Name",
  "serie.director": "Director",
  "form.create": "Create",
  "form.required": "This field is required"
}
```

##### **4. Locale Detection**
The system automatically detects the user's preferred language:
- **Browser language** preference
- **Environment variable** `NEXT_PUBLIC_LOCALE`
- **Fallback** to English ("en")

#### **Function-Based Labels with registerFunctionLabels**

The project supports both static JSON translations and dynamic function-based labels through the `registerFunctionLabels` system:

##### **1. Function-Based Label Registration**
```typescript
// src/i18n/en.ts
import { registerFunctionLabels, type LabelValue } from "@/lib/i18n";

export const labels: Record<string, LabelValue> = {
  // Dynamic labels with context
  "serie.name": "Title", // Override default "Name"
  "season.year": (ctx) => `Year (${ctx.entity})`, // Dynamic with context
  "episode.date": (ctx) => `Air Date for ${ctx.entity}`,
};

// Register on load
registerFunctionLabels("en", labels);
```

##### **2. LabelValue Types**
```typescript
type LabelValue = string | ((ctx: LabelContext) => string);

type LabelContext = { 
  entity: string; 
  field?: string 
};
```

##### **3. Context-Aware Labels**
```typescript
// Function-based labels receive context
"season.year": (ctx) => `Year (${ctx.entity})`,
// When used: ctx.entity = "season" → "Year (season)"

// Static labels work as before
"serie.name": "Title"
```

#### **Required i18n Keys for EntityForm and EntityTable**

Based on the actual usage in the codebase, here are the required translation keys:

##### **1. Entity Labels (Required)**
```json
{
  "entity.serie.single": "Serie",
  "entity.serie.plural": "Series",
  "entity.season.single": "Season", 
  "entity.season.plural": "Seasons",
  "entity.episode.single": "Episode",
  "entity.episode.plural": "Episodes",
  "entity.director.single": "Director",
  "entity.director.plural": "Directors",
  "entity.star.single": "Star",
  "entity.star.plural": "Stars",
  "entity.category.single": "Category",
  "entity.category.plural": "Categories"
}
```

##### **2. Field Labels (Required)**
```json
{
  "serie.name": "Name",
  "serie.categories": "Categories",
  "serie.director": "Director",
  "serie.seasons": "Seasons",
  "serie.stars": "Stars",
  
  "director.name": "Name",
  "director.country": "Country",
  
  "season.number": "Number",
  "season.year": "Year",
  "season.state": "State",
  "season.serie": "Series",
  
  "episode.number": "Number",
  "episode.name": "Name",
  "episode.date": "Air Date",
  "episode.season": "Season",
  
  "star.name": "Name",
  "star.country": "Country"
}
```

##### **3. Form Labels (Required)**
```json
{
  "form.create": "Create",
  "form.edit": "Edit", 
  "form.view": "View",
  "form.cancel": "Cancel",
  "form.update": "Update",
  "form.submit": "Submit",
  "form.required": "This field is required",
  "form.invalidNumber": "Must be a valid number",
  "form.invalidDate": "Must be a valid date",
  "form.successCreated": "Entity created successfully!",
  "form.successUpdated": "Entity updated successfully!",
  "form.errorOccurred": "An error occurred",
  "form.searchAnother": "Search for another...",
  "form.searchObject": "Search {entity}...",
  "form.addField": "Add {field}",
  "form.selectField": "Select {field}"
}
```

##### **4. Collection Labels (Required)**
```json
{
  "collection.loading": "Loading...",
  "collection.error": "Error loading data",
  "collection.noData": "No data available"
}
```

##### **5. Grid/Table Labels (Required)**
```json
{
  "grid.filter.columns": "Columns",
  "grid.filter.operator": "Operator",
  "grid.filter.value": "Value",
  "grid.filter.contains": "contains",
  "grid.filter.equals": "equals",
  "grid.filter.startsWith": "starts with",
  "grid.filter.endsWith": "ends with",
  "grid.filter.is": "is",
  "grid.filter.not": "not",
  "grid.filter.isAnyOf": "is any of",
  "grid.filter.greaterThan": "greater than",
  "grid.filter.greaterThanOrEqual": "greater than or equal to",
  "grid.filter.lessThan": "less than",
  "grid.filter.lessThanOrEqual": "less than or equal to"
}
```

##### **6. Action Labels (Required)**
```json
{
  "actions.view": "View",
  "actions.edit": "Edit",
  "actions.column": "Actions",
  "button.create": "Create"
}
```

#### **Label Resolution Priority**

The `resolveLabel` function tries multiple sources in order:

```typescript
const resolveLabel = (keys: string[], ctx: LabelContext, fallback: string): string => {
  for (const key of keys) {
    // 1. First try function-based labels (highest priority)
    const fv = funcLabels[key];
    if (typeof fv === "function") return fv(ctx);
    if (typeof fv === "string") return fv;
    
    // 2. Then try static JSON labels
    const sv = stringLabels[key];
    if (typeof sv === "string") return sv;
  }
  // 3. Finally use fallback
  return fallback;
};
```

**Priority Order:**
1. **Function-based labels** (from `registerFunctionLabels`)
2. **Static JSON labels** (from `public/i18n/{locale}.json`)
3. **Fallback string** (hardcoded in component)

#### **Complete i18n System Example**

Here's how all parts work together:

##### **1. Source i18n File (src/i18n/en.ts)**
```typescript
import { registerFunctionLabels, type LabelValue } from "@/lib/i18n";

export const labels: Record<string, LabelValue> = {
  // Override default labels with custom ones
  "serie.name": "Title", // Instead of "Name"
  "episode.date": (ctx) => `Air Date for ${ctx.entity}`, // Dynamic
};

registerFunctionLabels("en", labels);
```

##### **2. Public i18n File (public/i18n/en.json)**
```json
{
  "entity.serie.single": "Serie",
  "entity.serie.plural": "Series",
  "serie.name": "Name", // Will be overridden by function-based label
  "serie.director": "Director",
  "form.create": "Create",
  "form.required": "This field is required"
}
```

##### **3. Component Usage**
```typescript
import { useI18n } from '@/lib/i18n';

export default function EntityForm({ listField, action }) {
  const { resolveLabel } = useI18n();
  
  // Dynamic entity name resolution
  const entityName = resolveLabel([
    `entity.${listField}.${action === 'create' ? 'single' : 'plural'}`
  ], { entity: listField }, listField);
  
  // Dynamic field labels
  const getFieldLabel = (fieldName: string): string => {
    return resolveLabel([
      `${listField}.${fieldName}`,  // serie.name, episode.date
      fieldName                      // name, date (fallback)
    ], { entity: listField, field: fieldName }, fieldName);
  };
  
  // Form action labels
  const actionLabel = resolveLabel([
    `form.${action}`                // form.create, form.edit, form.view
  ], { entity: listField }, action);
  
  return (
    <div>
      <h1>{actionLabel} {entityName}</h1>
      {/* Form fields with dynamic labels */}
    </div>
  );
}
```

#### **Advanced i18n Features**
- **Pluralization**: Support for different plural forms
- **Gender Agreement**: Context-aware gender matching
- **Number Formatting**: Locale-specific number and date formats
- **Currency Support**: Localized currency display
- **RTL Support**: Right-to-left language support

#### **Column Renderer Types**
```typescript
type ColumnRenderer = (params: {
  entity: string;           // Entity type name (e.g., "episode")
  field: string;            // Field name (e.g., "date")
  row: Record<string, unknown>; // Row data
  value: unknown;           // Field value
  gridParams: any;          // MUI DataGrid parameters
}) => React.ReactElement;

// Registration function
function registerColumnRenderer(key: string, renderer: ColumnRenderer): void;
```

#### **Column Customization Examples**

##### **Date Column Renderer**
```typescript
import { registerColumnRenderer } from '@/lib/columnRenderers';

// Register a custom date renderer
registerColumnRenderer("episode.date", ({ value }) => {
  if (!value) return <span>-</span>;
  
  const date = new Date(String(value));
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <span style={{ 
      color: date < new Date() ? '#4caf50' : '#ff9800',
      fontWeight: '500'
    }}>
      {formattedDate}
    </span>
  );
});
```

##### **Status Column Renderer**
```typescript
registerColumnRenderer("episode.status", ({ value }) => {
  const status = String(value).toLowerCase();
  
  const statusConfig = {
    'published': { color: '#4caf50', label: 'Published' },
    'draft': { color: '#ff9800', label: 'Draft' },
    'archived': { color: '#9e9e9e', label: 'Archived' }
  };
  
  const config = statusConfig[status] || { color: '#f44336', label: 'Unknown' };
  
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{ 
        backgroundColor: config.color,
        color: 'white',
        fontWeight: '500'
      }}
    />
  );
});
```

##### **Complex Object Column Renderer**
```typescript
registerColumnRenderer("episode.director", ({ value }) => {
  if (!value || typeof value !== 'object') return <span>-</span>;
  
  const director = value as { name: string; country: string };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="body2" fontWeight="500">
        {director.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {director.country}
      </Typography>
    </Box>
  );
});
```

#### **Field-Level Customization**
```typescript
type FieldCustomization = {
  size?: FieldSize; // Material-UI grid sizing
  enabled?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  visible?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  order?: number;  // Display order
  onChange?: (
    fieldName: string,
    value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown },
    formData: Record<string, unknown>,
    setFieldData: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => void,
    setFieldVisible: (fieldName: string, visible: boolean) => void,
    setFieldEnabled: (fieldName: string, enabled: boolean) => void
  ) => { value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }; error?: string };
};
```

#### **Customization Examples**

##### **Basic Field Customization**
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

##### **Complete Episode Form Customization**
```typescript
import { registerFormCustomization } from '@/lib/formCustomization';

export function setupEpisodeFormCustomization() {
  // Register customization for create mode
  registerFormCustomization("episode", "create", {
    name: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices
      order: 1, // First in the row
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
        // If name has a value, enable number and season fields and set number to 1
        if (value && String(value).trim() !== '') {
          setFieldEnabled('number', true);
          setFieldEnabled('season', true);
          setFieldData('number', 1);
        } else {
          // If name is empty, disable number and season fields and clear their values
          setFieldEnabled('number', false);
          setFieldEnabled('season', false);
          setFieldData('number', "");
          setFieldData('season', "");
        }
        
        return { value, error: undefined };
      }
    },
    
    number: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices
      order: 2, // Second in the row (same row as name)
      // Dynamic enabled: only enabled when name has a value
      enabled: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const nameValue = formDataTyped.name?.value;
        return !!(nameValue && String(nameValue).trim() !== '');
      }
    },
    
    date: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices (second row)
      order: 3, // Third in order (second row)
    },
    
    season: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices (second row)
      order: 4, // Fourth in order (second row, at the end)
      // Dynamic enabled: only enabled when name has a value
      enabled: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const nameValue = formDataTyped.name?.value;
        return !!(nameValue && String(nameValue).trim() !== '');
      }
    }
  });

  // Register customization for edit mode (different behavior)
  registerFormCustomization("episode", "edit", {
    name: { size: { xs: 12, sm: 6, md: 6 }, order: 1 },
    number: { size: { xs: 12, sm: 6, md: 6 }, order: 2, enabled: true },
    date: { size: { xs: 12, sm: 6, md: 6 }, order: 3 },
    season: { size: { xs: 12, sm: 6, md: 6 }, order: 4, enabled: true }
  });
}

// Call this function in your app initialization
// setupEpisodeFormCustomization();
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

#### **Internationalization (i18n)**
- **Multi-Language**: English and Spanish support
- **Dynamic Labels**: Field labels resolved from i18n system
- **Context-Aware**: Entity and field-specific translations
- **Fallback Support**: Graceful degradation for missing keys
- **Function-Based**: Dynamic label resolution with parameters
- **Entity-Specific**: Automatic entity type detection and labeling

#### **Column Customization**
- **Custom Renderers**: Specialized display for different data types
- **Dynamic Content**: React components for complex column data
- **Responsive Design**: Mobile-friendly column layouts
- **Integration**: Seamless integration with EntityTable

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
- **Data Filtering**: Automatically filters collection data by parent entity ID
- **Mutation Handling**: Removes connection field from collection items during mutations
- **Query Generation**: Generates proper GraphQL queries with connection filters

#### **3. `embedded: true` - Embedded Objects**
```typescript
// In Simfinity.js type definition
director: {
  type: new GraphQLNonNull(directorType),
  extensions: {
    relation: {
      embedded: true,  // Director data stored within serie document
      displayField: 'name'
    }
  }
}
```

**Usage in EntityForm:**
- **Form Sections**: Renders embedded objects as collapsible accordion sections
- **Field Validation**: Validates individual embedded fields recursively
- **Data Structure**: Sends embedded data as direct properties in mutations

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
    
    // Embedded object - stored within serie document
    director: {
      type: new GraphQLNonNull(directorType),
      extensions: {
        relation: {
          embedded: true,
          displayField: 'name'
        }
      }
    },
    
    // Collection - references separate season documents
    seasons: {
      type: new GraphQLList(seasonType),
      extensions: {
        relation: {
          connectionField: 'serie'  // Links seasons to this serie
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
  director: Director!  # Embedded object
  seasons: [Season]    # Collection reference
}

type Director {
  id: ID!
  name: String!
  country: String
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
    director { name country }
    seasons { number year }
  }
}

# Update serie
mutation UpdateSerie($input: serieInputForUpdate!) {
  updateserie(input: $input) {
    id
    name
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
    director { name country }
    seasons { number year }
  }
}

# Get single serie
query Serie($id: ID!) {
  serie(id: $id) {
    id
    name
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
1. **Connection Filtering**: Uses `connectionField` to filter collection data
2. **Data Management**: Handles added, modified, and deleted collection items
3. **Mutation Integration**: Prepares collection data for Simfinity.js mutations
4. **Field Cleaning**: Removes metadata fields before sending to backend

### 🎯 **Key Benefits of Simfinity.js Integration**

- **Zero Configuration**: Forms and tables automatically adapt to schema changes
- **Type Safety**: Full TypeScript support with generated types
- **Consistent API**: All mutations follow Simfinity.js naming conventions
- **Automatic Validation**: Field validation based on GraphQL schema types
- **Real-time Updates**: Apollo Client cache management for fresh data
- **Scalable**: Handles complex nested structures and collections automatically

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

### 🚀 **Setting Up Customizations**

To use the customization system in your application, you need to register your customizations early in the app lifecycle.

#### **Form Customization Setup**
```typescript
// In your app initialization (e.g., layout.tsx or main component)
import { setupEpisodeFormCustomization } from '@/examples/episodeFormCustomization';

// Call setup functions
setupEpisodeFormCustomization();
```

#### **Column Customization Setup**
```typescript
// In your app initialization
import { registerColumnRenderer } from '@/lib/columnRenderers';

// Register custom column renderers
registerColumnRenderer("episode.date", ({ value }) => {
  // Your custom date renderer
});

registerColumnRenderer("episode.status", ({ value }) => {
  // Your custom status renderer
});
```

#### **Integration Points**
- **Layout Component**: Set up form customizations
- **Main App**: Register column renderers
- **Entity Components**: Use customization state
- **Custom Hooks**: Access customization data

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
