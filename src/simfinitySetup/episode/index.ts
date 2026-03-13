import { registerEpisodeCreateCustomization } from './episode.create';
import { registerEpisodeEditCustomization } from './episode.edit';
import { registerEpisodeDateColumn } from './episode.column.date';
import { registerEpisodeSeasonColumn } from './episode.column.season';

export function setupEpisodeCustomization() {
  registerEpisodeCreateCustomization();
  registerEpisodeEditCustomization();
  registerEpisodeDateColumn();
  registerEpisodeSeasonColumn();
}
