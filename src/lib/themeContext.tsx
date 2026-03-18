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
  | "softGray"
  | "banking";

export interface ThemeContextType {
  mode: ThemeMode;
  customTheme: CustomTheme;
  setMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  theme: Theme;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ==================== Shared component overrides ====================
const getSharedStepperOverrides = (primaryColor: string) => ({
  MuiStepper: {
    styleOverrides: {
      root: {
        marginTop: '20px',
        width: 'max-content',
      },
    },
  },
  MuiStep: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        '&.MuiStep-horizontal': {
          padding: '9px 0 15px 20px',
          marginLeft: 0,
          '& .MuiStepLabel-root': {
            textWrap: 'nowrap',
          },
        },
        '& .Mui-disabled': {
          opacity: 0.8,
        },
      },
    },
  },
  MuiStepButton: {
    styleOverrides: {
      root: {
        '&.Mui-active': {
          backgroundColor: alpha(primaryColor, 0.08),
          borderRadius: '12px',
        },
        '.MuiStepper-vertical &': {
          '& span': {
            padding: '0 5px',
          },
          '& .MuiStepLabel-label': {
            width: '152px',
          },
        },
      },
    },
  },
  MuiStepLabel: {
    styleOverrides: {
      root: {
        cursor: 'pointer',
      },
      label: {
        fontFamily: 'Nunito, system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
        lineHeight: '16px',
        fontWeight: 700,
        color: '#ababab',
        '&.Mui-active': {
          color: primaryColor,
        },
        '&.Mui-completed': {
          color: primaryColor,
          opacity: 0.6,
        },
      },
    },
  },
  MuiStepIcon: {
    styleOverrides: {
      root: {
        fill: '#9a9da9',
        '.Mui-active &': {
          fill: primaryColor,
        },
      },
      text: {
        fontFamily: 'Nunito, system-ui, -apple-system, Segoe UI, Roboto, Arial',
        fontSize: '14px',
      },
    },
  },
  MuiStepConnector: {
    styleOverrides: {
      root: {
        minHeight: '16px',
      },
      line: {
        minHeight: '16px',
      },
      lineHorizontal: {
        display: 'block',
        borderColor: '#bdbdbd',
        borderLeftStyle: 'solid' as const,
        borderLeftWidth: '1px',
        margin: '0 12px',
        minHeight: '16px',
        borderTopWidth: '0px !important',
      },
      lineVertical: {
        visibility: 'hidden' as const,
        minHeight: 0,
      },
    },
  },
});

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
      h5: { fontWeight: 700, fontSize: "2.5rem" },
      button: { fontWeight: 700, textTransform: "none" },
    },
    components: {
      // ===== Inputs (Reddit-style filled) =====
      MuiFormControl: {
        defaultProps: { size: "small", variant: "filled" as const },
      },
      MuiFilledInput: {
        defaultProps: { disableUnderline: true },
        styleOverrides: {
          root: {
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid",
            borderColor: t.line,
            backgroundColor: t.surface,
            transition: "border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&.Mui-focused": {
              backgroundColor: "transparent",
              boxShadow: `${alpha(t.brand, 0.25)} 0 0 0 2px`,
              borderColor: t.brand,
            },
            "&.MuiInputBase-sizeSmall": { minHeight: 40 },
          },
          input: {
            paddingTop: 22,
            paddingBottom: 6,
            "&.MuiInputBase-inputSizeSmall": {
              paddingTop: 22,
              paddingBottom: 6,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid",
            borderColor: t.line,
            backgroundColor: t.surface,
            transition: "border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&.Mui-focused": {
              backgroundColor: "transparent",
              boxShadow: `${alpha(t.brand, 0.25)} 0 0 0 2px`,
              borderColor: t.brand,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: { size: "small", variant: "filled" as const },
        styleOverrides: {
          select: {
            paddingTop: "22px !important",
            paddingBottom: "6px !important",
          },
          filled: { paddingRight: "40px !important" },
          iconFilled: { right: 10 },
          nativeInput: { paddingTop: 22, paddingBottom: 6 },
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
        defaultProps: { size: "small", fullWidth: true, variant: "filled" as const },
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

      // ===== TablePagination (standalone, e.g. EntityCardList) =====
      MuiTablePagination: {
        styleOverrides: {
          select: {
            paddingTop: "4px !important",
            paddingBottom: "4px !important",
            display: "flex",
            alignItems: "center",
          },
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
            '& .MuiTablePagination-select.MuiSelect-select': {
              paddingTop: '4px !important',
              paddingBottom: '4px !important',
            },
          },
        },
      },
      // Merge shared Stepper overrides
      ...getSharedStepperOverrides(t.brand),
    },
  };

  return createTheme(base);
}

// ==================== Banking theme (minimal, professional) ====================
function createBankingTheme(resolvedMode: "light" | "dark") {
  const isDark = resolvedMode === "dark";

  const colors = {
    brand: "#260A2F",
    brand2: "#1A0621",
    canvasLight: "#F5F5F5",
    canvasDark: "#1A0F24",
    surfaceLight: "#FFFFFF",
    surfaceDark: "#2D1B4E",
    headerLight: "#FFFFFF",
    headerDark: "#2D1B4E",
    lineLight: "#E0E0E0",
    lineDark: "rgba(255,255,255,0.12)",
    hoverLight: "rgba(0,0,0,0.04)",
    hoverDark: "rgba(255,255,255,0.05)",
    selectLight: "#F3E5F5",
    selectDark: "#3A2558",
    gray1: isDark ? "#F5F5F5" : "#212121", // text.primary
    gray2: isDark ? "#E0E0E0" : "#424242", // body text
    gray3: isDark ? "#BDBDBD" : "#757575", // text.secondary
  };

  const base: ThemeOptions = {
    palette: {
      mode: resolvedMode,
      primary: { main: colors.brand, dark: colors.brand2 },
      background: {
        default: isDark ? colors.canvasDark : colors.canvasLight,
        paper: isDark ? colors.surfaceDark : colors.surfaceLight,
      },
      divider: isDark ? colors.lineDark : colors.lineLight,
      text: { primary: colors.gray1, secondary: colors.gray3 },
      success: { main: colors.brand },
    },
    shape: { borderRadius: 8 }, // Sharper corners like banking apps
    typography: {
      fontFamily: [
        "Nunito",
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Arial",
      ].join(","),
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700, fontSize: "2.5rem" },
      button: { fontWeight: 600, textTransform: "none" },
    },
    components: {
      // ===== Inputs (Reddit-style filled) =====
      MuiFormControl: {
        defaultProps: { size: "small", variant: "filled" as const },
      },
      MuiFilledInput: {
        defaultProps: { disableUnderline: true },
        styleOverrides: {
          root: {
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid",
            borderColor: isDark ? colors.lineDark : colors.lineLight,
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            fontSize: "16px",
            transition: "border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&.Mui-focused": {
              backgroundColor: "transparent",
              boxShadow: `${alpha(colors.brand, 0.25)} 0 0 0 2px`,
              borderColor: colors.brand,
            },
            "&.MuiInputBase-sizeSmall": { minHeight: 48 },
          },
          input: {
            fontSize: "16px",
            paddingTop: 22,
            paddingBottom: 6,
            "&.MuiInputBase-inputSizeSmall": {
              paddingTop: 22,
              paddingBottom: 6,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid",
            borderColor: isDark ? colors.lineDark : colors.lineLight,
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            transition: "border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&.Mui-focused": {
              backgroundColor: "transparent",
              boxShadow: `${alpha(colors.brand, 0.25)} 0 0 0 2px`,
              borderColor: colors.brand,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: { size: "small", variant: "filled" as const },
        styleOverrides: {
          select: {
            fontSize: "16px",
            paddingTop: "22px !important",
            paddingBottom: "6px !important",
          },
          filled: { paddingRight: "40px !important" },
          iconFilled: { right: 10 },
          nativeInput: { paddingTop: 22, paddingBottom: 6 },
        },
      },
      MuiMenuItem: {
        styleOverrides: { 
          root: { 
            minHeight: 48,
            fontSize: "16px",
          } 
        },
      },

      // ===== Clean background (no gradient) =====
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? colors.canvasDark : colors.canvasLight,
            transition: "background-color .2s ease, color .2s ease",
            fontFamily: "Nunito, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          },
        },
      },

      // ===== Minimal AppBar =====
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? colors.headerDark : colors.headerLight,
            borderBottom: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            boxShadow: "none", // No shadow for cleaner look
            transition: "background-color .2s ease",
            color: colors.gray1,
            "& .MuiIconButton-root, & .MuiTypography-root, & .MuiButton-root, & .MuiSvgIcon-root":
              { color: "inherit" },
          },
        },
      },

      // ===== Minimal Drawer =====
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            boxShadow: "none",
            transition: "background-color .2s ease",
          },
        },
      },

      // ===== Paper with subtle shadow =====
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            boxShadow: isDark
              ? "0 2px 8px rgba(0,0,0,.2)"
              : "0 2px 8px rgba(0,0,0,.08)",
          },
          outlined: {
            border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            boxShadow: "none",
          },
        },
      },

      // ===== Minimal buttons =====
      MuiButton: {
        defaultProps: { variant: "contained" },
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            ":hover": {
              boxShadow: isDark
                ? "0 4px 12px rgba(0,0,0,.3)"
                : "0 4px 12px rgba(38,10,47,.2)",
            },
          },
          outlined: {
            borderColor: alpha(colors.brand, 0.5),
            color: colors.brand,
            backgroundColor: "transparent",
            ":hover": {
              borderColor: colors.brand,
              backgroundColor: alpha(colors.brand, 0.08),
            },
          },
        },
      },

      // ===== Clean inputs =====
      MuiTextField: {
        defaultProps: { size: "small", fullWidth: true, variant: "filled" as const },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { 
            color: colors.gray3,
            fontSize: "16px",
            "&.Mui-focused": { color: colors.gray3 } 
          },
        },
      },
      MuiInputBase: {
        styleOverrides: { 
          input: { 
            color: colors.gray1,
            fontSize: "16px",
          } 
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
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

      // ===== Minimal chips =====
      MuiChip: {
        variants: [
          {
            props: { color: "success", variant: "filled" },
            style: {
              backgroundColor: isDark
                ? alpha(colors.brand, 0.3)
                : alpha(colors.brand, 0.12),
              color: colors.brand,
              fontWeight: 600,
              borderRadius: 6,
            },
          },
          {
            props: { color: "default", variant: "filled" },
            style: {
              backgroundColor: isDark ? "rgba(255,255,255,.1)" : "#F5F5F5",
              color: isDark ? "#E0E0E0" : "#424242",
              fontWeight: 600,
              borderRadius: 6,
            },
          },
        ],
      },

      // ===== Clean table (minimal design) =====
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            boxShadow: "none",
            overflow: "hidden",
            marginTop: "16px",
            marginBottom: "0px",
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            "& .MuiTableCell-root": { paddingBlock: 12 },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? colors.surfaceDark : "#FFFFFF",
            "& .MuiTableCell-head": {
              color: colors.gray1,
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: ".02em",
              borderBottom: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            // Alternating row colors (zebra striping)
            "&:nth-of-type(even) .MuiTableCell-root": {
              backgroundColor: isDark ? "rgba(255,255,255,.02)" : "#F9F9F9",
            },
            "&:hover .MuiTableCell-root": {
              backgroundColor: isDark ? colors.hoverDark : colors.hoverLight,
            },
            "&.Mui-selected .MuiTableCell-root, &.Mui-selected:hover .MuiTableCell-root":
              {
                backgroundColor: `${isDark ? colors.selectDark : colors.selectLight} !important`,
              },
            transition: "background-color .1s ease",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            color: colors.gray2,
            fontSize: "16px",
            verticalAlign: "middle",
          },
          sizeSmall: { paddingTop: 10, paddingBottom: 10 },
          head: {
            backgroundColor: isDark ? colors.surfaceDark : "#FFFFFF",
            fontWeight: 700,
            color: colors.gray1,
            fontSize: "16px",
            verticalAlign: "middle",
          },
        },
      },

      // ===== TablePagination (standalone, e.g. EntityCardList) =====
      MuiTablePagination: {
        styleOverrides: {
          select: {
            paddingTop: "4px !important",
            paddingBottom: "4px !important",
            display: "flex",
            alignItems: "center",
          },
        },
      },

      // ===== Clean DataGrid =====
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            borderRadius: 8,
            backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
            boxShadow: "none",
            marginBottom: "0px",
            "--DataGrid-containerBackground": isDark ? colors.surfaceDark : "#FFFFFF",
            "--DataGrid-t-header-background-base": isDark ? colors.surfaceDark : "#FFFFFF",
            "--unstable_DataGrid-headWeight": "700",
            ".MuiDataGrid-filler": {
              backgroundColor: `${isDark ? colors.surfaceDark : "#FFFFFF"} !important`,
            },
          },
          columnHeaders: {
            backgroundColor: `${isDark ? colors.surfaceDark : "#FFFFFF"} !important`,
            color: colors.gray1,
            borderBottom: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            minHeight: 48,
            height: 48,
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: ".02em",
          },
          columnHeader: {
            backgroundColor: `${isDark ? colors.surfaceDark : "#FFFFFF"} !important`,
            "& .MuiDataGrid-columnSeparator": { display: "none" },
            "&.MuiDataGrid-columnHeader--sorted": { color: colors.brand },
            ".MuiDataGrid-filler": {
              backgroundColor: `${isDark ? colors.surfaceDark : "#FFFFFF"} !important`,
            },
          },
          row: {
            // Alternating row colors (zebra striping)
            "&:nth-of-type(odd)": {
              backgroundColor: isDark ? "rgba(255,255,255,.02)" : "rgba(245,245,245,.4)",
            },
            "&:hover": {
              backgroundColor: isDark ? colors.hoverDark : colors.hoverLight,
            },
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: `${isDark ? colors.selectDark : colors.selectLight} !important`,
            },
          },
          cell: {
            borderBottom: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            color: colors.gray2,
            paddingBlock: 12,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
          },
          filler: {
            backgroundColor: `${isDark ? colors.surfaceDark : "#FFFFFF"} !important`,
          },
          footerContainer: {
            borderTop: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`,
            backgroundColor: isDark ? "rgba(255,255,255,.03)" : "#F5F5F5",
            '& .MuiTablePagination-select.MuiSelect-select': {
              paddingTop: '4px !important',
              paddingBottom: '4px !important',
            },
          },
        },
      },
      // Merge shared Stepper overrides
      ...getSharedStepperOverrides(colors.brand),
    },
  };

  return createTheme(base);
}

// ==================== Classic themes (unchanged) ====================
const themeDefinitions: Record<
  Exclude<CustomTheme, "mint" | "softBlue" | "softGray" | "banking">,
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
function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("theme-mode") as ThemeMode) || "light";
}

function readStoredTheme(): CustomTheme {
  if (typeof window === "undefined") return "default";
  return (localStorage.getItem("theme-custom") as CustomTheme) || "default";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [customTheme, setCustomThemeState] = useState<CustomTheme>(readStoredTheme);

  const actualMode = React.useMemo<"light" | "dark">(() => {
    if (mode === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return mode;
  }, [mode]);

  const theme = React.useMemo(() => {
    if (customTheme === "banking") {
      return createBankingTheme(actualMode);
    }
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
    const primaryColor = 
      typeof baseTheme.palette?.primary === 'object' && 
      'main' in baseTheme.palette.primary 
        ? baseTheme.palette.primary.main 
        : "#1976d2";
    const dividerColor = actualMode === "dark" ? "rgba(255,255,255,0.12)" : "#E0E0E0";
    const surfaceColor = actualMode === "dark" ? "#1e1e1e" : "#fff";
    return createTheme({
      ...baseTheme,
      palette: { ...baseTheme.palette, mode: actualMode },
      components: {
        ...baseTheme.components,
        MuiTextField: {
          defaultProps: { variant: "filled" as const, size: "small", fullWidth: true },
        },
        MuiFilledInput: {
          defaultProps: { disableUnderline: true },
          styleOverrides: {
            root: {
              overflow: "hidden",
              borderRadius: 4,
              border: "1px solid",
              borderColor: dividerColor,
              backgroundColor: surfaceColor,
              transition: "border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
              "&:hover": {
                backgroundColor: "transparent",
              },
              "&.Mui-focused": {
                backgroundColor: "transparent",
                boxShadow: `${alpha(primaryColor, 0.25)} 0 0 0 2px`,
                borderColor: primaryColor,
              },
            },
            input: {
              paddingTop: 22,
              paddingBottom: 6,
              "&.MuiInputBase-inputSizeSmall": {
                paddingTop: 22,
                paddingBottom: 6,
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              overflow: "hidden",
              borderRadius: 4,
              border: "1px solid",
              borderColor: dividerColor,
              backgroundColor: surfaceColor,
              transition: "border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease",
              "&:hover": {
                backgroundColor: "transparent",
              },
              "&.Mui-focused": {
                backgroundColor: "transparent",
                boxShadow: `${alpha(primaryColor, 0.25)} 0 0 0 2px`,
                borderColor: primaryColor,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            },
          },
        },
        MuiSelect: {
          defaultProps: { variant: "filled" as const, size: "small" },
        },
        MuiFormControl: {
          defaultProps: { size: "small", variant: "filled" as const },
        },
        MuiTablePagination: {
          styleOverrides: {
            select: {
              paddingTop: "4px !important",
              paddingBottom: "4px !important",
              display: "flex",
              alignItems: "center",
            },
          },
        },
        ...getSharedStepperOverrides(primaryColor),
      },
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