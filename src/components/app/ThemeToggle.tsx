"use client";

import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AutoMode as AutoModeIcon,
  ColorLens as ColorLensIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useTheme, ThemeMode, CustomTheme } from '@/lib/themeContext';

const themeModeOptions = [
  { value: 'light' as ThemeMode, label: 'Light', icon: LightModeIcon },
  { value: 'dark' as ThemeMode, label: 'Dark', icon: DarkModeIcon },
  { value: 'auto' as ThemeMode, label: 'Auto', icon: AutoModeIcon },
];

const customThemeOptions = [
    { value: 'default'  as CustomTheme, label: 'Default',   color: '#1976d2' },
    { value: 'blue'     as CustomTheme, label: 'Blue',      color: '#2196f3' },
    { value: 'green'    as CustomTheme, label: 'Green',     color: '#4caf50' },
    { value: 'purple'   as CustomTheme, label: 'Purple',    color: '#9c27b0' },
    { value: 'orange'   as CustomTheme, label: 'Orange',    color: '#ff9800' },
  
    // 👇 Nuevos "soft" con el look mint pero otras paletas
    { value: 'mint'     as CustomTheme, label: 'Mint',      color: '#108775' },
    { value: 'softBlue' as CustomTheme, label: 'Soft Blue', color: '#1E88E5' },
    { value: 'softGray' as CustomTheme, label: 'Soft Gray', color: '#5F6B7A' },
    { value: 'banking'  as CustomTheme, label: 'Banking',   color: '#6B2DA8' },
  ];

export default function ThemeToggle() {
  const { mode, customTheme, setMode, setCustomTheme } = useTheme();
  const [modeAnchorEl, setModeAnchorEl] = React.useState<null | HTMLElement>(null);
  const [colorAnchorEl, setColorAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleModeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setModeAnchorEl(event.currentTarget);
  };

  const handleColorMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setModeAnchorEl(null);
    setColorAnchorEl(null);
  };

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    handleMenuClose();
  };

  const handleColorChange = (newColor: CustomTheme) => {
    setCustomTheme(newColor);
    handleMenuClose();
  };

  const currentModeOption = themeModeOptions.find(option => option.value === mode);
  const currentColorOption = customThemeOptions.find(option => option.value === customTheme);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Theme Mode Toggle */}
      <Tooltip title="Theme Mode">
        <IconButton
          color="default"               // ⬅️ antes: "inherit"
          onClick={handleModeMenuOpen}
          size="small"
          sx={{ color: 'text.primary' }} // ⬅️ asegura contraste con AppBar claro
        >
          {currentModeOption?.icon && <currentModeOption.icon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={modeAnchorEl}
        open={Boolean(modeAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { color: 'text.primary' } } }} // ⬅️ legible
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" color="text.secondary">
            Theme Mode
          </Typography>
        </MenuItem>
        {themeModeOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleModeChange(option.value)}
            selected={mode === option.value}
          >
            <ListItemIcon>
              <option.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={option.label} />
            {mode === option.value && <CheckIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>

      {/* Color Theme Toggle */}
      <Tooltip title="Color Theme">
        <IconButton
          color="default"               // ⬅️ antes: "inherit"
          onClick={handleColorMenuOpen}
          size="small"
          sx={{ color: 'text.primary' }} // ⬅️ asegura contraste
        >
          <ColorLensIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={colorAnchorEl}
        open={Boolean(colorAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { color: 'text.primary' } } }} // ⬅️ legible
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" color="text.secondary">
            Color Theme
          </Typography>
        </MenuItem>
        {customThemeOptions.map((option) => (
        <MenuItem
            key={option.value}
            onClick={() => handleColorChange(option.value)}
            selected={customTheme === option.value}
        >
            <Box
            sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: option.color,
                mr: 1.25,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1,
            }}
            />
            <ListItemText primary={option.label} />
            {customTheme === option.value && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
        ))}
      </Menu>

      {/* Current Theme Indicator */}
      <Chip
        size="small"
        label={`${currentModeOption?.label} • ${currentColorOption?.label}`}
        variant="outlined"
        sx={{
          color: 'text.primary',       // ⬅️ texto legible
          borderColor: 'divider',
          bgcolor: 'action.hover',     // ⬅️ fondo suave para contraste
          '& .MuiChip-label': { fontSize: '0.75rem' },
        }}
      />
    </Box>
  );
};