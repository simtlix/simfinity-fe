import * as React from 'react';
import { registerColumnRenderer } from '@simtlix/simfinity-fe-components';
import { DateColumn } from '@/components/custom';

export function registerEpisodeDateColumn() {
  registerColumnRenderer('episode.date', ({ value }) => (
    <DateColumn value={value as string | number | null | undefined} />
  ));
}
