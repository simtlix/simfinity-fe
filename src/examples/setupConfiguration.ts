import { createTheme } from "@mui/material";
import { setupEpisodeFormCustomization } from "./episodeFormCustomization";
import { setupSerieFormCustomization } from "./serieFormCustomization";
import { setupI18n } from "./i18nSetup";
import { setupColumnRenderers } from "./columnRenderersSetup";
import { setupSeasonStateMachine } from "./seasonStateMachineExample";

// Create the MUI theme configuration
export const theme = createTheme({
  palette: { mode: "light" },
});

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
