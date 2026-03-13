import { setupEpisodeCustomization } from "./episode";
import { setupSerieFormCustomization } from "./serie";
import { setupI18n } from "./i18n";
import { setupSeasonStateMachine } from "./season";

export const setupSimfinity = () => {
  setupI18n();
  setupEpisodeCustomization();
  setupSerieFormCustomization();
  setupSeasonStateMachine();
};
