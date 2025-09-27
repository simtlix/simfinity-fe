import { setupEpisodeFormCustomization } from "./episodeFormCustomization";
import { setupSerieFormCustomization } from "./serieFormCustomization";
import { setupI18n } from "./i18nSetup";
import { setupColumnRenderers } from "./columnRenderersSetup";
import { setupSeasonStateMachine } from "./seasonStateMachineExample";

// Note: Theme configuration is now handled by the ThemeProvider in src/lib/themeContext.tsx
// This allows for dynamic theme switching and multiple theme options.

// Setup all configurations
export const setupConfigurations = () => {
  // Setup i18n labels
  setupI18n();
  
  // Setup custom column renderers
  setupColumnRenderers();
  
  // Setup form customizations
  setupEpisodeFormCustomization();
  setupSerieFormCustomization();
  
  // Setup state machines
  setupSeasonStateMachine();
};
