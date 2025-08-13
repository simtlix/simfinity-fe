import * as React from "react";

export type ColumnRenderContext<Row = Record<string, unknown>> = {
  entity: string;            // GraphQL type name (e.g., Episode)
  field: string;             // field/column name (e.g., name)
  row: Row;                  // entire row as returned by the query
  value: unknown;            // value resolved for the field
  // Original grid params if caller wants to access API details
  gridParams?: unknown;
};

export type ColumnRenderer<Row = Record<string, unknown>> = (
  ctx: ColumnRenderContext<Row>
) => React.ReactNode;

class ColumnRendererRegistry {
  private registry: Map<string, ColumnRenderer> = new Map();

  // Register a single renderer
  register(key: string, renderer: ColumnRenderer): void {
    const k = key.toLowerCase();
    this.registry.set(k, renderer);
    if (process.env.NODE_ENV !== 'production') {
      // Debug: show registration key
      // eslint-disable-next-line no-console
      console.debug('[columnRenderers] register', { key, normalizedKey: k });
    }
  }

  // Resolve by exact key
  get(key: string): ColumnRenderer | undefined {
    const k = key.toLowerCase();
    const r = this.registry.get(k);
    if (process.env.NODE_ENV !== 'production') {
      // Debug: show lookup attempt and hit/miss
      // eslint-disable-next-line no-console
      console.debug('[columnRenderers] resolve', { key, normalizedKey: k, hit: !!r });
    }
    return r;
  }

  clear(): void {
    this.registry.clear();
  }
}

export const columnRendererRegistry = new ColumnRendererRegistry();

// Simple helpers
export function registerColumnRenderer(key: string, renderer: ColumnRenderer): void {
  columnRendererRegistry.register(key, renderer);
}

export function resolveColumnRenderer(key: string): ColumnRenderer | undefined {
  return columnRendererRegistry.get(key);
}


