"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { useI18n } from "@simtlix/simfinity-fe-components";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import ThemeToggle from "./ThemeToggle";

type AppHeaderProps = {
  onMenuClick?: () => void;
};

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { locale, setLocale } = useI18n();
  const handleLocale = (e: SelectChangeEvent<string>) => setLocale(e.target.value);
  return (
    <AppBar position="fixed"  enableColorOnDark>
      <Toolbar sx={{ color: 'text.primary' }}>
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
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Language Selector */}
        <Box sx={{ minWidth: 120, ml: 2 }}>
          <FormControl variant="standard" size="small" sx={{
            minWidth: 100,
            color: 'text.primary',
            '& .MuiInputBase-input': { color: 'text.primary' },
            '& .MuiSvgIcon-root': { color: 'text.secondary' },
            '& .MuiInput-underline:before': { borderBottomColor: 'divider' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'divider' },
            '& .MuiInput-underline:after': { borderBottomColor: 'primary.main' },
          }}>
            <InputLabel
              sx={{
                color: 'text.secondary',
                '&.Mui-focused': { color: 'text.secondary' }
              }}
            >
              Lang
            </InputLabel>
            <Select
              value={locale}
              onChange={handleLocale}
              label="Lang"
              sx={{ color: 'text.primary' }}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="es">ES</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Toolbar>
    </AppBar>
  );
}


