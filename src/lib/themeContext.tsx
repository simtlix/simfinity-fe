// lib/themeContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createTheme, Theme, ThemeOptions, alpha } from "@mui/material/styles";
import "@mui/x-data-grid/themeAugmentation";

// ==================== Types ====================
export type ThemeMode = "light" | "dark" | "auto";
export type CustomTheme =
  | "default"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "mint"
  | "softBlue"
  | "softGray";

export interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  setMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  theme: Theme;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ==================== Soft theme factory (mint / softBlue / softGray) ====================
function createSoftTheme(
  variant: "mint" | "softBlue" | "softGray",
  resolvedMode: "light" | "dark"
) {
  const isDark = resolvedMode === "dark";

  const schemes = {
    mint: {
      brand: "#108775",
      brand2: "#0C6D60",
      canvasLight: "#ECF6F3",
      canvasDark: "#0F1715",
      headerLight: "#F6FBF9",
      headerDark: "#101A17",
      selectLight: "#E7F6F1",
      selectDark: "#12201C",
    },
    softBlue: {
      brand: "#1E88E5",
      brand2: "#1565C0",
      canvasLight: "#EEF5FB",
      canvasDark: "#0F131A",
      headerLight: "#F6FAFE",
      headerDark: "#0F1822",
      selectLight: "#E7F2FD",
      selectDark: "#112030",
    },
    softGray: {
      brand: "#5F6B7A",
      brand2: "#4A5563",
      canvasLight: "#F5F6F7",
      canvasDark: "#0F1113",
      headerLight: "#F8F9FA",
      headerDark: "#121417",
      selectLight: "#EEF1F4",
      selectDark: "#171B1F",
    },
  } as const;

  const s = schemes[variant];

  const t = {
    canvas: isDark ? s.canvasDark : s.canvasLight,
    surface: isDark ? "#141A1B" : "#FFFFFF",
    header: isDark ? s.headerDark : s.headerLight,
    line: isDark ? "rgba(255,255,255,0.08)" : "#E6EFEB",
    hover: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    select: isDark ? s.selectDark : s.selectLight,
    brand: s.brand,
    brand2: s.brand2,
    gray1: isDark ? "#E7ECEF" : "#0F1A1C", // text.primary
    gray2: isDark ? "#D3DADD" : "#1A2B27", // body text
    gray3: isDark ? "#9BA7AD" : "#5A6B66", // text.secondary
  };

  const base: ThemeOptions = {
    palette: {
      mode: resolvedMode,
      primary: { main: t.brand, dark: t.brand2 },
      background: { default: t.canvas, paper: t.surface },
      divider: t.line,
      text: { primary: t.gray1, secondary: t.gray3 },
      success: { main: t.brand },
    },
    shape: { borderRadius: 20 },
    typography: {
      fontFamily: [
        "Inter",
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Arial",
      ].join(","),
      h5: { fontWeight: 700 },
      button: { fontWeight: 700, textTransform: "none" },
    },
    components: {
      // ===== Inputs alignment (Select = TextField small height) =====
      MuiFormControl: {
        defaultProps: { size: "small" },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            "&.MuiInputBase-sizeSmall": { minHeight: 40 },
            "& .MuiSelect-select": { paddingTop: 8, paddingBottom: 8 },
          },
          inputSizeSmall: { paddingTop: 8, paddingBottom: 8 },
        },
      },
      MuiSelect: {
        defaultProps: { size: "small", variant: "outlined" },
        styleOverrides: {
          select: {
            paddingTop: "8px !important",
            paddingBottom: "8px !important",
          },
          outlined: { paddingRight: "40px !important" },
          iconOutlined: { right: 10 },
          nativeInput: { paddingTop: 8, paddingBottom: 8 },
        },
      },
      MuiMenuItem: {
        styleOverrides: { root: { minHeight: 36 } },
      },

      // ===== Global canvas + halo =====
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: t.canvas,
            transition: "background-color .3s ease, color .3s ease",
            backgroundImage: isDark
              ? `radial-gradient(1000px 500px at 10% -10%, ${alpha(
                  t.brand,
                  0.18
                )} 0, transparent 60%)`
              : `radial-gradient(1200px 600px at 10% -10%, ${alpha(
                  t.brand,
                  0.05
                )} 0, transparent 60%)`,
          },
        },
      },

      // ===== AppBar (translucent, legible) =====
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "saturate(120%) blur(6px)",
            backgroundColor: alpha(t.surface, 0.82),
            borderBottom: `1px solid ${t.line}`,
            transition: "background-color .3s ease, color .3s ease",
            color: t.gray1,
            "& .MuiIconButton-root, & .MuiTypography-root, & .MuiButton-root, & .MuiSvgIcon-root":
              { color: "inherit" },
          },
        },
      },

      // ===== Drawer =====
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${t.line}`,
            backgroundColor: alpha(t.surface, 0.92),
            backdropFilter: "blur(4px)",
            transition: "background-color .3s ease, color .3s ease",
          },
        },
      },

      // ===== Paper card =====
      MuiPaper: {
        defaultProps: { elevation: 2 },
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: t.surface,
            boxShadow: isDark
              ? "0 18px 40px rgba(0,0,0,.35)"
              : "0 18px 40px rgba(0,0,0,.08)",
          },
          outlined: {
            border: `1px solid ${t.line}`,
            backgroundColor: t.surface,
            boxShadow: isDark
              ? "0 18px 40px rgba(0,0,0,.35)"
              : "0 18px 40px rgba(0,0,0,.08)",
          },
        },
      },

      // ===== Buttons (outlined more visible) =====
      MuiButton: {
        defaultProps: { variant: "contained" },
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: isDark
              ? "0 12px 24px rgba(0,0,0,.36)"
              : `0 12px 24px ${alpha(t.brand, 0.18)}`,
            ":hover": {
              boxShadow: isDark
                ? "0 12px 28px rgba(0,0,0,.42)"
                : `0 12px 28px ${alpha(t.brand, 0.24)}`,
            },
          },
          outlined: {
            borderColor: alpha(t.brand, 0.35),
            color: t.brand,
            backgroundColor: t.surface,
            ":hover": {
              borderColor: alpha(t.brand, 0.5),
              backgroundColor: alpha(t.brand, 0.06),
            },
          },
        },
      },

      // ===== Inputs / labels =====
      MuiTextField: {
        defaultProps: { size: "small", fullWidth: true },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 14,
              backgroundColor: t.surface,
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { color: t.gray3, "&.Mui-focused": { color: t.gray3 } },
        },
      },
      MuiInputBase: {
        styleOverrides: { input: { color: t.gray1 } },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8, // menos redondeado
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
          },
        },
      },

      // ===== Chips =====
      MuiChip: {
        variants: [
          {
            props: { color: "success", variant: "filled" },
            style: {
              backgroundColor: isDark
                ? alpha(t.brand, 0.28)
                : alpha(t.brand, 0.14),
              color: t.brand,
              fontWeight: 700,
              borderRadius: 999,
            },
          },
          {
            props: { color: "default", variant: "filled" },
            style: {
              backgroundColor: isDark ? "rgba(255,255,255,.08)" : "#EEF2F1",
              color: isDark ? "#C7D4D0" : "#3A4B46",
              fontWeight: 700,
              borderRadius: 999,
            },
          },
        ],
      },

      // ===== Table (to match the DataGrid look) =====
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${t.line}`,
            backgroundColor: t.surface,
            boxShadow: isDark
              ? "0 18px 40px rgba(0,0,0,.35)"
              : "0 18px 40px rgba(0,0,0,.08)",
            overflow: "hidden",
            marginTop: "24px",
            marginBottom: "24px",
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            "& .MuiTableCell-root": { paddingBlock: 12 },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: t.header,
            "& .MuiTableCell-head": {
              color: t.gray1,
              fontWeight: 700,
              letterSpacing: ".2px",
              borderBottom: `1px solid ${t.line}`,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover .MuiTableCell-root": { backgroundColor: t.hover },
            "&.Mui-selected .MuiTableCell-root, &.Mui-selected:hover .MuiTableCell-root":
              { backgroundColor: `${t.select} !important` },
            transition: "background-color .15s ease",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${t.line}`, color: t.gray2 },
          sizeSmall: { paddingTop: 10, paddingBottom: 10 },
          head: { backgroundColor: t.header, fontWeight: 700, color: t.gray1 },
        },
      },

      // ===== DataGrid =====
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${t.line}`,
            borderRadius: 20,
            backgroundColor: t.surface,
            boxShadow: isDark
              ? "0 18px 40px rgba(0,0,0,.35)"
              : "0 18px 40px rgba(0,0,0,.08)",
            marginBottom: "24px",
          },
          columnHeaders: {
            backgroundColor: t.header,
            color: t.gray1,
            borderBottom: `1px solid ${t.line}`,
            minHeight: 56,
            height: 56,
            fontWeight: 700,
            letterSpacing: ".2px",
          },
          columnHeader: {
            "& .MuiDataGrid-columnSeparator": { display: "none" },
            "&.MuiDataGrid-columnHeader--sorted": { color: t.brand },
          },
          row: {
            "&:hover": { backgroundColor: t.hover },
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: `${t.select} !important`,
            },
          },
          cell: {
            borderBottom: `1px solid ${t.line}`,
            color: t.gray2,
            paddingBlock: 12,
          },
          footerContainer: {
            borderTop: `1px solid ${t.line}`,
            backgroundColor: t.header,
          },
        },
      },
    },
  };

  return createTheme(base);
}

// ==================== Classic themes (unchanged) ====================
const themeDefinitions: Record<
  Exclude<CustomTheme, "mint" | "softBlue" | "softGray">,
  ThemeOptions
> = {
  default: {
    palette: {
      primary: { main: "#1976d2", light: "#42a5f5", dark: "#1565c0" },
      secondary: { main: "#dc004e", light: "#ff5983", dark: "#9a0036" },
    },
  },
  blue: {
    palette: {
      primary: { main: "#2196f3", light: "#64b5f6", dark: "#1976d2" },
      secondary: { main: "#ff9800", light: "#ffb74d", dark: "#f57c00" },
    },
  },
  green: {
    palette: {
      primary: { main: "#4caf50", light: "#81c784", dark: "#388e3c" },
      secondary: { main: "#ff5722", light: "#ff8a65", dark: "#d84315" },
    },
  },
  purple: {
    palette: {
      primary: { main: "#9c27b0", light: "#ba68c8", dark: "#7b1fa2" },
      secondary: { main: "#ffc107", light: "#ffd54f", dark: "#ff8f00" },
    },
  },
  orange: {
    palette: {
      primary: { main: "#ff9800", light: "#ffb74d", dark: "#f57c00" },
      secondary: { main: "#2196f3", light: "#64b5f6", dark: "#1976d2" },
    },
  },
};

// ==================== Provider ====================
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [customTheme, setCustomThemeState] = useState<CustomTheme>("default");

  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    const savedCustomTheme = localStorage.getItem(
      "theme-custom"
    ) as CustomTheme;
    if (savedMode) setModeState(savedMode);
    if (savedCustomTheme) setCustomThemeState(savedCustomTheme);
  }, []);

  const actualMode = React.useMemo<"light" | "dark">(() => {
    if (mode === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return mode;
  }, [mode]);

  const theme = React.useMemo(() => {
    if (
      customTheme === "mint" ||
      customTheme === "softBlue" ||
      customTheme === "softGray"
    ) {
      return createSoftTheme(
        customTheme as "mint" | "softBlue" | "softGray",
        actualMode
      );
    }
    const baseTheme = themeDefinitions[customTheme];
    return createTheme({
      ...baseTheme,
      palette: { ...baseTheme.palette, mode: actualMode },
    });
  }, [actualMode, customTheme]);

  useEffect(() => {
    if (mode === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setModeState((prev) => prev); // force re-render
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const setCustomTheme = (newTheme: CustomTheme) => {
    setCustomThemeState(newTheme);
    localStorage.setItem("theme-custom", newTheme);
  };

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
  };

  const value: ThemeContextType = {
    mode,
    customTheme,
    setMode,
    setCustomTheme,
    theme,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ==================== Hook ====================
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}