"use client";

import * as React from "react";
import { useSimfinityClient } from "@simtlix/simfinity-fe-components";
import { useI18n } from "@simtlix/simfinity-fe-components";
import { Box, Divider, Drawer, List, ListItemButton, ListItemText, Toolbar, Typography } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 260;

type SidebarProps = {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const client = useSimfinityClient();
  const { resolveLabel } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const entries = React.useMemo(() => client.getListEntityNames(), [client]);

  const getEntityName = (pluralName: string, form: 'single' | 'plural'): string => {
    const entityTypeName = client.getTypeNameForQuery(pluralName);
    if (!entityTypeName) return `entity.${pluralName}.${form}`;
    return `entity.${entityTypeName.toLowerCase()}.${form}`;
  };

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
        <List>
          {entries.map((field) => {
            const selected = pathname?.startsWith(`/entities/${field}`);
            const label = resolveLabel([getEntityName(field, 'plural')], { entity: field }, field);
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
