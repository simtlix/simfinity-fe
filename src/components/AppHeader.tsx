"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { useI18n } from "@/lib/i18n";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

type AppHeaderProps = {
  onMenuClick?: () => void;
};

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { locale, setLocale } = useI18n();
  const handleLocale = (e: SelectChangeEvent<string>) => setLocale(e.target.value);
  return (
    <AppBar position="fixed" color="primary" enableColorOnDark>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Simfinity Admin
        </Typography>
        <Box sx={{ minWidth: 120 }}>
          <FormControl variant="standard" size="small" sx={{ minWidth: 100 }}>
            <InputLabel sx={{ color: "inherit" }}>Lang</InputLabel>
            <Select
              value={locale}
              onChange={handleLocale}
              label="Lang"
              sx={{ color: "inherit", borderColor: "inherit" }}>
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="es">ES</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Toolbar>
    </AppBar>
  );
}


