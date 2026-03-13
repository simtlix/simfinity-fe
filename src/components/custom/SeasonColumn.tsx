import * as React from 'react';

export interface SeasonColumnProps {
  value: string | number | null | undefined;
}

export const SeasonColumn = ({ value }: SeasonColumnProps) => {
  if (value == null) return null;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      Season {String(value)}
    </span>
  );
};
