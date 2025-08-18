"use client";

import * as React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { INTROSPECTION_QUERY, SchemaData, getElementTypeNameOfListField, getTypeByName, isNumericScalarName, isBooleanScalarName, isDateTimeScalarName, isScalarOrEnum } from "@/lib/introspection";
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
  value: string | number | boolean;
  error?: string;
  isNumeric: boolean;
  isBoolean: boolean;
  isDate: boolean;
};

type FormData = Record<string, FormField>;

// Helper function to unwrap named types
function unwrapNamedType(typeRef: unknown): string | null {
  let current = typeRef as { kind?: string; ofType?: unknown; name?: string };
  while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
    current = current.ofType as { kind?: string; ofType?: unknown; name?: string } ?? null;
  }
  return current?.name ?? null;
}

// Helper function to check if a field is non-null (required)
function isNonNullField(typeRef: unknown): boolean {
  const current = typeRef as { kind?: string; ofType?: unknown; name?: string };
  return current?.kind === "NON_NULL";
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
            // Check if this is a list type (we want to exclude list-of-scalar fields)
            let current = field.type as { kind?: string; ofType?: unknown; name?: string };
            const isList = current?.kind === "LIST";
            
            // If it's a list, check if the underlying type is a scalar
            if (isList) {
              while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
                current = current.ofType as { kind?: string; ofType?: unknown; name?: string };
              }
              const underlyingIsScalar = current?.kind && isScalarOrEnum(current.kind);
              // Exclude list-of-scalar fields
              if (underlyingIsScalar) {
                console.log(`Field ${field.name}: EXCLUDED - List of scalar (${current?.name})`);
                return false;
              }
            }
            
            // For non-list fields, check if the underlying type is a scalar
            current = field.type as { kind?: string; ofType?: unknown; name?: string };
            while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
              current = current.ofType as { kind?: string; ofType?: unknown; name?: string };
            }
            const isScalar = current?.kind && isScalarOrEnum(current.kind);
            const isNotId = field.name !== "id";
            console.log(`Field ${field.name}: underlying kind=${current?.kind}, isScalar=${isScalar}, isNotId=${isNotId}, type.kind=${field.type.kind}`);
            return isScalar && isNotId;
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
          
          console.log(`Field ${field.name}: type=${typeName}, isNumeric=${isNumeric}, isBoolean=${isBoolean}, isDate=${isDate}, isRequired=${isRequired}`);
          
          return {
            name: field.name,
            type: typeName || "String",
            isNumeric,
            isBoolean,
            isDate,
            required: isRequired,
            value: getDefaultValue(typeName, isBoolean),
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

  // For now, we'll skip the GraphQL queries and just show the form
  // The actual GraphQL integration can be added later once the form rendering works
  const entityData = null;

  // Initialize form data
  React.useEffect(() => {
    if (formFields.length > 0) {
      const initialData: FormData = {};
      formFields.forEach(field => {
        initialData[field.name] = field;
      });
      setFormData(initialData);
    }
  }, [formFields]);

  // Load existing entity data for edit/view
  React.useEffect(() => {
    if (entityData && action !== "create") {
      const entity = entityData[listField.slice(0, -1)];
      if (entity) {
        setFormData(prevData => {
          const updatedData = { ...prevData };
          formFields.forEach(field => {
            if (entity[field.name] !== undefined) {
              updatedData[field.name] = {
                ...updatedData[field.name],
                value: entity[field.name],
              };
            }
          });
          return updatedData;
        });
      }
    }
  }, [entityData, listField, action, formFields]);

  // Handle field changes
  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
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
        newFormData[field.name] = { ...field, error: "This field is required" };
        isValid = false;
      } else if (field.isNumeric && typeof field.value === "string" && isNaN(Number(field.value))) {
        newFormData[field.name] = { ...field, error: "Must be a valid number" };
        isValid = false;
      } else if (field.isDate && typeof field.value === "string") {
        const timestamp = new Date(String(field.value)).getTime();
        if (isNaN(timestamp)) {
          newFormData[field.name] = { ...field, error: "Must be a valid date" };
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
      const inputData: Record<string, string | number | boolean> = {};
      formFields.forEach(field => {
        inputData[field.name] = field.value;
      });

      if (action === "create") {
        // TODO: Implement create mutation
        console.log('Would create entity with:', inputData);
        setSuccessMessage("Entity created successfully! (Mock)");
      } else if (action === "edit") {
        // TODO: Implement update mutation
        console.log('Would update entity with:', inputData);
        setSuccessMessage("Entity updated successfully! (Mock)");
      }

      // Redirect back to list
      setTimeout(() => {
        router.push(`/entities/${listField}`);
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render form field
  const renderField = (field: FormField) => {
    if (field.isBoolean) {
      return (
        <FormControlLabel
          control={
            <input
              type="checkbox"
              checked={field.value as boolean}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
            />
          }
          label={field.name}
        />
      );
    }

    if (field.isDate) {
      return (
        <TextField
          fullWidth
          label={field.name}
          type="date"
          value={field.value as string}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          error={!!field.error}
          helperText={field.error}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label={field.name}
        type={field.isNumeric ? "number" : "text"}
        value={field.value as string}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        error={!!field.error}
        helperText={field.error}
        required={field.required}
      />
    );
  };

  // Loading states
  if (schemaLoading || !schemaData) {
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href={`/entities/${listField}`} color="inherit">
          {listField}
        </Link>
        <Typography color="text.primary">
          {action === "create" ? "Create" : action === "edit" ? "Edit" : "View"}
        </Typography>
      </Breadcrumbs>

      {/* Title */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        {action === "create" ? "Create" : action === "edit" ? "Edit" : "View"} {listField}
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
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {formFields.map(field => (
              <Box key={field.name}>
                {renderField(field)}
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/entities/${listField}`)}
            >
              Cancel
            </Button>
            {action !== "view" && (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : action === "create" ? "Create" : "Update"}
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
function getDefaultValue(typeName: string | null, isBoolean: boolean): string | number | boolean {
  if (isBoolean) return false;
  if (typeName === "Int" || typeName === "Float") return 0;
  return "";
}
