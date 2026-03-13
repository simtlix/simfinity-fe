import * as React from 'react';
import { registerColumnRenderer } from '@simtlix/simfinity-fe-components';
import { SeasonColumn } from '@/components/custom';

export function registerEpisodeSeasonColumn() {
  registerColumnRenderer('episode.season', ({ value }) => (
    <SeasonColumn value={value as string | number | null | undefined} />
  ));
}
