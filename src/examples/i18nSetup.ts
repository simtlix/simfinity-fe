import { registerFunctionLabels, type LabelValue } from "@/lib/i18n";

// English labels
const enLabels: Record<string, LabelValue> = {
  // Sidebar entities
  // "series": "TV Series",

  // Columns per entity.field
  // "serie.name": "Title",
  // "season.year": (ctx) => `Year (${ctx.entity})`,
};

// Spanish labels
const esLabels: Record<string, LabelValue> = {
  // Ejemplos de etiquetas en español
  // Entidades (menú)
  // "series": "Series",
  // "seasons": "Temporadas",
  // "episodes": "Episodios",
  // "stars": "Actores",

  // Columnas (entity.field)
  // "serie.name": "Título",
  // "serie.categories": "Categorías",
  // "season.number": "N°",
  // "season.year": "Año",
  // "episode.number": "N°",
  // "episode.name": "Nombre",
  // "episode.date": "Fecha",
  // "star.name": "Nombre",
};

// Setup function to register all i18n configurations
export const setupI18n = () => {
  // Register labels for both languages
  registerFunctionLabels("en", enLabels);
  registerFunctionLabels("es", esLabels);
};
