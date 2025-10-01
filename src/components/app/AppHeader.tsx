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
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 108 }}
          >
            <InputLabel
              id="lang-label"
              sx={{
                color: 'text.secondary',
                '&.Mui-focused': { color: 'text.secondary' },
              }}
            >
              Lang
            </InputLabel>

            <Select
              labelId="lang-label"
              label="Lang"
              value={locale}
              onChange={handleLocale}
              sx={{
                // “píldora” + contraste en AppBar
                borderRadius: '999px',
                bgcolor: 'background.paper',
                color: 'text.primary',
                // borde suave en reposo/hover/focus
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) =>
                    `0 0 0 3px ${theme.palette.action.focusOpacity ? 
                      `rgba(33, 150, 243, ${theme.palette.action.focusOpacity})` : 
                      'rgba(0,0,0,0.06)'}`,
                },
                // densidad alineada con TextField small
                '& .MuiSelect-select': { pt: '8px', pb: '8px' },
                pr: 1.5,
              }}
              MenuProps={{
                PaperProps: {
                  sx: { borderRadius: 0.5 },
                },
              }}
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


