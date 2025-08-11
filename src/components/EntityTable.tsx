"use client";

import * as React from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
} from "@mui/material";
import { INTROSPECTION_QUERY, SchemaData, getElementTypeNameOfListField, buildSelectionSetForObjectType, ValueResolver } from "@/lib/introspection";
import { useI18n } from "@/lib/i18n";

type EntityTableProps = {
  listField: string; // e.g., "series"
};

function buildPaginatedListQuery(listField: string, selection: string) {
  return gql`
    query DynamicList($page: Int!, $size: Int!, $count: Boolean!) {
      ${listField}(pagination: { page: $page, size: $size, count: $count }) {
        ${selection}
      }
    }
  `;
}

type Row = Record<string, unknown>;

export default function EntityTable({ listField }: EntityTableProps) {
  const client = useApolloClient();
  const { data: schemaData } = useQuery(INTROSPECTION_QUERY);
  const { resolveLabel } = useI18n();

  const { selection, columns, valueResolvers, entityTypeName } = React.useMemo(() => {
    const schema = schemaData as SchemaData | undefined;
    if (!schema)
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        entityTypeName: listField,
      } as const;
    const etn = getElementTypeNameOfListField(schema, listField);
    if (!etn)
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        entityTypeName: listField,
      } as const;
    return { ...buildSelectionSetForObjectType(schema, etn), entityTypeName: etn } as const;
  }, [schemaData, listField]);

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState<number | null>(null);
  const [loadingData, setLoadingData] = React.useState<boolean>(false);
  const [errorData, setErrorData] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selection) return;
    let cancelled = false;
    setLoadingData(true);
    setErrorData(null);
    client
      .query({
        query: buildPaginatedListQuery(listField, selection),
        variables: { page: page + 1, size: rowsPerPage, count: true },
        fetchPolicy: "network-only",
      })
      .then((result) => {
        if (cancelled) return;
        const raw = (result.data?.[listField] as unknown) as Row[] | undefined;
        setRows(Array.isArray(raw) ? raw : []);
        // Apollo doesn't expose extensions directly on result, but on the response context.
        // However, simfinity returns count in the top-level extensions of the HTTP response.
        // We can read it via the legacy __response field if present, otherwise default to null.
        const anyResult = result as unknown as { extensions?: Record<string, unknown> };
        const ext = anyResult.extensions;
        const c = typeof ext?.count === "number" ? (ext.count as number) : null;
        setTotalCount(c);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setErrorData(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client, listField, selection, page, rowsPerPage]);

  const resolvedColumns = columns;
  const entityNameForLabels = entityTypeName;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {listField}
      </Typography>
      {loadingData && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading data…</Typography>
        </Box>
      )}
      {errorData && (
        <Typography color="error" variant="body2">
          Failed to load data: {errorData}
        </Typography>
      )}
      {!loadingData && !errorData && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {resolvedColumns.map((col) => {
                  const header = resolveLabel([`${entityNameForLabels}.${col}`], { entity: entityNameForLabels, field: col }, col);
                  return <TableCell key={col}>{header}</TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => {
                const idVal = (row as Record<string, unknown>)["id"];
                return (
                  <TableRow key={typeof idVal === "string" ? idVal : idx} hover>
                    {resolvedColumns.map((col) => {
                      const resolver = (valueResolvers as Record<string, ValueResolver | undefined>)[col];
                      const value = resolver ? resolver(row as Record<string, unknown>) : (row as Record<string, unknown>)[col];
                      return <TableCell key={col}>{String(value ?? "")}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 25, 50]}
            count={totalCount ?? -1}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              const newSize = parseInt(e.target.value, 10);
              setRowsPerPage(newSize);
              setPage(0);
            }}
          />
        </TableContainer>
      )}
    </Box>
  );
}


