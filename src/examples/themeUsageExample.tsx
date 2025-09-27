/**
 * Theme Usage Examples
 * 
 * This file demonstrates how to use the theming system in the Simfinity frontend application.
 * The theming system provides dynamic theme switching with multiple color schemes and modes.
 */

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Card, 
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { useTheme } from '@/lib/themeContext';

// Example component showing how to use the theme context
export function ThemeUsageExample() {
  const { mode, customTheme, setMode, setCustomTheme, toggleMode } = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Theme System Demo
      </Typography>
      
      <Stack spacing={3}>
        {/* Current Theme Info */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Theme
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mode: {mode}
                  </Typography>
                  <Chip 
                    label={mode} 
                    color={mode === 'dark' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Color Scheme: {customTheme}
                  </Typography>
                  <Chip 
                    label={customTheme} 
                    color="primary"
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Theme Controls */}
          <Card sx={{ flex: 1, minWidth: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Theme Controls
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  onClick={toggleMode}
                  fullWidth
                >
                  Toggle Mode (Light/Dark)
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={() => setMode('auto')}
                  fullWidth
                >
                  Set Auto Mode
                </Button>
                
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Color Themes:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(['default', 'blue', 'green', 'purple', 'orange'] as const).map((theme) => (
                      <Button
                        key={theme}
                        size="small"
                        variant={customTheme === theme ? 'contained' : 'outlined'}
                        onClick={() => setCustomTheme(theme)}
                      >
                        {theme}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Theme Preview */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Theme Preview
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Primary</Typography>
                <Typography variant="body2">
                  This card uses the primary color from the current theme.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Secondary</Typography>
                <Typography variant="body2">
                  This card uses the secondary color from the current theme.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Background</Typography>
                <Typography variant="body2">
                  This card uses the background color from the current theme.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'text.primary', color: 'background.paper', minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Text</Typography>
                <Typography variant="body2">
                  This card uses the text color from the current theme.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

// Example of how to create custom themed components
export function CustomThemedComponent() {
  const { theme } = useTheme();
  
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        // You can access theme values directly
        boxShadow: theme.shadows[2],
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
          transition: theme.transitions.create(['box-shadow', 'transform']),
        },
      }}
    >
      <Typography variant="h6" color="primary.main">
        Custom Themed Component
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This component uses theme values directly and responds to theme changes.
      </Typography>
    </Box>
  );
}


export default ThemeUsageExample;
