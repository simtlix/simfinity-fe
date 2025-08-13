import { registerFunctionLabels, type LabelValue } from "@/lib/i18n";
import { registerColumnRenderer } from "@/lib/columnRenderers";

export const labels: Record<string, LabelValue> = {
  // Sidebar entities
  // "series": "TV Series",

  // Columns per entity.field
  // "serie.name": "Title",
  // "season.year": (ctx) => `Year (${ctx.entity})`,
};

// Register on load (safe if imported in client only)
registerFunctionLabels("en", labels);
// Example: register custom column renderers (commented; adapt as needed)
// Lowercase key to match label style; registry normalizes to lowercase
registerColumnRenderer("episode.date", ({ value }) => {
  if (value == null) return "";
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
});


