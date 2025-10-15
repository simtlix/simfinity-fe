# Theming System - Simfinity Frontend

This document describes the comprehensive theming system implemented in the Simfinity frontend application.

## Overview

The theming system provides dynamic theme switching capabilities with multiple color schemes and modes, built on top of Material-UI v7.3.1. It supports:

- **Multiple Theme Modes**: Light, Dark, and Auto (follows system preference)
- **Multiple Color Schemes**: Default, Blue, Green, Purple, Orange, Mint, Soft Blue, Soft Gray, and Banking
- **Theme Persistence**: User preferences are saved to localStorage
- **Smooth Transitions**: Animated theme changes for better UX
- **TypeScript Support**: Fully typed theme context and components

## Architecture

### Core Components

1. **ThemeContext** (`src/lib/themeContext.tsx`)
   - Manages theme state and provides theme switching functionality
   - Handles localStorage persistence
   - Listens for system theme changes in auto mode

2. **ThemeToggle** (`src/components/app/ThemeToggle.tsx`)
   - UI component for switching themes
   - Provides dropdown menus for mode and color selection
   - Shows current theme status

3. **ThemeProvider** (integrated in `src/app/providers.tsx`)
   - Wraps the application with theme context
   - Provides Material-UI theme to all components

## Usage

### Basic Theme Access

```tsx
import { useTheme } from '@/lib/themeContext';

function MyComponent() {
  const { mode, customTheme, theme, setMode, setCustomTheme, toggleMode } = useTheme();
  
  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      Current mode: {mode}
      Current color: {customTheme}
    </Box>
  );
}
```

### Theme Switching

```tsx
function ThemeControls() {
  const { setMode, setCustomTheme, toggleMode } = useTheme();
  
  return (
    <Stack direction="row" spacing={2}>
      <Button onClick={toggleMode}>Toggle Light/Dark</Button>
      <Button onClick={() => setMode('auto')}>Auto Mode</Button>
      <Button onClick={() => setCustomTheme('blue')}>Blue Theme</Button>
    </Stack>
  );
}
```

### Using Theme Values in Components

```tsx
function ThemedComponent() {
  const { theme } = useTheme();
  
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[2],
        '&:hover': {
          boxShadow: theme.shadows[4],
          transition: theme.transitions.create('box-shadow'),
        },
      }}
    >
      Themed content
    </Box>
  );
}
```

## Available Themes

### Theme Modes

- **Light**: Traditional light theme
- **Dark**: Dark theme with inverted colors
- **Auto**: Automatically follows system preference

### Color Schemes

#### Classic Themes
- **Default**: Material-UI default blue/red color scheme
- **Blue**: Blue/orange color scheme
- **Green**: Green/orange color scheme  
- **Purple**: Purple/yellow color scheme
- **Orange**: Orange/blue color scheme

#### Soft Themes (Enhanced with custom backgrounds and subtle shadows)
- **Mint**: Teal/green color scheme with soft mint backgrounds
- **Soft Blue**: Light blue color scheme with soft blue-gray backgrounds
- **Soft Gray**: Neutral gray color scheme with minimal contrast

#### Professional Themes (Minimal, enterprise-focused design)
- **Banking**: Deep purple/violet color scheme with minimal, professional aesthetic
  - Primary: `#6B2DA8` (Deep Purple)
  - Secondary: `#4A148C` (Dark Purple)
  - Border Radius: `8px` (sharper corners)
  - Shadows: Subtle, minimal shadows (`0 2px 8px`)
  - Tables: Clean, minimal row design with subtle hover states
  - Perfect for financial and enterprise applications
  - Distinct from soft themes with its minimalist approach

## Theme Structure

Each color scheme defines:

```typescript
{
  palette: {
    primary: {
      main: '#color',
      light: '#lighter-color',
      dark: '#darker-color',
    },
    secondary: {
      main: '#color',
      light: '#lighter-color', 
      dark: '#darker-color',
    },
  },
}
```

## Banking Theme - Professional Design

The banking theme is specifically designed for financial and enterprise applications with a minimalist, professional aesthetic that differs from other themes:

### Key Differences

**Design Philosophy:**
- **Minimal**: Clean, uncluttered interface
- **Professional**: Subtle shadows and sharp corners (8px border radius)
- **Accessible**: High contrast text for readability
- **Fast**: Faster transitions (0.2s vs 0.3s)

**Visual Elements:**
- **Border Radius**: `8px` (vs `20px` in soft themes)
- **Shadows**: `0 2px 8px rgba(0,0,0,.08)` (vs `0 18px 40px` in soft themes)
- **AppBar**: No shadow, clean border-bottom only
- **Tables**: Minimal row design with `#FAFAFA` header background, alternating row colors (zebra striping) for better readability
- **Buttons**: No default shadow, hover only
- **Transitions**: 0.2s (faster and more responsive)

**Color Palette:**
```typescript
{
  brand: "#6B2DA8",        // Deep Purple
  brand2: "#4A148C",       // Dark Purple
  canvasLight: "#FAFAFA",  // Very light gray
  canvasDark: "#1A0F24",   // Deep purple-black
  surfaceLight: "#FFFFFF", // Pure white
  surfaceDark: "#2D1B4E",  // Dark purple surface
}
```

**When to Use:**
- Financial applications (banking, trading, accounting)
- Enterprise business applications
- Admin dashboards requiring a professional look
- Applications where data clarity is paramount

## Integration with Form System

The theming system integrates seamlessly with the existing EntityForm system:

```tsx
// Form customization can be theme-aware
const themeAwareCustomization = {
  fields: {
    name: {
      visible: true,
      enabled: true,
      // Access theme context in customizations
      onChange: (fieldName, value, formData, actions) => {
        // Theme-aware logic here
        return { success: true };
      },
    },
  },
};
```

## Customization

### Adding New Color Schemes

To add a new color scheme, update the `themeDefinitions` object in `src/lib/themeContext.tsx`:

```typescript
const themeDefinitions: Record<CustomTheme, ThemeOptions> = {
  // ... existing themes
  newTheme: {
    palette: {
      primary: {
        main: '#your-color',
        light: '#lighter-version',
        dark: '#darker-version',
      },
      secondary: {
        main: '#secondary-color',
        light: '#lighter-version',
        dark: '#darker-version',
      },
    },
  },
};
```

### Adding New Theme Modes

To add new theme modes, update the `ThemeMode` type and add handling logic:

```typescript
export type ThemeMode = 'light' | 'dark' | 'auto' | 'your-new-mode';
```

### Custom Theme Components

Create theme-aware components by using the `useTheme` hook:

```tsx
function CustomThemedButton({ children, ...props }) {
  const { theme } = useTheme();
  
  return (
    <Button
      {...props}
      sx={{
        ...props.sx,
        // Use theme values
        borderRadius: theme.shape.borderRadius * 2,
        textTransform: 'none',
        fontWeight: theme.typography.fontWeightMedium,
      }}
    >
      {children}
    </Button>
  );
}
```

## Performance Considerations

- **Memoization**: Theme objects are memoized to prevent unnecessary re-renders
- **Smooth Transitions**: CSS transitions are applied to theme-dependent properties
- **Local Storage**: Theme preferences are cached for faster initial load
- **System Theme Detection**: Efficiently listens for system theme changes

## Browser Support

- **Modern Browsers**: Full support for all features
- **Local Storage**: Required for theme persistence
- **CSS Custom Properties**: Used for smooth transitions
- **Media Queries**: Used for system theme detection

## Migration from Static Theme

The theming system replaces the previous static theme configuration:

**Before:**
```typescript
// src/examples/setupConfiguration.ts
export const theme = createTheme({
  palette: { mode: "light" },
});
```

**After:**
```typescript
// Theme is now managed dynamically by ThemeProvider
// No static theme export needed
```

## Examples

See `src/examples/themeUsageExample.tsx` for comprehensive usage examples including:
- Basic theme access
- Theme switching controls
- Custom themed components
- Form integration examples

## Troubleshooting

### Common Issues

1. **Theme not updating**: Ensure components are wrapped in ThemeProvider
2. **TypeScript errors**: Import types from `@/lib/themeContext`
3. **LocalStorage issues**: Check browser console for storage errors
4. **System theme not detected**: Verify `prefers-color-scheme` media query support

### Debug Mode

Enable theme debugging by adding to your component:

```tsx
const { theme } = useTheme();
console.log('Current theme:', theme);
```

## Future Enhancements

Potential future improvements:
- High contrast mode support
- Custom theme creation UI
- Theme sharing/export functionality
- Animation customization options
- Accessibility improvements for theme switching
