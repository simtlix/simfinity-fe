"use client";

import * as React from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apolloClient";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { I18nProvider } from "@simtlix/simfinity-fe-components";

// Import theme context and setup configurations
import { ThemeProvider, useTheme } from "@/lib/themeContext";
import { setupConfigurations } from "@/examples/setupConfiguration";

// Setup all configurations (i18n, form customizations, etc.)
setupConfigurations();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <I18nProvider>
        <ThemeProvider>
          <ThemeConsumer>{children}</ThemeConsumer>
        </ThemeProvider>
      </I18nProvider>
    </ApolloProvider>
  );
}

// Internal component to consume theme context and provide MUI theme
function ThemeConsumer({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}



