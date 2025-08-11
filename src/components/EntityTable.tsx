"use client";

import * as React from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { INTROSPECTION_QUERY, SchemaData, getElementTypeNameOfListField, buildSelectionSetForObjectType, ValueResolver } from "@/lib/introspection";
import { useI18n } from "@/lib/i18n";

type EntityTableProps = {
  listField: string; // e.g., "series"
};

function buildPaginatedListQuery(listField: string, selection: string, sortBlock: string | null) {
  const sortArg = sortBlock ? `, ${sortBlock}` : "";
  return gql`
    query DynamicList($page: Int!, $size: Int!, $count: Boolean!) {
      ${listField}(pagination: { page: $page, size: $size, count: $count }${sortArg}) {
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

  const { selection, columns, valueResolvers, entityTypeName, sortFieldByColumn } = React.useMemo(() => {
    const schema = schemaData as SchemaData | undefined;
    if (!schema)
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        entityTypeName: listField,
        sortFieldByColumn: {},
      } as const;
    const etn = getElementTypeNameOfListField(schema, listField);
    if (!etn)
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        entityTypeName: listField,
        sortFieldByColumn: {},
      } as const;
    return { ...buildSelectionSetForObjectType(schema, etn), entityTypeName: etn } as const;
  }, [schemaData, listField]);

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [totalCount, setTotalCount] = React.useState<number | null>(null);
  const [loadingData, setLoadingData] = React.useState<boolean>(false);
  const [errorData, setErrorData] = React.useState<string | null>(null);
  const [sortModel, setSortModel] = React.useState<{ field: string; sort: 'asc' | 'desc' }[]>([]);

  React.useEffect(() => {
    if (!selection) return;
    let cancelled = false;
    setLoadingData(true);
    setErrorData(null);
    const hasSort = sortModel.length > 0;
    const sortBlock = hasSort
      ? (() => {
          const terms = sortModel
            .map((s) => {
              const field = (sortFieldByColumn as Record<string, string | undefined>)[s.field] ?? s.field;
              const order = s.sort === 'asc' ? 'ASC' : 'DESC';
              return `{ field: "${field}", order: ${order} }`;
            })
            .join(', ');
          return `sort: { terms: [ ${terms} ] }`;
        })()
      : null;
    client
      .query({
        query: buildPaginatedListQuery(listField, selection, sortBlock),
        variables: {
          page: page + 1,
          size: rowsPerPage,
          count: true,
        },
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
  }, [client, listField, selection, page, rowsPerPage, sortModel, sortFieldByColumn]);

  const resolvedColumns = columns;
  const entityNameForLabels = entityTypeName;
  const tableTitle = resolveLabel([listField], { entity: listField }, listField);

  type GridRow = Row & { __rid: string };
  const gridColumns: GridColDef<GridRow>[] = React.useMemo(() => {
    return resolvedColumns.map((col) => {
      const header = resolveLabel([`${entityNameForLabels}.${col}`], { entity: entityNameForLabels, field: col }, col);
      const def: GridColDef<GridRow> = {
        field: col,
        headerName: header,
        flex: 1,
        minWidth: 140,
        renderCell: (params) => {
          const row = params.row as GridRow;
          const resolver = (valueResolvers as Record<string, ValueResolver | undefined>)[col];
          const value = resolver ? resolver(row) : (row as Record<string, unknown>)[col];
          return <span>{String(value ?? "")}</span>;
        },
      };
      return def;
    });
  }, [resolvedColumns, resolveLabel, entityNameForLabels, valueResolvers]);

  const gridRows: GridRow[] = React.useMemo(() => {
    return rows.map((row, idx) => ({ __rid: String((row as Record<string, unknown>)["id"] ?? `${listField}-${page}-${idx}`), ...row }));
  }, [rows, listField, page]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {tableTitle}
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
        <Paper sx={{ height: 540, width: "100%" }}>
          <DataGrid
            rows={gridRows}
            getRowId={(row: { __rid: string }) => row.__rid}
            columns={gridColumns}
            loading={loadingData}
            rowCount={totalCount ?? gridRows.length}
            paginationMode="server"
            paginationModel={{ page, pageSize: rowsPerPage } as GridPaginationModel}
            onPaginationModelChange={(model) => {
              if (model.pageSize !== rowsPerPage) {
                setRowsPerPage(model.pageSize);
                setPage(0);
              } else if (model.page !== page) {
                setPage(model.page);
              }
            }}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={(model) => {
              const norm = (Array.isArray(model) ? model : [])
                .filter((m) => m.field && m.sort)
                .map((m) => ({ field: String(m.field), sort: m.sort as 'asc' | 'desc' }));
              setSortModel(norm);
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableColumnMenu
            disableRowSelectionOnClick
            sx={{ border: 0 }}
          />
        </Paper>
      )}
    </Box>
  );
}


