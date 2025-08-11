"use client";

import * as React from "react";
import { Box, Toolbar, Typography } from "@mui/material";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>
          Select an entity from the left menu
        </Typography>
      </Box>
    </Box>
  );
}
