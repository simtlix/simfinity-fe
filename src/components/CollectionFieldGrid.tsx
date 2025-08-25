"use client";

import * as React from "react";
import { gql, useQuery } from "@apollo/client";
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import { INTROSPECTION_QUERY, SchemaData, getElementTypeNameOfListField, getListEntityFieldNamesOfType, buildSelectionSetForObjectType, ValueResolver } from "@/lib/introspection";
import { resolveColumnRenderer } from "@/lib/columnRenderers";
import { useI18n } from "@/lib/i18n";
import CollectionItemEditForm from "./CollectionItemEditForm";

// Types for collection item management
export type CollectionItemStatus = 'original' | 'added' | 'modified' | 'deleted';

export interface CollectionItem {
  id: string;
  [key: string]: unknown;
  __status?: CollectionItemStatus;
  __originalData?: Record<string, unknown>;
}

export interface CollectionFieldState {
  added: CollectionItem[];
  modified: CollectionItem[];
  deleted: CollectionItem[];
}

type CollectionFieldGridProps = {
  collectionField: {
    name: string;
    objectTypeName: string;
    connectionField: string;
  };
  parentEntityId: string;
  parentEntityType: string;
  isEditMode?: boolean;
  collectionState?: CollectionFieldState;
  onCollectionStateChange?: (fieldName: string, newState: CollectionFieldState) => void;
};

export default function CollectionFieldGrid({
  parentEntityType, 
  collectionField, 
  parentEntityId,
  isEditMode = false,
  collectionState,
  onCollectionStateChange
}: CollectionFieldGridProps) {
  const { data: schemaData } = useQuery(INTROSPECTION_QUERY);
  const { resolveLabel } = useI18n();
  
  // Local state for collection management
  const [localCollectionState, setLocalCollectionState] = React.useState<CollectionFieldState>({
    added: [],
    modified: [],
    deleted: []
  });

  // Edit form state
  const [editFormOpen, setEditFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CollectionItem | null>(null);



  // Use provided state or local state
  const currentState = collectionState || localCollectionState;
  const setCurrentState = onCollectionStateChange 
    ? (newState: CollectionFieldState | ((prev: CollectionFieldState) => CollectionFieldState)) => {
        if (typeof newState === 'function') {
          const updatedState = newState(currentState);
          onCollectionStateChange(collectionField.name, updatedState);
        } else {
          onCollectionStateChange(collectionField.name, newState);
        }
      }
    : setLocalCollectionState;

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

  // Generate the collection query with NIN filter for modified/deleted items
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

    // Build filter to exclude modified and deleted items
    const excludeFilter = isEditMode && (currentState.modified.length > 0 || currentState.deleted.length > 0)
      ? (() => {
          const excludeIds = [
            ...currentState.modified.map(item => item.id),
            ...currentState.deleted.map(item => item.id)
          ];
          
          if (excludeIds.length === 0) return '';
          
          return `
            id: { operator: NIN, value: [${excludeIds.map(id => `"${id}"`).join(', ')}] }
          `;
        })()
      : '';

    const queryString = `
      query Get${collectionField.objectTypeName.charAt(0).toUpperCase() + collectionField.objectTypeName.slice(1)}s($parentId: QLValue!, $page: Int!, $size: Int!, $count: Boolean!) {
        ${listQueryName}(
          ${collectionField.connectionField}: { terms: { path: "id", operator: EQ, value: $parentId } }
          ${excludeFilter ? excludeFilter : ''}
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
  }, [collectionField, selection, schemaData, sortModel, sortFieldByColumn, isEditMode, currentState.modified, currentState.deleted]);

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
        excludeIds: [...currentState.modified.map(item => item.id), ...currentState.deleted.map(item => item.id)],
        query: collectionQuery.loc?.source.body
      });
    }
  }, [collectionQuery, parentEntityId, page, rowsPerPage, collectionField.name, currentState.modified, currentState.deleted]);

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



  // Collection item management functions
  const handleEditItem = React.useCallback((item: Record<string, unknown>) => {
    setEditingItem(item as CollectionItem);
    setEditFormOpen(true);
  }, []);

  const handleDeleteItem = React.useCallback((item: Record<string, unknown>) => {
    // If item was added, remove it completely
    if (currentState.added.some(i => i.id === item.id)) {
      setCurrentState(prev => ({
        ...prev,
        added: prev.added.filter(i => i.id !== item.id)
      }));
      return;
    }

    // If item was modified, move it to deleted
    if (currentState.modified.some(i => i.id === item.id)) {
      const modifiedItem = currentState.modified.find(i => i.id === item.id);
      if (modifiedItem) {
        const deletedItem: CollectionItem = { 
          ...modifiedItem, 
          __status: 'deleted' as CollectionItemStatus 
        };
        setCurrentState(prev => ({
          ...prev,
          modified: prev.modified.filter(i => i.id !== item.id),
          deleted: [...prev.deleted, deletedItem]
        }));
      }
      return;
    }

    // If item is original, move it to deleted
    const deletedItem: CollectionItem = { 
      ...item, 
      __status: 'deleted' as CollectionItemStatus 
    } as CollectionItem;
    setCurrentState(prev => ({
      ...prev,
      deleted: [...prev.deleted, deletedItem]
    }));
  }, [currentState.added, currentState.modified, setCurrentState]);

  const handleRestoreItem = React.useCallback((item: CollectionItem) => {
    if (item.__status === 'deleted') {
      // Restore to original state
      setCurrentState(prev => ({
        ...prev,
        deleted: prev.deleted.filter(i => i.id !== item.id)
      }));
    }
  }, [setCurrentState]);

  const handleAddItem = React.useCallback(() => {
    // Create a new item with a temporary ID
    const newItem: CollectionItem = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      __status: 'added',
      // Add default values for required fields
      ...Object.fromEntries(columns.map(col => [col, col === 'id' ? undefined : '']))
    };

    setCurrentState(prev => ({
      ...prev,
      added: [...prev.added, newItem]
    }));
  }, [columns, setCurrentState]);

  // Handle saving edited item
  const handleSaveEditedItem = React.useCallback((updatedItem: CollectionItem) => {
    setCurrentState(prev => ({
      ...prev,
      modified: [...prev.modified.filter(i => i.id !== updatedItem.id), updatedItem]
    }));
    setEditFormOpen(false);
    setEditingItem(null);
  }, [setCurrentState]);



  // Build grid columns (moved here after function definitions)
  const gridColumns: GridColDef[] = React.useMemo(() => {
    const baseColumns = columns.map(column => {
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
        columnDef.renderCell = (params) => {
          const value = valueResolvers[column] ? valueResolvers[column](params.row) : params.row[column];
          return (
            <>{renderer({ 
              entity: collectionField.objectTypeName, 
              field: column, 
              row: params.row, 
              value, 
              gridParams: params 
            })}</>
          );
        };
      }

      return columnDef;
    });

    // Add action column for edit mode
    if (isEditMode) {
      baseColumns.push({
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEditItem(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteItem(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      });
    }

    return baseColumns;
  }, [columns, collectionField.objectTypeName, collectionField.name, resolveLabel, valueResolvers, isEditMode, handleEditItem, handleDeleteItem]);

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
    <Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{sectionLabel}</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Box sx={{ width: '100%' }}>
          {/* Main collection grid */}
          <Box sx={{ height: 400, width: '100%', mb: 3 }}>
            {collectionLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>{resolveLabel(['collection.loading'], { entity: collectionField.objectTypeName }, 'Loading...')}</Typography>
              </Box>
            ) : collectionError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="error">{resolveLabel(['collection.error'], { entity: collectionField.objectTypeName }, 'Error loading collection data')}</Typography>
              </Box>
            ) : rows.length === 0 && currentState.added.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">{resolveLabel(['collection.noData'], { entity: collectionField.objectTypeName }, 'No data available')}</Typography>
              </Box>
            ) : (
              <>
                {isEditMode && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddItem}
                      size="small"
                    >
                      Add {collectionField.objectTypeName}
                    </Button>
                  </Box>
                )}
                <DataGrid
                  rows={[...rows, ...currentState.added]}
                  columns={gridColumns}
                  pagination
                  paginationModel={{ page, pageSize: rowsPerPage }}
                  onPaginationModelChange={handlePaginationModelChange}
                  pageSizeOptions={[5, 10, 25]}
                  rowCount={totalCount + currentState.added.length}
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
              </>
            )}
          </Box>

          {/* Local state tables for edit mode */}
          {isEditMode && (
            <Box sx={{ mt: 3 }}>
              {/* Modified items table */}
              {currentState.modified.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Modified Items
                    <Chip 
                      label={currentState.modified.length} 
                      size="small" 
                      color="warning" 
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {columns.map(column => (
                            <TableCell key={column}>
                              {resolveLabel([`${collectionField.objectTypeName}.${column}`], { entity: collectionField.name, field: column }, column)}
                            </TableCell>
                          ))}
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentState.modified.map((item) => (
                          <TableRow key={item.id}>
                            {columns.map(column => (
                              <TableCell key={column}>
                                {item[column]?.toString() || ''}
                              </TableCell>
                            ))}
                            <TableCell>
                              <Tooltip title="Restore">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRestoreItem(item)}
                                >
                                  <RestoreIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Deleted items table */}
              {currentState.deleted.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Deleted Items
                    <Chip 
                      label={currentState.deleted.length} 
                      size="small" 
                      color="error" 
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {columns.map(column => (
                            <TableCell key={column}>
                              {resolveLabel([`${collectionField.objectTypeName}.${column}`], { entity: collectionField.name, field: column }, column)}
                            </TableCell>
                          ))}
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentState.deleted.map((item) => (
                          <TableRow key={item.id}>
                            {columns.map(column => (
                              <TableCell key={column}>
                                {item[column]?.toString() || ''}
                              </TableCell>
                            ))}
                            <TableCell>
                              <Tooltip title="Restore">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRestoreItem(item)}
                                >
                                  <RestoreIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>

    {/* Edit form dialog */}
    {editingItem && editFormOpen && (
      <CollectionItemEditForm
        open={editFormOpen}
        onClose={() => {
          setEditFormOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        collectionFieldName={collectionField.name}
        objectTypeName={collectionField.objectTypeName}
        parentEntityId={parentEntityId}
        parentEntityType={parentEntityType}
        onSave={handleSaveEditedItem}
      />
    )}
  </Box>
  );
}
