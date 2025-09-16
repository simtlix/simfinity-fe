"use client";

import * as React from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apolloClient";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { I18nProvider } from "@simtlix/simfinity-fe-components";

// Import theme and setup configurations
import { theme, setupConfigurations } from "@/examples/setupConfiguration";

// Setup all configurations (i18n, form customizations, etc.)
setupConfigurations();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <I18nProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </I18nProvider>
    </ApolloProvider>
  );
}



