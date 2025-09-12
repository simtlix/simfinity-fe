import * as React from "react";
import { registerColumnRenderer } from "@/components/simfinity-fe/lib/columnRenderers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import PersonIcon from "@mui/icons-material/Person";

/**
 * Setup function to register custom column renderers
 * This function demonstrates how to create custom column renderers for specific entity fields
 */
export const setupColumnRenderers = () => {
  // Example: Custom date renderer with calendar icon
  // Lowercase key to match label style; registry normalizes to lowercase
  registerColumnRenderer("episode.date", ({ value }) => {
    if (value == null) return "";
    const d = new Date(value as string | number);
    const text = isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <CalendarMonthIcon fontSize="small" />
        {text}
      </span>
    );
  });

  // Example: Custom renderer for season year with context
  // registerColumnRenderer("season.year", ({ value, rowData }) => {
  //   if (value == null) return "";
  //   return (
  //     <span style={{ fontWeight: "bold", color: "#1976d2" }}>
  //       Year {value}
  //     </span>
  //   );
  // });

  // Example: Custom renderer for series categories as chips
  // registerColumnRenderer("serie.categories", ({ value }) => {
  //   if (!Array.isArray(value)) return "";
  //   return (
  //     <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
  //       {value.map((category, index) => (
  //         <span
  //           key={index}
  //           style={{
  //             background: "#e3f2fd",
  //             padding: "2px 8px",
  //             borderRadius: "12px",
  //             fontSize: "0.75rem",
  //           }}
  //         >
  //           {category}
  //         </span>
  //       ))}
  //     </div>
  //   );
  // });

  // Example: Custom renderer for star names with profile icon
  // registerColumnRenderer("star.name", ({ value, rowData }) => {
  //   if (value == null) return "";
  //   return (
  //     <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
  //       <PersonIcon fontSize="small" color="action" />
  //       {value}
  //     </span>
  //   );
  // });
};
