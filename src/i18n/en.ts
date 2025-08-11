import { registerFunctionLabels, type LabelValue } from "@/lib/i18n";

export const labels: Record<string, LabelValue> = {
  // Sidebar entities
  // "series": "TV Series",

  // Columns per entity.field
  // "serie.name": "Title",
  // "season.year": (ctx) => `Year (${ctx.entity})`,
};

// Register on load (safe if imported in client only)
registerFunctionLabels("en", labels);


