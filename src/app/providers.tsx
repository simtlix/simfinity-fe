"use client";

import * as React from "react";
import { SimfinityClientProvider, useSimfinityClient } from "@simtlix/simfinity-fe-components";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { I18nProvider } from "@simtlix/simfinity-fe-components";
import { ThemeProvider, useTheme } from "@/lib/themeContext";
import { setupSimfinity } from "@/simfinitySetup";
import { setSimfinityClient } from "@/lib/simfinityClientRef";
import { InitGuard } from "@/components/app/SimfinityFallbacks";

setupSimfinity();

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql";

function ClientRefCapture({ children }: { children: React.ReactNode }) {
  const client = useSimfinityClient();
  React.useEffect(() => { setSimfinityClient(client); }, [client]);
  return <>{children}</>;
}

function ThemeConsumer({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InitGuard endpoint={GRAPHQL_URL}>
      <SimfinityClientProvider endpoint={GRAPHQL_URL}>
        <ClientRefCapture>
          <I18nProvider>
            <ThemeProvider>
              <ThemeConsumer>{children}</ThemeConsumer>
            </ThemeProvider>
          </I18nProvider>
        </ClientRefCapture>
      </SimfinityClientProvider>
    </InitGuard>
  );
}
