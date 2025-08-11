"use client";

import * as React from "react";
import { Typography } from "@mui/material";
import LayoutShell from "@/components/LayoutShell";

export default function Home() {
  return (
    <LayoutShell>
      <Typography variant="h5" gutterBottom>
        Select an entity from the left menu
      </Typography>
    </LayoutShell>
  );
}
