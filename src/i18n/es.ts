import { registerFunctionLabels, type LabelValue } from "@/lib/i18n";
import { registerColumnRenderers } from "@/lib/columnRenderers";

export const labels: Record<string, LabelValue> = {
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

registerFunctionLabels("es", labels);
// Ejemplo de renderizadores personalizados (comentado)
registerColumnRenderers({
  // "Episode.name": ({ value }) => <strong>{String(value ?? "")}</strong>,
});


