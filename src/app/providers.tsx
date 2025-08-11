"use client";

import * as React from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apolloClient";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { I18nProvider } from "@/lib/i18n";

const theme = createTheme({
  palette: { mode: "light" },
});

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



