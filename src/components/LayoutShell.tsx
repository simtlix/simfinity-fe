"use client";

import * as React from "react";
import { Box, Toolbar } from "@mui/material";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <AppHeader onMenuClick={() => setMobileOpen((v) => !v)} />
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}


