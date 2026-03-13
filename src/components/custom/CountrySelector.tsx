import * as React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'ES', name: 'Spain' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'CL', name: 'Chile' },
  { code: 'BR', name: 'Brazil' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'DE', name: 'Germany' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
];

export const CountrySelector = ({ value, onChange, disabled, error }: CountrySelectorProps) => {
  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      <InputLabel id="country-select-label">Country</InputLabel>
      <Select
        labelId="country-select-label"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        variant="filled"
        sx={{
          '& .MuiFilledInput-root': {
            backgroundColor: '#fafafa',
            '&:hover': { backgroundColor: '#f5f5f5' },
            '&.Mui-focused': { backgroundColor: '#ffffff' }
          }
        }}
      >
        {countries.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{country.name}</Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ backgroundColor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem' }}
              >
                {country.code}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
