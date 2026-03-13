import React from 'react';
import type { Preview } from '@storybook/nextjs-vite';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
  },
  components: {
    MuiFormControl: {
      defaultProps: { size: 'small', variant: 'filled' as const },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true, variant: 'filled' as const },
    },
    MuiFilledInput: {
      defaultProps: { disableUnderline: true },
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
