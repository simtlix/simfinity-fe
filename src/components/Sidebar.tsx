"use client";

import * as React from "react";
import { useQuery } from "@apollo/client";
import { INTROSPECTION_QUERY, getListEntityFieldNames, SchemaData } from "@/lib/introspection";
import { useI18n } from "@/lib/i18n";
import { Box, CircularProgress, Divider, Drawer, List, ListItemButton, ListItemText, Toolbar, Typography } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 260;

type SidebarProps = {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { resolveLabel } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading, error } = useQuery(INTROSPECTION_QUERY);

  const entries = React.useMemo(() => {
    const schema = data as SchemaData | undefined;
    if (!schema) return [] as string[];
    return getListEntityFieldNames(schema);
  }, [data]);

  const handleNavigate = (entityListField: string) => {
    router.push(`/entities/${entityListField}`);
    onCloseMobile?.();
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6">Simfinity Entities</Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto" }}>
        {loading && (
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading schema…</Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error" variant="body2">
              Failed to load schema
            </Typography>
          </Box>
        )}
        <List>
          {entries.map((field) => {
            const selected = pathname?.startsWith(`/entities/${field}`);
            const label = resolveLabel([field], { entity: field }, field);
            return (
              <ListItemButton key={field} selected={!!selected} onClick={() => handleNavigate(field)}>
                <ListItemText primary={label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="entity folders">
      <Drawer
        variant="temporary"
        open={!!mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}


