import * as React from "react";
import EntityTable from "@/components/EntityTable";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "@/components/Sidebar";

export default async function EntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  const { listField } = await params;
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Toolbar />
        <EntityTable listField={listField} />
      </Box>
    </Box>
  );
}


