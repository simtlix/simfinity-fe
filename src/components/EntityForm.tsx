"use client";

import * as React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Grid,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

// GraphQL queries and mutations
const GET_ENTITY_QUERY = gql`
  query GetEntity($id: ID!) {
    entity(id: $id) {
      id
      # Dynamic fields will be added based on schema
    }
  }
`;

const CREATE_ENTITY_MUTATION = gql`
  mutation CreateEntity($input: CreateEntityInput!) {
    createEntity(input: $input) {
      id
      # Dynamic fields will be added based on schema
    }
  }
`;

const UPDATE_ENTITY_MUTATION = gql`
  mutation UpdateEntity($id: ID!, $input: UpdateEntityInput!) {
    updateEntity(id: $id, input: $input) {
      id
      # Dynamic fields will be added based on schema
    }
  }
`;

import { useRouter } from "next/navigation";
import { INTROSPECTION_QUERY, SchemaData, getElementTypeNameOfListField, getTypeByName, isNumericScalarName, isBooleanScalarName, isDateTimeScalarName, isScalarOrEnum, unwrapNamedType, getListEntityFieldNamesOfType } from "@/lib/introspection";
import ObjectFieldSelector from "./ObjectFieldSelector";
import { useI18n } from "@/lib/i18n";

type EntityFormProps = {
  listField: string; // e.g., "series"
  entityId?: string; // undefined for create, string for edit/view
  action: "create" | "edit" | "view"; // action from URL
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
  listQueryName?: string;
  singleQueryName?: string;
};

type FormData = Record<string, FormField>;



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

// Helper function to get query names for an object type
function getQueryNamesForObjectType(schema: SchemaData, objectTypeName: string): { listQueryName: string; singleQueryName: string } | null {
  try {
    // Get the list query names for this object type
    const listQueryNames = getListEntityFieldNamesOfType(schema, objectTypeName);
    
    if (listQueryNames.length === 0) {
      console.warn(`No list query found for object type: ${objectTypeName}`);
      return null;
    }
    
    // Use the first list query name (usually the plural form)
    const listQueryName = listQueryNames[0];
    
    // For single query, use the object type name
    const singleQueryName = objectTypeName;
    
    return { listQueryName, singleQueryName };
  } catch (error) {
    console.error(`Error getting query names for object type ${objectTypeName}:`, error);
    return null;
  }
}

export default function EntityForm({ listField, entityId, action }: EntityFormProps) { 
  const router = useRouter();
  const { resolveLabel } = useI18n();
  const [formData, setFormData] = React.useState<FormData>({} as FormData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Get schema data to understand entity structure
  const { data: schemaData, loading: schemaLoading } = useQuery(INTROSPECTION_QUERY);

  // Build form fields based on schema first
  const formFields = React.useMemo(() => {
    if (!schemaData) {
      console.log('No schema data available');
      return [];
    }
    
    try {
      const schema = schemaData as SchemaData;
      console.log('Schema data:', schema);
      
      const entityTypeName = getElementTypeNameOfListField(schema, listField);
      if (!entityTypeName) {
        console.log('No entity type found for listField:', listField);
        return [];
      }
      
      console.log('Entity type name:', entityTypeName);
      
      const entityType = getTypeByName(schema, entityTypeName);
      if (!entityType?.fields) {
        console.log('No entity type or fields found:', entityType);
        return [];
      }
      
      console.log('Entity type fields:', entityType.fields);
      
      const filteredFields = entityType.fields
        .filter(field => {
          try {
            const isNotId = field.name !== "id";
            if (!isNotId) return false;
            
            // Check if this is a list type
            let current = field.type as { kind?: string; ofType?: unknown; name?: string };
            const isList = current?.kind === "LIST";
            
            if (isList) {
              // For list fields, check if the underlying type is a scalar
              while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
                current = current.ofType as { kind?: string; ofType?: unknown; name?: string };
              }
              const underlyingIsScalar = current?.kind && isScalarOrEnum(current.kind);
              // Include list-of-scalar fields for tag input
              if (underlyingIsScalar) {
                console.log(`Field ${field.name}: INCLUDED - List of scalar (${current?.name}) for tag input`);
                return true;
              }
            } else {
              // For non-list fields, check if the underlying type is a scalar or object
              current = field.type as { kind?: string; ofType?: unknown; name?: string };
              while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
                current = current.ofType as { kind?: string; ofType?: unknown; name?: string };
              }
              const isScalar = current?.kind && isScalarOrEnum(current.kind);
              const isObject = current?.kind === "OBJECT";
              
              // Exclude embedded object fields
              const isEmbedded = field.extensions?.relation?.embedded === true;
              const shouldIncludeObject = isObject && !isEmbedded;
              
              console.log(`Field ${field.name}: underlying kind=${current?.kind}, isScalar=${isScalar}, isObject=${isObject}, isEmbedded=${isEmbedded}, shouldIncludeObject=${shouldIncludeObject}, isNotId=${isNotId}, type.kind=${field.type.kind}`);
              return isScalar || shouldIncludeObject;
            }
            
            return false;
          } catch (error) {
            console.error(`Error filtering field ${field.name}:`, error);
            return false;
          }
        });
      
      console.log('Filtered fields:', filteredFields);
      
      const processedFields = filteredFields.map(field => {
        try {
          const typeName = unwrapNamedType(field.type);
          const isNumeric = isNumericScalarName(typeName);
          const isBoolean = isBooleanScalarName(typeName);
          const isDate = isDateTimeScalarName(typeName);
          const isRequired = isNonNullField(field.type);
          const isList = field.type.kind === "LIST";
          
          // Check if this is an ENUM type
          let current = field.type as { kind?: string; ofType?: unknown; name?: string };
          while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
            current = current.ofType as { kind?: string; ofType?: unknown; name?: string };
          }
          const isEnum = current?.kind === "ENUM";
          const enumValues = isEnum && typeName ? getEnumValues(schema, typeName) : undefined;
          
          // Check if this is an OBJECT type (non-list)
          const isObject = current?.kind === "OBJECT" && !isList;
          const objectTypeName = isObject && typeName && typeName !== null ? typeName : undefined;
          const descriptionField = isObject && field.extensions?.relation?.displayField ? 
            field.extensions.relation.displayField : "name";
          
          // Get query names for object types
          const queryNames = isObject && objectTypeName ? getQueryNamesForObjectType(schema, objectTypeName) : null;
          const listQueryName = queryNames?.listQueryName;
          const singleQueryName = queryNames?.singleQueryName;
          
          // Check if the object field is non-null (required)
          const isObjectRequired = isObject && isNonNullField(field.type);
          
          console.log(`Field ${field.name}: type=${typeName}, isNumeric=${isNumeric}, isBoolean=${isBoolean}, isDate=${isDate}, isRequired=${isRequired}, isList=${isList}, isEnum=${isEnum}, isObject=${isObject}, objectTypeName=${objectTypeName}, descriptionField=${descriptionField}`);
          
          return {
            name: field.name,
            type: typeName || "String",
            isNumeric,
            isBoolean,
            isDate,
            isList,
            isEnum,
            enumValues,
            isObject,
            objectTypeName,
            descriptionField,
            listQueryName,
            singleQueryName,
            required: isObject ? isObjectRequired : isRequired,
            value: getDefaultValue(typeName, isBoolean, isList, isObject),
            error: undefined,
          };
        } catch (error) {
          console.error(`Error processing field ${field.name}:`, error);
          return null;
        }
      });
      
      return processedFields.filter((field): field is NonNullable<typeof field> => field !== null);
    } catch (error) {
      console.error('Error building form fields:', error);
      return [];
    }
  }, [schemaData, listField]);

  // For now, we'll skip the dynamic GraphQL queries and just show the form
  // The actual GraphQL integration can be added later once the form rendering works
  const queriesReady = true;

  // Helper function to get i18n label for form fields
  const getFieldLabel = (fieldName: string): string => {
    // Try to get the label using the entity.field pattern (e.g., "serie.name")
    const entityKey = listField.slice(0, -1); // Remove 's' from end
    const fieldKey = `${entityKey}.${fieldName}`;
    
    return resolveLabel([fieldKey, fieldName], { entity: listField, field: fieldName }, fieldName);
  };

  // Generate dynamic GraphQL queries based on schema
  const generateQueries = React.useMemo(() => {
    if (!formFields.length) return null;
    
    // Build field selections including object field details
    const fieldSelections = formFields.map(field => {
      if (field.isObject && field.objectTypeName && field.descriptionField) {
        // For object fields, include the object with id and description field
        return `${field.name} {
            id
            ${field.descriptionField}
          }`;
      }
      return field.name;
    });
    
    const fieldNames = fieldSelections.join('\n      ');
    const entityName = listField.slice(0, -1); // Remove 's' from end
    
    console.log('Generating queries for:', { entityName, fieldNames, formFields: formFields.map(f => ({ name: f.name, isObject: f.isObject, objectTypeName: f.objectTypeName })) });
    
    const getQuery = gql`
      query Get${entityName.charAt(0).toUpperCase() + entityName.slice(1)}($id: ID!) {
        ${entityName}(id: $id) {
          id
          ${fieldNames}
        }
      }
    `;
    
    const createMutation = gql`
      mutation Create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}($input: Create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Input!) {
        create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}(input: $input) {
          id
          ${fieldNames}
        }
      }
    `;
    
    const updateMutation = gql`
      mutation Update${entityName.charAt(0).toUpperCase() + entityName.slice(1)}($id: ID!, $input: Update${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Input!) {
        update${entityName.charAt(0).toUpperCase() + entityName.slice(1)}(id: $id, input: $input) {
          id
          ${fieldNames}
        }
      }
    `;
    
    console.log('Generated getQuery:', getQuery.loc?.source.body);
    
    return { getQuery, createMutation, updateMutation };
  }, [formFields, listField]);

  // Fetch entity data for edit/view mode
  const { data: entityData, loading: entityLoading, error: entityError } = useQuery(
    generateQueries?.getQuery || GET_ENTITY_QUERY,
    {
      variables: { id: entityId },
      skip: !entityId || !generateQueries?.getQuery || action === "create",
    }
  );

  console.log('Query execution:', {
    entityId,
    action,
    skip: !entityId || !generateQueries?.getQuery || action === "create",
    entityData,
    entityLoading,
    entityError,
    hasQuery: !!generateQueries?.getQuery
  });

  // Mutations for create and update
  const [createEntity, { loading: createLoading }] = useMutation(
    generateQueries?.createMutation || CREATE_ENTITY_MUTATION
  );
  
  const [updateEntity, { loading: updateLoading }] = useMutation(
    generateQueries?.updateMutation || UPDATE_ENTITY_MUTATION
  );

  // Initialize form data
  React.useEffect(() => {
    if (formFields.length > 0) {
      // Only initialize if we don't have any form data yet or if we're in create mode
      setFormData(prevData => {
        if (Object.keys(prevData).length === 0 || action === "create") {
          const initialData: FormData = {};
          formFields.forEach(field => {
            initialData[field.name] = field;
          });
          console.log('Initializing form data with:', initialData);
          return initialData;
        }
        return prevData;
      });
    }
  }, [formFields, action]);

  // Load existing entity data for edit/view
  React.useEffect(() => {
    console.log('Data loading effect triggered:', { entityData, action, listField, formFields });
    
    if (entityData && action !== "create" && formFields.length > 0) {
      const entityName = listField.slice(0, -1); // Remove 's' from end
      console.log('Looking for entity with name:', entityName);
      console.log('Available keys in entityData:', Object.keys(entityData));
      
      const entity = entityData[entityName];
      console.log('Found entity:', entity);
      
      if (entity) {
        console.log('Entity fields:', Object.keys(entity));
        console.log('Form fields:', formFields.map(f => f.name));
        
        const updatedData: FormData = {};
        formFields.forEach(field => {
          console.log(`Checking field ${field.name}:`, entity[field.name]);
          if (entity[field.name] !== undefined) {
            let fieldValue = entity[field.name];
            
            // Handle object fields - extract the ID
            if (field.isObject && fieldValue && typeof fieldValue === 'object' && 'id' in fieldValue) {
              fieldValue = fieldValue.id;
            }
            
            updatedData[field.name] = {
              ...field,
              value: fieldValue,
            };
            console.log(`Updated field ${field.name} with value:`, fieldValue);
          } else {
            updatedData[field.name] = field;
          }
        });
        console.log('Final updated data:', updatedData);
        setFormData(updatedData);
      }
    }
  }, [entityData, listField, action, formFields]);

  // Handle field changes
  const handleFieldChange = (fieldName: string, value: string | number | boolean | string[] | null) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value: value === null ? "" : value,
        error: undefined,
      },
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newFormData = { ...formData };

    formFields.forEach(field => {
      if (field.required && (field.value === "" || field.value === null || field.value === undefined)) {
        newFormData[field.name] = { ...field, error: resolveLabel(["form.required"], { entity: listField }, "This field is required") };
        isValid = false;
      } else if (field.isObject && field.required && (!field.value || field.value === "" || field.value === null)) {
        newFormData[field.name] = { ...field, error: resolveLabel(["form.required"], { entity: listField }, "This field is required") };
        isValid = false;
      } else if (field.isNumeric && typeof field.value === "string" && isNaN(Number(field.value))) {
        newFormData[field.name] = { ...field, error: resolveLabel(["form.invalidNumber"], { entity: listField }, "Must be a valid number") };
        isValid = false;
      } else if (field.isDate && typeof field.value === "string") {
        const timestamp = new Date(String(field.value)).getTime();
        if (isNaN(timestamp)) {
          newFormData[field.name] = { ...field, error: resolveLabel(["form.invalidDate"], { entity: listField }, "Must be a valid date") };
          isValid = false;
        }
      }
    });

    setFormData(newFormData);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const inputData: Record<string, string | number | boolean | string[] | null> = {};
      formFields.forEach(field => {
        inputData[field.name] = field.value;
      });

      if (action === "create") {
        const result = await createEntity({
          variables: { input: inputData }
        });
        console.log('Entity created:', result.data);
        setSuccessMessage(resolveLabel(["form.successCreated"], { entity: listField }, "Entity created successfully!"));
      } else if (action === "edit") {
        const result = await updateEntity({
          variables: { id: entityId, input: inputData }
        });
        console.log('Entity updated:', result.data);
        setSuccessMessage(resolveLabel(["form.successUpdated"], { entity: listField }, "Entity updated successfully!"));
      }

      // Redirect back to list
      setTimeout(() => {
        router.push(`/entities/${listField}`);
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : resolveLabel(["form.errorOccurred"], { entity: listField }, "An error occurred");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render form field
  const renderField = (field: FormField) => {
    console.log(`Rendering field ${field.name} with value:`, field.value, 'from formData:', formData[field.name]?.value);
    const fieldLabel = getFieldLabel(field.name);
    const isViewMode = action === "view";
    
    if (field.isObject && field.objectTypeName && field.descriptionField && field.listQueryName && field.singleQueryName) {
      return (
        <ObjectFieldSelector
          label={fieldLabel}
          value={field.value as string}
          onChange={(value) => handleFieldChange(field.name, value)}
          error={field.error}
          required={field.required}
          disabled={isViewMode}
          objectTypeName={field.objectTypeName}
          descriptionField={field.descriptionField}
          listQueryName={field.listQueryName}
          singleQueryName={field.singleQueryName}
        />
      );
    }
    
    if (field.isEnum && field.enumValues) {
      return (
        <FormControl fullWidth error={!!field.error}>
          <InputLabel>{fieldLabel}</InputLabel>
          <Select
            value={field.value as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            label={fieldLabel}
            required={field.required}
            disabled={isViewMode}
          >
            {field.enumValues.map((enumValue) => (
              <MenuItem key={enumValue} value={enumValue}>
                {enumValue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    
    if (field.isList) {
      return (
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={field.value as string[]}
          onChange={(_, newValue) => handleFieldChange(field.name, newValue)}
          disabled={isViewMode}
          slotProps={{
            chip: {
              variant: "outlined"
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={fieldLabel}
              error={!!field.error}
              helperText={field.error}
              required={field.required}
            />
          )}
        />
      );
    }
    
    if (field.isBoolean) {
      return (
        <FormControlLabel
          control={
            <input
              type="checkbox"
              checked={field.value as boolean}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={isViewMode}
            />
          }
          label={fieldLabel}
        />
      );
    }

    if (field.isDate) {
      // Format date value for date input (YYYY-MM-DD)
      const formatDateForInput = (dateValue: string | number | boolean | string[] | null): string => {
        if (!dateValue || typeof dateValue !== 'string') return '';
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch {
          return '';
        }
      };

      return (
        <TextField
          fullWidth
          label={fieldLabel}
          type="date"
          value={formatDateForInput(field.value)}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          error={!!field.error}
          helperText={field.error}
          required={field.required}
          disabled={isViewMode}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label={fieldLabel}
        type={field.isNumeric ? "number" : "text"}
        value={field.value as string}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        error={!!field.error}
        helperText={field.error}
        required={field.required}
        disabled={isViewMode}
      />
    );
  };

  // Loading states
  if (schemaLoading || !schemaData || entityLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (formFields.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography variant="h6" color="error">
          No form fields available for {listField}. Please check the schema configuration.
        </Typography>
      </Box>
    );
  }

  if (!queriesReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography variant="h6" color="error">
          GraphQL queries not available. Please check the schema configuration.
        </Typography>
      </Box>
    );
  }

  console.log('Current formData state:', formData);
  console.log('Form fields to render:', formFields.map(f => ({ name: f.name, value: f.value })));

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href={`/entities/${listField}`} color="inherit">
          {resolveLabel([listField], { entity: listField }, listField)}
        </Link>
        <Typography color="text.primary">
          {action === "create" 
            ? resolveLabel(["form.create"], { entity: listField }, "Create")
            : action === "edit" 
            ? resolveLabel(["form.edit"], { entity: listField }, "Edit")
            : resolveLabel(["form.view"], { entity: listField }, "View")
          }
        </Typography>
      </Breadcrumbs>

      {/* Title */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        {action === "create" 
          ? resolveLabel(["form.create"], { entity: listField }, "Create")
          : action === "edit" 
          ? resolveLabel(["form.edit"], { entity: listField }, "Edit")
          : resolveLabel(["form.view"], { entity: listField }, "View")
        } {resolveLabel([listField], { entity: listField }, listField)}
      </Typography>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} >
            {formFields.map(field => (
              <Grid key={field.name} size={{ xs: 12, sm: 6, md: 4 }} >
                {renderField(formData[field.name] || field)}
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/entities/${listField}`)}
            >
              {resolveLabel(["form.cancel"], { entity: listField }, "Cancel")}
            </Button>
            {action !== "view" && (
              <Button
                type="submit"
                variant="contained"
                disabled={loading || createLoading || updateLoading}
              >
                {loading || createLoading || updateLoading ? <CircularProgress size={20} /> : action === "create" 
                  ? resolveLabel(["form.create"], { entity: listField }, "Create")
                  : resolveLabel(["form.update"], { entity: listField }, "Update")
                }
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {/* Snackbar for success messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Helper function to get default values
function getDefaultValue(typeName: string | null, isBoolean: boolean, isList: boolean, isObject: boolean): string | number | boolean | string[] | null {
  if (isObject) return null;
  if (isList) return [];
  if (isBoolean) return false;
  if (typeName === "Int" || typeName === "Float") return 0;
  return "";
}
