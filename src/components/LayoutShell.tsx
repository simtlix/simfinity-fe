"use client";

import * as React from "react";
import { Box, Toolbar } from "@mui/material";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppHeader onMenuClick={() => setMobileOpen((v) => !v)} />
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
        <Toolbar />
        <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
}


