# Simfinity Frontend

A Next.js 15 frontend application for Simfinity, featuring a dynamic, schema-driven form management system built with GraphQL and Material-UI v7.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

This application automatically generates forms and tables from GraphQL schema introspection. It supports complex entity management including embedded objects, collections, state machines, and extensive customization capabilities.

The system provides two main components from `@simtlix/simfinity-fe-components`:

- **EntityTable** — Dynamic data tables with sorting, filtering, pagination, and custom column renderers
- **EntityForm** — Schema-driven forms for creating, editing, and viewing entities with stepper support

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript (strict mode) | 5 |
| UI | Material-UI (MUI) | 7.3.1 |
| Data Grid | MUI X Data Grid | 8.10.0 |
| Data Layer | `@simtlix/simfinity-fe-components` + `simfinity-js-client` | 1.0.20 / 1.0.2 |
| Styling | Tailwind CSS + Emotion | 4 |
| Component Dev | Storybook | 10 |
| Testing | Vitest + Playwright | 4.1 / 1.58 |
| i18n | Dual system (JSON + function-based) | — |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start Storybook
npm run storybook
```

Open [http://localhost:3000](http://localhost:3000) for the app, or [http://localhost:6006](http://localhost:6006) for Storybook.

### Environment

Create `.env.local`:

```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── entities/[listField]/         # Dynamic entity routes
│   │   ├── page.tsx                  # List (EntityTable)
│   │   ├── create/page.tsx           # Create form
│   │   └── [id]/
│   │       ├── edit/page.tsx         # Edit form
│   │       └── view/page.tsx         # View form
│   ├── layout.tsx                    # Root layout (Server Component)
│   ├── page.tsx                      # Home page
│   └── providers.tsx                 # Provider hierarchy + setupSimfinity()
├── components/
│   ├── app/                          # App shell components
│   │   ├── AppHeader.tsx             # Top bar + theme toggle
│   │   ├── LayoutShell.tsx           # Layout wrapper (header + sidebar + content)
│   │   ├── Sidebar.tsx               # Entity navigation (auto-populated)
│   │   ├── SimfinityFallbacks.tsx    # InitGuard: loading/error before app renders
│   │   └── ThemeToggle.tsx           # Light/dark/auto toggle
│   └── custom/                       # Reusable custom components
│       ├── index.ts                  # Barrel export (components + types)
│       ├── RichTextEditor.tsx        # Multiline text input
│       ├── CountrySelector.tsx       # Country dropdown
│       ├── CategoriesInput.tsx       # Tag-style category input
│       ├── DateColumn.tsx            # Date display with icon
│       ├── SeasonColumn.tsx          # Season chip display
│       └── *.stories.tsx             # Storybook stories per component
├── simfinitySetup/                   # All Simfinity registrations
│   ├── index.ts                      # Entry point: setupSimfinity()
│   ├── i18n/
│   │   ├── i18n.setup.ts            # Function-based label registration
│   │   └── index.ts
│   ├── episode/
│   │   ├── episode.create.ts        # Form customization (create mode)
│   │   ├── episode.edit.ts          # Form customization (edit mode)
│   │   ├── episode.column.date.tsx  # Column renderer for date field
│   │   ├── episode.column.season.tsx # Column renderer for season field
│   │   └── index.ts
│   ├── serie/
│   │   ├── serie.create.tsx         # Form customization with custom renderers
│   │   ├── serie.edit.tsx           # Form customization with collection editing
│   │   ├── serie.view.tsx           # Read-only view customization
│   │   └── index.ts
│   └── season/
│       ├── season.stateMachine.ts   # State machine (SCHEDULED → ACTIVE → FINISHED)
│       └── index.ts
├── i18n/                             # Function-based i18n (en.ts, es.ts)
├── lib/
│   ├── simfinityClientRef.ts        # Shared client ref for non-React usage
│   └── themeContext.tsx             # MUI theme system (modes, color schemes)
├── public/i18n/                     # Static JSON labels (en.json, es.json)
├── .storybook/                      # Storybook configuration
│   ├── main.ts
│   ├── preview.tsx
│   └── vitest.setup.ts
└── vitest.config.ts                 # Vitest + Storybook test plugin
```

## Provider Hierarchy

Defined in `src/app/providers.tsx`. `setupSimfinity()` runs once at module scope before React renders.

```
setupSimfinity()              ← registers i18n, customizations, columns, state machines
│
InitGuard                     ← pre-initializes Simfinity client, shows loading/error
└── SimfinityClientProvider   ← provides useSimfinityClient() context
    └── ClientRefCapture      ← captures client ref for non-React usage
        └── I18nProvider      ← provides useI18n() with merged labels
            └── ThemeProvider  ← theme context (mode, color scheme)
                └── MuiThemeProvider + CssBaseline
                    └── {children}
```

## EntityTable

Dynamic data tables with automatic column generation from the GraphQL schema.

```tsx
<EntityTable
  listField="episodes"
  onNavigate={(path) => router.push(path)}
  getSearchParams={() => searchParams}
  onSearchParamsChange={(params) => setSearchParams(params)}
/>
```

Features: automatic column detection, server-side sorting/pagination/filtering, custom column renderers, responsive layout.

## EntityForm

Schema-driven forms supporting create, edit, and view modes with embedded objects and collections.

```tsx
// Create
<EntityForm listField="series" action="create" onNavigate={router.push} />

// Edit
<EntityForm listField="series" entityId="123" action="edit" onNavigate={router.push} />

// View (read-only)
<EntityForm listField="series" entityId="123" action="view" onNavigate={router.push} />
```

### Supported Field Types

| Category | Types |
|---|---|
| Scalar | String, Number, Boolean, Date/DateTime, Enum, List (tags) |
| Object | Foreign key references with search/select |
| Embedded | Nested objects rendered inline |
| Collection | Related entity grids with add/edit/delete |

## Form Customization

All customizations are registered via `registerFormCustomization()` from `@simtlix/simfinity-fe-components`.

### Setup

Customizations are organized per entity in `src/simfinitySetup/<entity>/` and wired through `setupSimfinity()`:

```typescript
// src/simfinitySetup/index.ts
export const setupSimfinity = () => {
  setupI18n();
  setupEpisodeCustomization();
  setupSerieFormCustomization();
  setupSeasonStateMachine();
};
```

### Basic Field Customization

```typescript
import { registerFormCustomization } from '@simtlix/simfinity-fe-components';

registerFormCustomization("episode", "create", {
  fieldsCustomization: {
    name: {
      size: { xs: 12, sm: 12, md: 12 },
      order: 1,
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
        if (value && String(value).trim() !== '') {
          setFieldEnabled('number', true);
          setFieldData('number', 1);
        } else {
          setFieldEnabled('number', false);
          setFieldData('number', '');
        }
        return { value, error: undefined };
      }
    },
    number: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 2,
      enabled: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        return !!(formDataTyped.name?.value && String(formDataTyped.name.value).trim() !== '');
      }
    }
  }
});
```

### Stepper (Multi-Step) Forms

```typescript
registerFormCustomization("serie", "create", {
  mode: "stepper",
  steps: [
    { stepId: "basic-info", stepLabel: "serie.step.basicInfo" },
    { stepId: "description", stepLabel: "serie.step.description" },
    { stepId: "director", stepLabel: "serie.step.director" },
    { stepId: "seasons", stepLabel: "serie.step.seasons" },
  ],
  fieldsCustomization: {
    name: { stepId: "basic-info", size: { xs: 12 }, order: 1 },
    description: { stepId: "description", size: { xs: 12 }, order: 2 },
    director: { stepId: "director", size: { xs: 12 }, order: 3 },
    seasons: { stepId: "seasons", size: { xs: 12 }, order: 4 },
  }
});
```

### Custom Renderers

Replace default field rendering with custom components:

```typescript
import { FormField, FormCustomizationActions } from '@simtlix/simfinity-fe-components';
import { RichTextEditor } from '@/components/custom';

// In fieldsCustomization:
description: {
  customRenderer: (field: FormField, actions: FormCustomizationActions,
    handleFieldChange: (name: string, value: unknown) => void, disabled: boolean) => (
    <RichTextEditor
      value={field.value as string || ''}
      onChange={(val) => handleFieldChange(field.name, val)}
      disabled={disabled}
      error={field.error}
    />
  )
}
```

### Custom Embedded Renderer

Replace the default embedded object section with a custom layout:

```typescript
director: {
  customEmbeddedRenderer: (field, actions, handleEmbeddedFieldChange, disabled, formData) => {
    const nameField = field.embeddedFields?.find(f => f.name.endsWith('.name'));
    const nameValue = (formData[nameField?.name || ''] as { value?: string })?.value || '';
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <TextField
          label="Director Name"
          value={nameValue}
          onChange={(e) => handleEmbeddedFieldChange(field.name, 'name', e.target.value)}
          disabled={disabled}
        />
      </Paper>
    );
  }
}
```

### Entity-Level Callbacks

Lifecycle hooks that run before submission, after success, or on error:

```typescript
registerFormCustomization("serie", "create", {
  fieldsCustomization: { /* ... */ },

  beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    // Validate, transform data, show warnings
    // Return true to proceed, false to cancel
    return true;
  },

  onSuccess: async (result) => {
    // Custom success message, navigation, side effects
    return { message: 'Created successfully!', navigateTo: '/entities/series' };
  },

  onError: async (error, formData, actions) => {
    // Custom error handling
    actions.setFormMessage({ type: 'error', message: error.message });
  }
});
```

### Collection Field Customization

Customize collection item editing with `onEdit` / `onCreate` / `onDelete`:

```typescript
seasons: {
  onEdit: {
    fieldsCustomization: {
      name: { size: { xs: 12, sm: 6 }, order: 1 }
    },
    onSubmit: async (item, setFieldData, formData, setFieldVisible, setFieldEnabled, setMessage, parentFormAccess) => {
      if (!item.name?.trim()) {
        setMessage({ type: 'error', message: 'Season name is required' });
        return false;
      }
      return true;
    }
  },
  onDelete: async (item, setMessage) => {
    if (item.episodeCount > 0) {
      setMessage({ type: 'error', message: 'Cannot delete season with episodes' });
      return false;
    }
    return true;
  }
}
```

### API Reference

```typescript
registerFormCustomization(
  entityType: string,
  mode: "create" | "edit" | "view",
  config: {
    mode?: "default" | "stepper";
    steps?: Array<{ stepId: string; stepLabel: string; onNext?; onBack? }>;
    fieldsCustomization?: Record<string, FieldCustomization>;
    beforeSubmit?: (formData, collectionChanges, transformedData, actions) => boolean | Promise<boolean>;
    onSuccess?: (result) => EntityFormSuccessResult | void;
    onError?: (error, formData, actions) => void;
  }
): void
```

**FieldCustomization options**: `size`, `order`, `enabled`, `visible`, `onChange`, `customRenderer`, `customEmbeddedRenderer`, `stepId`, `onEdit`, `onCreate`, `onDelete`, `customCollectionRenderer`.

**EntityFormCallbackActions**: `setFieldData`, `setFieldVisible`, `setFieldEnabled`, `setCollectionChanges`, `setFormMessage`, `setError`.

## Column Renderers

Custom cell renderers for EntityTable columns:

```typescript
import { registerColumnRenderer } from '@simtlix/simfinity-fe-components';
import { DateColumn } from '@/components/custom';

registerColumnRenderer('episode.date', ({ value }) => (
  <DateColumn value={value as string | number | null | undefined} />
));
```

Column renderers are registered per entity field (key: `<entity>.<field>`) and live in `src/simfinitySetup/<entity>/<entity>.column.<field>.tsx`.

## State Machine

State transitions with business rule validation:

```typescript
import { registerEntityStateMachine } from '@simtlix/simfinity-fe-components';
import { getSimfinityClient } from '@/lib/simfinityClientRef';

registerEntityStateMachine("season", {
  actions: {
    activate: {
      mutation: 'activate_season',
      from: 'SCHEDULED',
      to: 'ACTIVE',
      onBeforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
        const client = getSimfinityClient();
        const result = await client.findByParent('Episode', 'season', transformedData.id as string)
          .fields('id').page(1, 1, true).execWithMeta();
        const count = result.extensions?.count ?? 0;
        if (count === 0) {
          actions.setFormMessage({ type: 'error', message: 'Cannot activate without episodes' });
          return { shouldProceed: false, error: 'Must have episodes' };
        }
        return { shouldProceed: true };
      },
      onSuccess: async (result, formData, collectionChanges, transformedData, actions) => {
        actions.setFormMessage({ type: 'success', message: 'Season activated!' });
      },
      onError: async (error, formData, collectionChanges, transformedData, actions) => {
        actions.setFormMessage({ type: 'error', message: `Failed: ${error.message}` });
      }
    }
  }
});
```

The EntityForm automatically detects registered state machines and shows an "Actions" button with available transitions.

### State Machine i18n Labels

```json
{
  "stateMachine.season.state.SCHEDULED": "Scheduled",
  "stateMachine.season.state.ACTIVE": "Active",
  "stateMachine.season.state.FINISHED": "Finished",
  "stateMachine.season.action.activate": "Activate",
  "stateMachine.season.action.finalize": "Finalize"
}
```

## Internationalization (i18n)

### Static Labels (`public/i18n/*.json`)

```json
{
  "entity.serie.single": "Serie",
  "entity.serie.plural": "Series",
  "serie.name": "Name",
  "serie.step.basicInfo": "Basic Information",
  "form.create": "Create",
  "grid.filter.contains": "contains"
}
```

### Function-Based Labels (`src/simfinitySetup/i18n/i18n.setup.ts`)

```typescript
import { registerFunctionLabels, type LabelValue } from '@simtlix/simfinity-fe-components';

const enLabels: Record<string, LabelValue> = {
  "serie.name": "Title",
  "season.year": (ctx) => `Year (${ctx.entity})`,
};

registerFunctionLabels("en", enLabels);
```

Function-based labels override static JSON labels. Both are merged by `I18nProvider`.

### Label Patterns

| Pattern | Example | Purpose |
|---|---|---|
| `entity.<type>.single` | `entity.serie.single` | Singular name |
| `entity.<type>.plural` | `entity.serie.plural` | Plural name |
| `<type>.<field>` | `serie.name` | Field label |
| `<type>.step.<id>` | `serie.step.basicInfo` | Stepper step label |
| `form.<action>` | `form.create` | Form action |
| `stateMachine.<type>.state.<STATE>` | `stateMachine.season.state.ACTIVE` | State label |
| `stateMachine.<type>.action.<action>` | `stateMachine.season.action.activate` | Action label |

## Theme System

Managed in `src/lib/themeContext.tsx` with `useTheme()` hook.

- **Modes**: Light, Dark, Auto (follows system preference)
- **Color schemes**: Default, Blue, Green, Purple, Orange, Mint, Soft Blue, Soft Gray, Banking
- **Persistence**: Saved to `localStorage`

```tsx
import { useTheme } from '@/lib/themeContext';

function MyComponent() {
  const { mode, customTheme, theme, setMode, setCustomTheme, toggleMode } = useTheme();
  // ...
}
```

### Adding a Color Scheme

Add an entry to the theme definitions in `src/lib/themeContext.tsx`:

```typescript
const themeDefinitions = {
  // ...existing themes
  newTheme: {
    palette: {
      primary: { main: '#color', light: '#lighter', dark: '#darker' },
      secondary: { main: '#color' },
    },
  },
};
```

## Custom Components

Reusable UI components live in `src/components/custom/` with Storybook stories.

| Component | Type | Props |
|---|---|---|
| `RichTextEditor` | Form input | `value: string`, `onChange`, `disabled`, `error?` |
| `CountrySelector` | Form input | `value: string`, `onChange`, `disabled`, `error?` |
| `CategoriesInput` | Form input | `value: string[]`, `onChange`, `disabled`, `error?` |
| `DateColumn` | Column display | `value: string \| number \| null` |
| `SeasonColumn` | Column display | `value: string \| number \| null` |

Import from barrel: `import { RichTextEditor, DateColumn } from '@/components/custom'`

## Storybook

Stories live alongside components as `*.stories.tsx`. Configuration in `.storybook/`.

```bash
npm run storybook        # Dev server on port 6006
npm run build-storybook  # Static build
```

Stories are wrapped with MUI `ThemeProvider` + `CssBaseline` via `.storybook/preview.tsx`.

## Simfinity Backend Compatibility

This frontend works with [Simfinity.js](https://github.com/simtlix/simfinity-js), which auto-generates GraphQL schemas. Components introspect the schema to understand entity structures.

### Schema Metadata

| Extension | Purpose | Example |
|---|---|---|
| `displayField` | Show human-readable value for object references | `extensions: { relation: { displayField: 'name' } }` |
| `connectionField` | Link collection items to parent entity | `extensions: { relation: { connectionField: 'serie' } }` |
| `embedded: true` | Treat object as inline (not a reference) | `extensions: { relation: { embedded: true } }` |

### Generated Operations

- **Queries**: `series { id name director { name } seasons { number } }`
- **Mutations**: `addserie(input: $input)`, `updateserie(input: $input)`
- **Filters**: Simfinity-compatible filter queries with operators

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
