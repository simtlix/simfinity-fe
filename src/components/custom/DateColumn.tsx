import * as React from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export interface DateColumnProps {
  value: string | number | null | undefined;
}

export const DateColumn = ({ value }: DateColumnProps) => {
  if (value == null) return null;
  const d = new Date(value);
  const text = isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <CalendarMonthIcon fontSize="small" />
      {text}
    </span>
  );
};
