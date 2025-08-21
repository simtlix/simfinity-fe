"use client";

import * as React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box, CircularProgress, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { INTROSPECTION_QUERY, SchemaData, getElementTypeNameOfListField, getListEntityFieldNamesOfType, buildSelectionSetForObjectType, ValueResolver } from "@/lib/introspection";
import { resolveColumnRenderer } from "@/lib/columnRenderers";
import { useI18n } from "@/lib/i18n";

type CollectionFieldGridProps = {
  collectionField: {
    name: string;
    objectTypeName: string;
    connectionField: string;
  };
  parentEntityId: string;
  parentEntityType: string;
};

export default function CollectionFieldGrid({parentEntityType, collectionField, parentEntityId }: CollectionFieldGridProps) {
  const { data: schemaData } = useQuery(INTROSPECTION_QUERY);
  const { resolveLabel } = useI18n();
  
  // Pagination and sorting state
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [sortModel, setSortModel] = React.useState<{ field: string; sort: 'asc' | 'desc' }[]>([]);

  // Build selection set for the collection type using the same logic as EntityTable
  const { selection, columns, valueResolvers, sortFieldByColumn } = React.useMemo(() => {
    const schema = schemaData as SchemaData | undefined;
    if (!schema) {
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        sortFieldByColumn: {},
      } as const;
    }
    
    const collectionTypeName = getElementTypeNameOfListField(schema, collectionField.objectTypeName);
    if (!collectionTypeName) {
      return {
        selection: "id",
        columns: ["id"],
        valueResolvers: { id: (r: Record<string, unknown>) => r["id"] } as Record<string, ValueResolver>,
        sortFieldByColumn: {},
      } as const;
    }
    
    return { ...buildSelectionSetForObjectType(schema, collectionTypeName), entityTypeName: collectionTypeName } as const;
  }, [schemaData, collectionField.objectTypeName]);

  // Generate the collection query
  const collectionQuery = React.useMemo(() => {
    if (!schemaData) return null;
    
    // Get the correct list query name for this type
    const listQueryNames = getListEntityFieldNamesOfType(schemaData as SchemaData, collectionField.objectTypeName);
    const listQueryName = listQueryNames[0]; // Use the first available list query name
    
    if (!listQueryName) {
      console.error(`No list query name found for type: ${collectionField.objectTypeName}`);
      return null;
    }
    
    console.log(`CollectionFieldGrid: Using list query name '${listQueryName}' for type '${collectionField.objectTypeName}'`);
    
    // Generate sort block based on sortModel
    const sortBlock = sortModel.length > 0
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
      : `sort: { terms: [{ field: "id", order: ASC }] }`;

    const queryString = `
      query Get${collectionField.objectTypeName.charAt(0).toUpperCase() + collectionField.objectTypeName.slice(1)}s($parentId: QLValue!, $page: Int!, $size: Int!, $count: Boolean!) {
        ${listQueryName}(
          ${collectionField.connectionField}: { terms: { path: "id", operator: EQ, value: $parentId } }
          pagination: { page: $page, size: $size, count: $count }
          ${sortBlock}
        ) {
          ${selection}
        }
      }
    `;
    
    try {
      return gql(queryString);
    } catch (error) {
      console.error('Error generating collection query:', error);
      return null;
    }
  }, [collectionField, selection, schemaData, sortModel, sortFieldByColumn]);

  // Execute the collection query
  const { data: collectionData, loading: collectionLoading, error: collectionError } = useQuery(collectionQuery!, {
    variables: {
      parentId: parentEntityId,
      page: page + 1, // Convert to 1-based for GraphQL
      size: rowsPerPage,
      count: true,
    },
    skip: !collectionQuery || !parentEntityId,
  });

  // Log collection query execution
  React.useEffect(() => {
    if (collectionQuery && parentEntityId) {
      console.log(`CollectionFieldGrid: Executing query for ${collectionField.name}`, {
        parentId: parentEntityId,
        page: page + 1,
        size: rowsPerPage,
        query: collectionQuery.loc?.source.body
      });
    }
  }, [collectionQuery, parentEntityId, page, rowsPerPage, collectionField.name]);

  // Process the collection data
  const rows = React.useMemo(() => {
    if (!collectionData || !collectionField.objectTypeName || !schemaData) return [];
    
    // Get the correct list query name for this type
    const listQueryNames = getListEntityFieldNamesOfType(schemaData as SchemaData, collectionField.objectTypeName);
    const listQueryName = listQueryNames[0];
    
    if (!listQueryName) return [];
    
    const items = collectionData[listQueryName] || [];
    
    return items.map((item: Record<string, unknown>) => {
      const processedRow: Record<string, unknown> = { id: item.id };
      
      // Apply value resolvers for each column
      columns.forEach(column => {
        if (column !== 'id' && valueResolvers[column]) {
          processedRow[column] = valueResolvers[column](item);
        } else if (column !== 'id') {
          processedRow[column] = item[column];
        }
      });
      
      return processedRow;
    });
  }, [collectionData, collectionField.objectTypeName, columns, valueResolvers, schemaData]);

  // Get total count
  const totalCount = React.useMemo(() => {
    if (!collectionData || !collectionField.objectTypeName || !schemaData) return 0;
    
    // Get the correct list query name for this type
    const listQueryNames = getListEntityFieldNamesOfType(schemaData as SchemaData, collectionField.objectTypeName);
    const listQueryName = listQueryNames[0];
    
    if (!listQueryName) return 0;
    
    const items = collectionData[listQueryName] || [];
    
    // For now, we'll use the length of returned items
    // In a real implementation, you might want to add a count field to the query
    return items.length;
  }, [collectionData, collectionField.objectTypeName, schemaData]);

  // Build grid columns
  const gridColumns: GridColDef[] = React.useMemo(() => {
    return columns.map(column => {
      const columnDef: GridColDef = {
        field: column,
        headerName: resolveLabel([`${collectionField.objectTypeName}.${column}`], { entity: collectionField.name, field: column }, column),
        width: 150,
        sortable: true,
        filterable: false, // Disable filtering for now to keep it simple
      };

      // Apply custom column renderers if available
      const renderer = resolveColumnRenderer(`${collectionField.objectTypeName}.${column}`);
      if (renderer) {
        columnDef.renderCell = (params) => renderer(params.value);
      }

      return columnDef;
    });
  }, [columns, collectionField.objectTypeName, collectionField.name, resolveLabel]);

  // Handle pagination change
  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    if (newModel.pageSize !== rowsPerPage) {
      setRowsPerPage(newModel.pageSize);
      setPage(0);
    } else if (newModel.page !== page) {
      setPage(newModel.page);
    }
  };

  console.log(`CollectionFieldGrid: parentEntityType=${parentEntityType}, collectionField.name=${collectionField.name}`);
  // Get section label using proper i18n format
  const sectionLabel = resolveLabel([`${parentEntityType}.${collectionField.name}`], { entity: collectionField.objectTypeName }, collectionField.objectTypeName);

  if (!collectionQuery) {
    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{sectionLabel}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="error">Error: Could not generate collection query</Typography>
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{sectionLabel}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ height: 400, width: '100%' }}>
          {collectionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>{resolveLabel(['collection.loading'], { entity: collectionField.objectTypeName }, 'Loading...')}</Typography>
            </Box>
          ) : collectionError ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="error">{resolveLabel(['collection.error'], { entity: collectionField.objectTypeName }, 'Error loading collection data')}</Typography>
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">{resolveLabel(['collection.noData'], { entity: collectionField.objectTypeName }, 'No data available')}</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={gridColumns}
              pagination
              paginationModel={{ page, pageSize: rowsPerPage }}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[5, 10, 25]}
              rowCount={totalCount}
              paginationMode="server"
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={(model) => {
                const norm = (Array.isArray(model) ? model : [])
                  .filter((m) => m.field && m.sort)
                  .map((m) => ({ field: String(m.field), sort: m.sort as 'asc' | 'desc' }));
                setSortModel(norm);
              }}
              loading={collectionLoading}
              disableRowSelectionOnClick
              autoHeight
            />
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
