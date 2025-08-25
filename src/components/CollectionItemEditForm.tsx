"use client";

import * as React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  INTROSPECTION_QUERY,
  SchemaData,
  getElementTypeNameOfListField,
  getTypeByName,
  getListEntityFieldNamesOfType,
  buildSelectionSetForObjectType,
  ValueResolver,
} from "@/lib/introspection";
import { resolveColumnRenderer } from "@/lib/columnRenderers";
import { useI18n } from "@/lib/i18n";
import ObjectFieldSelector from "./ObjectFieldSelector";
import {
  FormCustomizationState,
  FormCustomizationActions,
  createFormCustomizationState,
  getFieldSize,
  isFieldVisible,
  isFieldEnabled,
  getFieldOrder,
  getEmbeddedFieldCustomization,
  getEmbeddedSectionCustomization,
  getEmbeddedFieldSize,
  getCollectionItemFieldCustomization,
  getCollectionItemFieldSize,
  getFormCustomization,
  FormCustomization,
} from "@/lib/formCustomization";
import { CollectionItem } from "./CollectionFieldGrid";

type CollectionItemEditFormProps = {
  open: boolean;
  onClose: () => void;
  item: CollectionItem;
  collectionFieldName: string;
  objectTypeName: string;
  parentEntityId: string;
  parentEntityType: string;
  onSave: (updatedItem: CollectionItem) => void;
};

type FormField = {
  name: string;
  type: string;
  required: boolean;
  value: string | number | boolean | string[] | null;
  error?: string;
  isNumeric: boolean;
  isBoolean: boolean;
  isDate: boolean;
  isList: boolean;
  isEnum: boolean;
  enumValues?: string[];
  isObject: boolean;
  objectTypeName?: string;
  descriptionField?: string;
  descriptionFieldType?: string;
  listQueryName?: string;
  singleQueryName?: string;
  isEmbedded?: boolean;
  embeddedFields?: FormField[];
  isCollection?: boolean;
  collectionObjectTypeName?: string;
  connectionField?: string;
};

type FormData = Record<string, FormField>;

export default function CollectionItemEditForm({
  open,
  onClose,
  item,
  collectionFieldName,
  objectTypeName,
  parentEntityId,
  parentEntityType,
  onSave,
}: CollectionItemEditFormProps) {
  const { data: schemaData } = useQuery(INTROSPECTION_QUERY);
  const { resolveLabel } = useI18n();
  const [formData, setFormData] = React.useState<FormData>({} as FormData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form customization state
  const [customizationState, setCustomizationState] = React.useState<FormCustomizationState>({
    customization: {},
    fieldVisibility: {},
    fieldEnabled: {},
    fieldOrder: [],
  });

  // Build form fields based on schema
  const formFields = React.useMemo(() => {
    if (!schemaData) return [];
    
    try {
      const schema = schemaData as SchemaData;
      const entityType = getTypeByName(schema, objectTypeName);
      if (!entityType?.fields) return [];
      
      return entityType.fields
        .filter(field => {
          // Exclude connection fields to parent entity
          if (field.name === parentEntityType.toLowerCase() || 
              field.name === parentEntityType.toLowerCase() + 's') {
            return false;
          }
          
          // Exclude collection fields for now (to keep it simple)
          const fieldType = field.type;
          const isList = fieldType.kind === "LIST";
          if (isList) return false;
          
          return true;
        })
        .map(field => {
          const fieldType = field.type;
          const isNonNull = isNonNullField(fieldType);
          const actualType = getActualScalarType(fieldType);
          const isList = fieldType.kind === "LIST";
          const isObject = fieldType.kind === "OBJECT" || fieldType.kind === "INTERFACE";
          const isEnum = fieldType.kind === "ENUM";
          
          // Get object type info if it's an object field
          let objectTypeName: string | undefined;
          let descriptionField: string | undefined;
          let descriptionFieldType: string | undefined;
          let listQueryName: string | undefined;
          let singleQueryName: string | undefined;
          
          if (isObject && fieldType.name) {
            objectTypeName = fieldType.name;
            // Get description field from schema extensions
            const objectType = getTypeByName(schema, objectTypeName);
            if (objectType?.fields) {
              // Look for common description fields
              const descField = objectType.fields.find(f => 
                f.name === 'name' || f.name === 'title' || f.name === 'description'
              );
              if (descField) {
                descriptionField = descField.name;
                descriptionFieldType = getActualScalarType(descField.type);
              }
            }
            
            // Get query names
            const queryNames = getQueryNamesForObjectType(schema, objectTypeName);
            if (queryNames) {
              listQueryName = queryNames.listQueryName;
              singleQueryName = queryNames.singleQueryName;
            }
          }
          
          // Get enum values if it's an enum field
          let enumValues: string[] | undefined;
          if (isEnum && fieldType.name) {
            enumValues = getEnumValues(schema, fieldType.name);
          }
          
          // Get current value from item
          const itemValue = item[field.name];
          const currentValue = (itemValue !== undefined && itemValue !== null && typeof itemValue !== 'object') 
            ? itemValue as string | number | boolean | string[]
            : getDefaultValue(actualType, actualType === "Boolean", isList, isObject);
          
          return {
            name: field.name,
            type: actualType,
            required: isNonNull,
            value: currentValue,
            error: undefined,
            isNumeric: actualType === "Int" || actualType === "Float",
            isBoolean: actualType === "Boolean",
            isDate: actualType === "Date" || actualType === "DateTime",
            isList,
            isEnum,
            enumValues,
            isObject,
            objectTypeName,
            descriptionField,
            descriptionFieldType,
            listQueryName,
            singleQueryName,
            isEmbedded: false,
            embeddedFields: [],
            isCollection: false,
            collectionObjectTypeName: undefined,
            connectionField: undefined,
          };
        });
    } catch (error) {
      console.error('Error building form fields:', error);
      return [];
    }
  }, [schemaData, objectTypeName, item, parentEntityType]);

  // Initialize form customization from parent entity
  React.useEffect(() => {
    if (formFields.length > 0) {
      const fieldNames = formFields.map(field => field.name);
      
      // Get the parent entity's customization
      const parentCustomization = getFormCustomization(parentEntityType, "edit");
      
      // Create a flattened customization state for the collection item fields
      const flattenedCustomization: FormCustomization = {};
      
      fieldNames.forEach(fieldName => {
        const collectionItemCustomization = getCollectionItemFieldCustomization(
          parentCustomization || {},
          collectionFieldName,
          objectTypeName,
          fieldName
        );
        
        if (collectionItemCustomization) {
          flattenedCustomization[fieldName] = collectionItemCustomization;
        }
      });
      
      const newCustomizationState: FormCustomizationState = {
        customization: flattenedCustomization,
        fieldVisibility: {},
        fieldEnabled: {},
        fieldOrder: [],
      };
      
      // Initialize field visibility and enabled state
      fieldNames.forEach(fieldName => {
        const fieldCustomization = flattenedCustomization[fieldName];
        const visible = fieldCustomization?.visible;
        const enabled = fieldCustomization?.enabled;
        
        newCustomizationState.fieldVisibility[fieldName] = typeof visible === 'function' ? true : (visible ?? true);
        newCustomizationState.fieldEnabled[fieldName] = typeof enabled === 'function' ? true : (enabled ?? true);
      });
      
      // Create field order
      const fieldOrder = fieldNames.sort((a, b) => {
        const aCustomization = flattenedCustomization[a];
        const bCustomization = flattenedCustomization[b];
        
        if (aCustomization?.order !== undefined && bCustomization?.order !== undefined) {
          return aCustomization.order - bCustomization.order;
        }
        
        if (aCustomization?.order !== undefined) return -1;
        if (bCustomization?.order !== undefined) return 1;
        
        return 0;
      });
      
      newCustomizationState.fieldOrder = fieldOrder;
      setCustomizationState(newCustomizationState);
    }
  }, [formFields, collectionFieldName, objectTypeName, parentEntityType]);

  // Form customization actions
  const customizationActions: FormCustomizationActions = React.useMemo(() => ({
    setFieldData: (fieldName: string, value: string | number | boolean | string[] | null) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], value }
      }));
    },
    setFieldVisible: (fieldName: string, visible: boolean) => {
      setCustomizationState(prev => ({
        ...prev,
        fieldVisibility: { ...prev.fieldVisibility, [fieldName]: visible }
      }));
    },
    setFieldEnabled: (fieldName: string, enabled: boolean) => {
      setCustomizationState(prev => ({
        ...prev,
        fieldEnabled: { ...prev.fieldEnabled, [fieldName]: enabled }
      }));
    },
    setFieldOrder: (fieldOrder: string[]) => {
      setCustomizationState(prev => ({
        ...prev,
        fieldOrder
      }));
    },
  }), []);

  // Handle field change
  const handleFieldChange = (fieldName: string, value: string | number | boolean | string[] | null) => {
    const field = formFields.find(f => f.name === fieldName);
    if (!field) return;

    // Get field customization
    const fieldCustomization = customizationState.customization[fieldName];
    const customOnChange = 'onChange' in fieldCustomization ? fieldCustomization.onChange : undefined;

    if (customOnChange) {
      const result = customOnChange(fieldName, value, formData, customizationActions.setFieldData, customizationActions.setFieldVisible, customizationActions.setFieldEnabled);
      customizationActions.setFieldData(fieldName, result.value as string | number | boolean | string[] | null);
      
      // Handle error if any
      if (result.error) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], error: result.error }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], error: undefined }
        }));
      }
    } else {
      customizationActions.setFieldData(fieldName, value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build updated item data
      const updatedItem: CollectionItem = {
        ...item,
        __status: 'modified' as const,
        __originalData: item.__originalData || { ...item },
      };

      // Add form field values
      formFields.forEach(field => {
        const formField = formData[field.name];
        if (formField) {
          updatedItem[field.name] = formField.value;
        }
      });

      onSave(updatedItem);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get field label
  const getFieldLabel = (fieldName: string): string => {
    return resolveLabel([`${objectTypeName}.${fieldName}`], { entity: objectTypeName, field: fieldName }, fieldName);
  };

  // Render form field
  const renderFormField = (field: FormField) => {
    const fieldCustomization = customizationState.customization[field.name];
    const fieldSize = getCollectionItemFieldSize(
      collectionFieldName,
      objectTypeName,
      field.name,
      getFormCustomization(parentEntityType, "edit") || {},
      { xs: 12, sm: 6, md: 4 }
    );
    const isVisible = isFieldVisible(field.name, customizationState, field.value, formData);
    const isEnabled = isFieldEnabled(field.name, customizationState, field.value, formData);

    if (!isVisible) return null;

    const fieldLabel = getFieldLabel(field.name);
    const formField = formData[field.name] || field;

    if (field.isObject && field.objectTypeName && field.descriptionField && field.listQueryName && field.singleQueryName) {
      return (
        <Grid key={field.name} size={fieldSize}>
          <ObjectFieldSelector
            label={fieldLabel}
            value={formField.value as string | null}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={formField.error}
            required={field.required}
            disabled={!isEnabled}
            objectTypeName={field.objectTypeName}
            descriptionField={field.descriptionField}
            descriptionFieldType={field.descriptionFieldType || "String"}
            listQueryName={field.listQueryName}
            singleQueryName={field.singleQueryName}
          />
        </Grid>
      );
    }

    if (field.isEnum && field.enumValues) {
      return (
        <Grid key={field.name} size={fieldSize}>
          <FormControl fullWidth error={!!formField.error} required={field.required} disabled={!isEnabled}>
            <InputLabel>{fieldLabel}</InputLabel>
            <Select
              value={formField.value || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              label={fieldLabel}
            >
              {field.enumValues.map((enumValue) => (
                <MenuItem key={enumValue} value={enumValue}>
                  {enumValue}
                </MenuItem>
              ))}
            </Select>
            {formField.error && (
              <FormHelperText error>{formField.error}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      );
    }

    if (field.isBoolean) {
      return (
        <Grid key={field.name} size={fieldSize}>
          <FormControl error={!!formField.error}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formField.value as boolean || false}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  disabled={!isEnabled}
                />
              }
              label={fieldLabel}
            />
            {formField.error && (
              <FormHelperText error>{formField.error}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      );
    }

    if (field.isDate) {
      return (
        <Grid key={field.name} size={fieldSize}>
          <TextField
            fullWidth
            label={fieldLabel}
            type="date"
            value={formField.value as string || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            error={!!formField.error}
            helperText={formField.error}
            required={field.required}
            disabled={!isEnabled}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      );
    }

    if (field.isNumeric) {
      return (
        <Grid key={field.name} size={fieldSize}>
          <TextField
            fullWidth
            label={fieldLabel}
            type="number"
            value={formField.value as number || ""}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
            error={!!formField.error}
            helperText={formField.error}
            required={field.required}
            disabled={!isEnabled}
          />
        </Grid>
      );
    }

    // Default text field
    return (
      <Grid key={field.name} size={fieldSize}>
        <TextField
          fullWidth
          label={fieldLabel}
          value={formField.value as string || ""}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          error={!!formField.error}
          helperText={formField.error}
          required={field.required}
          disabled={!isEnabled}
        />
      </Grid>
    );
  };

  // Sort fields by order
  const sortedFields = React.useMemo(() => {
    const fieldOrder = getFieldOrder(customizationState);
    return [...formFields].sort((a, b) => {
      const aIndex = fieldOrder.indexOf(a.name);
      const bIndex = fieldOrder.indexOf(b.name);
      return aIndex - bIndex;
    });
  }, [formFields, customizationState]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit {resolveLabel([`entity.${objectTypeName}.single`], { entity: objectTypeName }, objectTypeName)}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {sortedFields.map(field => renderFormField(field))}
            </Grid>
          </form>
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Helper function to get query names for an object type
function getQueryNamesForObjectType(schema: SchemaData, objectTypeName: string): { listQueryName: string; singleQueryName: string } | null {
  try {
    const listQueryNames = getListEntityFieldNamesOfType(schema, objectTypeName);
    
    if (listQueryNames.length === 0) {
      console.warn(`No list query found for object type: ${objectTypeName}`);
      return null;
    }
    
    const listQueryName = listQueryNames[0];
    const singleQueryName = objectTypeName;
    
    return { listQueryName, singleQueryName };
  } catch (error) {
    console.error(`Error getting query names for object type ${objectTypeName}:`, error);
    return null;
  }
}

// Helper function to check if a field is non-null (required)
function isNonNullField(typeRef: unknown): boolean {
  const current = typeRef as { kind?: string; ofType?: unknown; name?: string };
  return current?.kind === "NON_NULL";
}

// Helper function to get ENUM values from schema
function getEnumValues(schema: SchemaData, enumTypeName: string): string[] {
  const enumType = schema.__schema.types.find(type => type.name === enumTypeName);
  if (enumType?.kind === "ENUM" && enumType.enumValues) {
    return enumType.enumValues.map(enumValue => enumValue.name);
  }
  return [];
}

// Helper function to extract actual scalar type from validated scalar names
function getActualScalarType(typeRef: unknown): string {
  const current = typeRef as { kind?: string; name?: string; ofType?: unknown };
  
  // Unwrap NON_NULL and LIST types
  let unwrapped = current;
  while (unwrapped && (unwrapped.kind === "NON_NULL" || unwrapped.kind === "LIST")) {
    unwrapped = unwrapped.ofType as { kind?: string; name?: string; ofType?: unknown };
  }
  
  const typeName = unwrapped?.name;
  if (!typeName) return "String";
  
  // Handle Simfinity validated scalars (e.g., "SeasonNumber_Int" -> "Int")
  return typeName.includes('_') ? typeName.split('_').pop() || typeName : typeName;
}

// Helper function to get default values
function getDefaultValue(typeName: string | null, isBoolean: boolean, isList: boolean, isObject: boolean): string | number | boolean | string[] | null {
  if (isObject) return null;
  if (isList) return [];
  if (isBoolean) return false;
  if (typeName === "Int" || typeName === "Float") return 0;
  return "";
}
