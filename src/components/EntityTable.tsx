"use client";

import * as React from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel, type GridFilterModel, type GridFilterOperator, getGridNumericOperators, getGridBooleanOperators, GridFilterInputValue } from "@mui/x-data-grid";
import ServerToolbar from "@/components/ServerToolbar";
import ServerFilterPanel from "@/components/ServerFilterPanel";
import { TagsFilterInput, BetweenFilterInput, DateFilterInput } from "@/components/FilterInputs";
import { INTROSPECTION_QUERY, SchemaData, getElementTypeNameOfListField, buildSelectionSetForObjectType, ValueResolver, isNumericScalarName, isBooleanScalarName, isDateTimeScalarName } from "@/lib/introspection";
import { useI18n } from "@/lib/i18n";

type EntityTableProps = {
  listField: string; // e.g., "series"
};

function buildPaginatedListQuery(listField: string, selection: string, sortBlock: string | null, filterBlock: string | null) {
  const sortArg = sortBlock ? `, ${sortBlock}` : "";
  const filterArgs = filterBlock ? `, ${filterBlock}` : "";
  return gql`
    query DynamicList($page: Int!, $size: Int!, $count: Boolean!) {
      ${listField}(pagination: { page: $page, size: $size, count: $count }${sortArg}${filterArgs}) {
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

  const { selection, columns, valueResolvers, entityTypeName, sortFieldByColumn, fieldTypeByColumn } = React.useMemo(() => {
    const schema = schemaData as SchemaData | undefined;
    if (!schema)
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        entityTypeName: listField,
         sortFieldByColumn: {},
         fieldTypeByColumn: {},
      } as const;
    const etn = getElementTypeNameOfListField(schema, listField);
    if (!etn)
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        entityTypeName: listField,
         sortFieldByColumn: {},
         fieldTypeByColumn: {},
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
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [pendingFilterModel, setPendingFilterModel] = React.useState<GridFilterModel>({ items: [] });

  const filterBlock: string | null = React.useMemo(() => {
    if (!filterModel?.items?.length) return null;
    const byField = new Map<string, { operator: string; value: unknown }[]>();
    for (const item of filterModel.items) {
      if (!item.field || item.value == null || item.value === '') continue;
      const field = String(item.field);
      const opMap: Record<string, string> = {
        contains: 'LIKE', startsWith: 'LIKE', endsWith: 'LIKE', equals: 'EQ', '=': 'EQ', is: 'EQ', '!=': 'NE', not: 'NE',
        greaterThan: 'GT', '>': 'GT', greaterThanOrEqual: 'GTE', '>=': 'GTE', lessThan: 'LT', '<': 'LT', lessThanOrEqual: 'LTE', '<=': 'LTE',
        isAnyOf: 'IN', in: 'IN', nin: 'NIN', btw: 'BTW'
      };
      const operator = opMap[item.operator ?? 'equals'] ?? 'EQ';
      const value = item.value as unknown;
      const arr = byField.get(field) ?? [];
      arr.push({ operator, value });
      byField.set(field, arr);
    }
    if (byField.size === 0) return null;

    const parts: string[] = [];
    byField.forEach((conds, col) => {
      const sortField = (sortFieldByColumn as Record<string, string | undefined>)[col];
      const isObjectColumn = sortField ? sortField.includes('.') : false;
      const typeName = (fieldTypeByColumn as Record<string, string | undefined>)[col];
      const isNumeric = isNumericScalarName(typeName);
      const isBoolean = isBooleanScalarName(typeName);
      const allowedOpsScalar = isNumeric ? new Set(["EQ","NE","GT","GTE","LT","LTE","IN","NIN","BTW"]) : isBoolean ? new Set(["EQ","NE"]) : new Set(["EQ","NE","LIKE","IN","NIN"]);
      if (!isObjectColumn) {
        const { operator, value } = conds[0];
        if (!allowedOpsScalar.has(operator)) return;
        const toLiteral = (v: unknown) => isNumeric ? String(Number(v)) : isBoolean ? String(Boolean(v)) : JSON.stringify(String(v));
        if (operator === 'IN' || operator === 'NIN') {
          const values = Array.isArray(value) ? value : [value];
          const arrLit = `[${values.map(toLiteral).join(', ')}]`;
          parts.push(`${col}: { operator: ${operator}, value: ${arrLit} }`);
        } else if (operator === 'BTW') {
          const values = Array.isArray(value) ? value : [value, value];
          const arrLit = `[${values.slice(0,2).map(toLiteral).join(', ')}]`;
          parts.push(`${col}: { operator: ${operator}, value: ${arrLit} }`);
        } else {
          const valueLiteral = toLiteral(value);
          parts.push(`${col}: { operator: ${operator}, value: ${valueLiteral} }`);
        }
      } else {
        const pathWithin = sortField!.split('.').slice(1).join('.');
        const terms = conds.map(({ operator, value }) => {
          const toLiteral = (v: unknown) => isNumeric ? String(Number(v)) : isBoolean ? String(Boolean(v)) : JSON.stringify(String(v));
          if (operator === 'IN' || operator === 'NIN' || operator === 'BTW') {
            const values = Array.isArray(value) ? value : [value];
            const arrLit = operator === 'BTW' ? `[${values.slice(0,2).map(toLiteral).join(', ')}]` : `[${values.map(toLiteral).join(', ')}]`;
            return `{ path: ${JSON.stringify(pathWithin)}, operator: ${operator}, value: ${arrLit} }`;
          }
          const valueLiteral = toLiteral(value);
          return `{ path: ${JSON.stringify(pathWithin)}, operator: ${operator}, value: ${valueLiteral} }`;
        }).join(', ');
        parts.push(`${col}: { terms: [ ${terms} ] }`);
      }
    });
    return parts.length ? parts.join(', ') : null;
  }, [filterModel, sortFieldByColumn, fieldTypeByColumn]);

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
        query: buildPaginatedListQuery(listField, selection, sortBlock, filterBlock),
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
  }, [client, listField, selection, page, rowsPerPage, sortModel, sortFieldByColumn, filterBlock]);

  const resolvedColumns = columns;
  const entityNameForLabels = entityTypeName;
  const tableTitle = resolveLabel([listField], { entity: listField }, listField);

  type GridRow = Row & { __rid: string };
  const gridColumns: GridColDef<GridRow>[] = React.useMemo(() => {
    return resolvedColumns.map((col) => {
      const header = resolveLabel([`${entityNameForLabels}.${col}`], { entity: entityNameForLabels, field: col }, col);
      const typeName = (fieldTypeByColumn as Record<string, string | undefined>)[col];
      const isNumeric = isNumericScalarName(typeName);
      const isBoolean = isBooleanScalarName(typeName);
      const isDate = isDateTimeScalarName(typeName);
      const def: GridColDef<GridRow> = {
        field: col,
        headerName: header,
        flex: 1,
        minWidth: 140,
        type: isNumeric ? 'number' : isBoolean ? 'boolean' : isDate ? 'dateTime' : 'string',
        headerAlign: 'left',
        align: 'left',
        filterOperators: (() => {
          if (isNumeric) {
            const base = getGridNumericOperators();
            const keep = new Set(['=', '!=', '>', '>=', '<', '<=', 'equals']);
            return [
              ...base.filter((o) => (o.value ? keep.has(o.value) : false)),
              { label: 'between', value: 'btw', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: BetweenFilterInput, InputComponentProps: { inputType: 'number' } } as unknown as GridFilterOperator,
              { label: 'in', value: 'in', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: TagsFilterInput } as unknown as GridFilterOperator,
              { label: 'not in', value: 'nin', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: TagsFilterInput } as unknown as GridFilterOperator,
            ];
          }
          if (isBoolean) {
            return getGridBooleanOperators();
          }
          if (isDate) {
            // Use the same core operators as numbers; no IN/NIN; offer between (two date inputs)
            return [
              { label: 'equals', value: 'equals', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: DateFilterInput, InputComponentProps: { inputType: 'datetime-local' } } as unknown as GridFilterOperator,
              { label: 'greaterThan', value: '>', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: DateFilterInput, InputComponentProps: { inputType: 'datetime-local' } } as unknown as GridFilterOperator,
              { label: 'greaterThanOrEqual', value: '>=', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: DateFilterInput, InputComponentProps: { inputType: 'datetime-local' } } as unknown as GridFilterOperator,
              { label: 'lessThan', value: '<', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: DateFilterInput, InputComponentProps: { inputType: 'datetime-local' } } as unknown as GridFilterOperator,
              { label: 'lessThanOrEqual', value: '<=', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: DateFilterInput, InputComponentProps: { inputType: 'datetime-local' } } as unknown as GridFilterOperator,
              { label: 'between', value: 'btw', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: BetweenFilterInput, InputComponentProps: { inputType: 'datetime-local' } } as unknown as GridFilterOperator,
            ];
          }
          // Strings: only contains, equals, not equal ("!="), in, nin
          return [
            { label: 'contains', value: 'contains', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: GridFilterInputValue } as unknown as GridFilterOperator,
            { label: 'equals', value: 'equals', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: GridFilterInputValue } as unknown as GridFilterOperator,
            { label: 'not equal', value: '!=', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: GridFilterInputValue } as unknown as GridFilterOperator,
            { label: 'in', value: 'in', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: TagsFilterInput } as unknown as GridFilterOperator,
            { label: 'not in', value: 'nin', getApplyFilterFn: undefined as unknown as GridFilterOperator['getApplyFilterFn'], InputComponent: TagsFilterInput } as unknown as GridFilterOperator,
          ];
        })(),
        valueGetter: isDate
          ? (params: { value: unknown }) => {
              const raw = params.value as unknown;
              if (raw == null) return null;
              if (raw instanceof Date) return raw;
              const d = new Date(raw as string | number);
              return isNaN(d.getTime()) ? null : d;
            }
          : undefined,
        renderCell: (params) => {
          const row = params.row as GridRow;
          const resolver = (valueResolvers as Record<string, ValueResolver | undefined>)[col];
          const value = resolver ? resolver(row) : (row as Record<string, unknown>)[col];
          return <span>{String(value ?? "")}</span>;
        },
      };
      return def;
    });
  }, [resolvedColumns, resolveLabel, entityNameForLabels, valueResolvers, fieldTypeByColumn]);

  const gridRows: GridRow[] = React.useMemo(() => {
    return rows.map((row, idx) => ({ __rid: String((row as Record<string, unknown>)["id"] ?? `${listField}-${page}-${idx}`), ...row }));
  }, [rows, listField, page]);

  const localeText = React.useMemo(() => {
    const t = (k: string, d: string) => resolveLabel([`grid.${k}`], { entity: listField }, d);
    return {
      filterPanelColumns: t('filter.columns', 'Columns'),
      filterPanelOperator: t('filter.operator', 'Operator'),
      filterPanelValue: t('filter.value', 'Value'),
      filterOperatorContains: t('filter.contains', 'contains'),
      filterOperatorEquals: t('filter.equals', 'equals'),
      filterOperatorStartsWith: t('filter.startsWith', 'starts with'),
      filterOperatorEndsWith: t('filter.endsWith', 'ends with'),
      filterOperatorIs: t('filter.is', 'is'),
      filterOperatorNot: t('filter.not', 'not'),
      filterOperatorIsAnyOf: t('filter.isAnyOf', 'is any of'),
      filterOperatorGreaterThan: t('filter.greaterThan', 'greater than'),
      filterOperatorGreaterThanOrEqual: t('filter.greaterThanOrEqual', 'greater than or equal to'),
      filterOperatorLessThan: t('filter.lessThan', 'less than'),
      filterOperatorLessThanOrEqual: t('filter.lessThanOrEqual', 'less than or equal to'),
    } as const;
  }, [resolveLabel, listField]);

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
            localeText={localeText}
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
            filterMode="server"
            filterModel={pendingFilterModel}
            onFilterModelChange={(model) => setPendingFilterModel(model)}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              toolbar: () => (
                <ServerToolbar
                  filterModel={pendingFilterModel}
                  onFilterModelChange={setPendingFilterModel}
                  onApply={() => setFilterModel(pendingFilterModel)}
                  onClear={() => { setPendingFilterModel({ items: [] }); setFilterModel({ items: [] }); }}
                  onOpenFilter={() => {
                    // Directly call the grid API when possible
                    const root = document.querySelector('[data-mui-internal="GridRoot"]') || document.querySelector('[role="grid"]');
                    if (root) {
                      const toggleBtn = root.querySelector('[aria-label="Filters"]') || root.querySelector('[aria-label="Show filters"]') || root.querySelector('[aria-label="Hide filters"]');
                      (toggleBtn as HTMLButtonElement | null)?.click();
                    }
                  }}
                />
              ),
              filterPanel: () => (
                <ServerFilterPanel
                  onApply={(model) => setFilterModel(model)}
                  onClear={() => { setPendingFilterModel({ items: [] }); setFilterModel({ items: [] }); }}
                />
              ),
            }}
            disableRowSelectionOnClick
            sx={{ border: 0, height: '100%' }}
          />
        </Paper>
      )}
    </Box>
  );
}


