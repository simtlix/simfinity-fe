"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useI18n } from "@simtlix/simfinity-fe-components";

const DESCRIPTION_MAX_LENGTH = 120;

function stripHtml(html: string): string {
  if (typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export interface SerieCardProps {
  item: Record<string, unknown>;
  listField: string;
  onNavigate: (path: string) => void;
  reload?: () => void;
}

export function SerieCard({ item, listField, onNavigate }: SerieCardProps) {
  const { resolveLabel } = useI18n();
  const id = item?.id as string | undefined;
  const name = (item?.name as string) ?? "";
  const description = item?.description as string | undefined;
  const director = item?.director as { name?: string } | null | undefined;
  const categories = (item?.categories as string[] | undefined) ?? [];

  const directorName = director?.name ?? null;
  const descriptionText = truncate(
    stripHtml(description ?? ""),
    DESCRIPTION_MAX_LENGTH
  );

  const viewLabel = resolveLabel(["actions.view"], { entity: listField }, "View");
  const editLabel = resolveLabel(["actions.edit"], { entity: listField }, "Edit");

  if (!id) return null;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom noWrap>
          {name || "—"}
        </Typography>
        {directorName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {directorName}
          </Typography>
        )}
        {categories.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {categories.slice(0, 3).map((cat) => (
              <Typography
                key={cat}
                component="span"
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.25,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                {cat}
              </Typography>
            ))}
            {categories.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{categories.length - 3}
              </Typography>
            )}
          </Box>
        )}
        {descriptionText && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {descriptionText}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => onNavigate(`/entities/${listField}/${id}/view`)}
        >
          {viewLabel}
        </Button>
        <Button
          size="small"
          onClick={() => onNavigate(`/entities/${listField}/${id}/edit`)}
        >
          {editLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
