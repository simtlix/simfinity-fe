"use client";

import * as React from "react";

export type LabelContext = { entity: string; field?: string };
export type LabelValue = string | ((ctx: LabelContext) => string);

type I18nContextValue = {
  locale: string;
  setLocale: (loc: string) => void;
  resolveLabel: (keys: string[], ctx: LabelContext, fallback: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const defaultLocale = (typeof window !== "undefined" && (navigator.language?.split("-")[0] || "en")) || process.env.NEXT_PUBLIC_LOCALE || "en";
  const [locale, setLocale] = React.useState<string>(String(process.env.NEXT_PUBLIC_LOCALE || defaultLocale || "en"));
  const [stringLabels, setStringLabels] = React.useState<Record<string, string>>({});
  const [funcLabels, setFuncLabels] = React.useState<Record<string, LabelValue>>({});

  // Global registry for function-based labels (per-locale)
  // External code can call registerFunctionLabels to populate this registry before usage
  const registryRef = React.useRef<Map<string, Record<string, LabelValue>>>(new Map());

  React.useEffect(() => {
    let cancelled = false;
    // Load JSON labels from public folder
    fetch(`/i18n/${locale}.json`)
      .then(async (res) => (res.ok ? res.json() : {}))
      .then((json) => {
        if (!cancelled && json && typeof json === "object") setStringLabels(json as Record<string, string>);
      })
      .catch(() => {
        if (!cancelled) setStringLabels({});
      });

    // Pull function-based labels from the registry for current locale
    const reg = registryRef.current.get(locale) ?? {};
    if (!cancelled) setFuncLabels(reg);

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const resolveLabel = React.useCallback(
    (keys: string[], ctx: LabelContext, fallback: string): string => {
      for (const key of keys) {
        const fv = funcLabels[key];
        if (typeof fv === "function") return fv(ctx);
        if (typeof fv === "string") return fv;
        const sv = stringLabels[key];
        if (typeof sv === "string") return sv;
      }
      return fallback;
    },
    [funcLabels, stringLabels]
  );

  const value: I18nContextValue = React.useMemo(() => ({ locale, setLocale, resolveLabel }), [locale, setLocale, resolveLabel]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Registration API for function-based labels, to avoid coupling provider to specific files
export function registerFunctionLabels(locale: string, labels: Record<string, LabelValue>) {
  // This module may be imported multiple times across environments; attach to globalThis to persist
  const key = "__simfinity_i18n_registry__";
  const globalRegistry = (globalThis as unknown as { [k: string]: unknown })[key] as Map<string, Record<string, LabelValue>> | undefined;
  const registry: Map<string, Record<string, LabelValue>> = globalRegistry ?? new Map();
  const existing = registry.get(locale) ?? {};
  registry.set(locale, { ...existing, ...labels });
  (globalThis as unknown as { [k: string]: unknown })[key] = registry;
}



