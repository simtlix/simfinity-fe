"use client";

import * as React from "react";
import { useQuery, useMutation, gql, useApolloClient } from "@apollo/client";
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
  FormHelperText,
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
import CollectionFieldGrid, { CollectionFieldState, CollectionItem } from "./CollectionFieldGrid";
import { useCollectionState } from "@/hooks/useCollectionState";
import { useI18n } from "@/lib/i18n";
import FormFieldRenderer from "./FormFieldRenderer";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  getEmbeddedFieldSize
} from "@/lib/formCustomization";

type EntityFormProps = {
  listField: string; // e.g., "series"
  entityId?: string; // undefined for create, string for edit/view
  action: "create" | "edit" | "view"; // action from URL
};

type FormField = {
  name: string;
  type: string;
  required: boolean;
  value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown };
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
  descriptionFieldType?: string; // The type of the description field
  listQueryName?: string;
  singleQueryName?: string;
  isEmbedded?: boolean; // Whether this field is an embedded object
  embeddedFields?: FormField[]; // Fields within the embedded object
  isCollection?: boolean; // Whether this field is a collection of objects
  collectionObjectTypeName?: string; // The type name of objects in the collection
  connectionField?: string; // The field name used to connect to the parent entity
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



// Helper function to get the type of a field in an object type
function getDescriptionFieldType(schema: SchemaData, objectTypeName: string, descriptionField: string): string {
  try {
    const objectType = getTypeByName(schema, objectTypeName);
    if (!objectType?.fields) return "String";
    
    const field = objectType.fields.find(f => f.name === descriptionField);
    if (!field) return "String";
    
    // Unwrap the type to handle NON_NULL and LIST wrappers
    const typeName = unwrapNamedType(field.type);
    return typeName || "String";
  } catch (error) {
    console.error(`Error getting description field type for ${objectTypeName}.${descriptionField}:`, error);
    return "String";
  }
}

// Helper function to process embedded object fields
function processEmbeddedObjectFields(schema: SchemaData, objectTypeName: string, parentFieldName: string): FormField[] {
  try {
    const objectType = getTypeByName(schema, objectTypeName);
    if (!objectType?.fields) return [];
    
    return objectType.fields
      .filter(field => field.name !== "id") // Exclude id fields from embedded objects since they don't have IDs
      .map(field => {
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
          
          return {
            name: `${parentFieldName}.${field.name}`,
            type: typeName || "String",
            isNumeric,
            isBoolean,
            isDate,
            isList,
            isEnum,
            enumValues,
            isObject: false, // Embedded fields are not objects themselves
            required: isRequired,
            value: getDefaultValue(typeName, isBoolean, isList, false),
            error: undefined,
          };
        } catch (error) {
          console.error(`Error processing embedded field ${field.name}:`, error);
          return null;
        }
      })
      .filter((field): field is NonNullable<typeof field> => field !== null);
  } catch (error) {
    console.error(`Error processing embedded object fields for ${objectTypeName}:`, error);
    return [];
  }
}

export default function EntityForm({ listField, entityId, action }: EntityFormProps) { 
  const router = useRouter();
  const { resolveLabel } = useI18n();
  const client = useApolloClient();
  const [formData, setFormData] = React.useState<FormData>({} as FormData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Form customization state
  const [customizationState, setCustomizationState] = React.useState<FormCustomizationState>({
    customization: {},
    fieldVisibility: {},
    fieldEnabled: {},
    fieldOrder: [],
  });

  // Get schema data to understand entity structure
  const { data: schemaData, loading: schemaLoading } = useQuery(INTROSPECTION_QUERY);

  // Get entity type name for use throughout the component
  const entityTypeName = React.useMemo(() => {
    if (!schemaData) return null;
    return getElementTypeNameOfListField(schemaData as SchemaData, listField);
  }, [schemaData, listField]);

  // Collection state management
  const { 
    updateCollectionState, 
    getCollectionState,
    getCollectionChanges 
  } = useCollectionState();

  // Helper function to get entity name from i18n
  const getEntityName = React.useCallback((pluralName: string, form: 'single' | 'plural'): string => {
    if (!schemaData) return `entity.${pluralName}.${form}`;
    
    // Get the proper entity type name from schema
    const entityTypeName = getElementTypeNameOfListField(schemaData as SchemaData, pluralName);
    if (!entityTypeName) return `entity.${pluralName}.${form}`;
    
    // Convert to lowercase for i18n key
    const baseName = entityTypeName.toLowerCase();
    
    return `entity.${baseName}.${form}`;
  }, [schemaData]);

  // Form customization actions
  const customizationActions: FormCustomizationActions = React.useMemo(() => ({
    setFieldData: (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => {
      // Check if this is an embedded field (contains a dot)
      if (fieldName.includes('.')) {
        const [parentField, embeddedField] = fieldName.split('.');
        const fullFieldName = `${parentField}.${embeddedField}`;
        
        setFormData(prev => ({
          ...prev,
          [fullFieldName]: { 
            ...prev[fullFieldName], 
            value: value === null ? "" : value 
          }
        }));
      } else {
        // Regular field
        setFormData(prev => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], value }
        }));
      }
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
        console.log('No entity type name:', entityTypeName);
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
              // For list fields, check if the underlying type is a scalar or object
              while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
                current = current.ofType as { kind?: string; ofType?: unknown; name?: string };
              }
              const underlyingIsScalar = current?.kind && isScalarOrEnum(current.kind);
              const underlyingIsObject = current?.kind === "OBJECT";
              
              // Include list-of-scalar fields for tag input
              if (underlyingIsScalar) {
                console.log(`Field ${field.name}: INCLUDED - List of scalar (${current?.name}) for tag input`);
                return true;
              }
              
              // Include list-of-object fields for collection grid rendering
              if (underlyingIsObject) {
                console.log(`Field ${field.name}: INCLUDED - List of object (${current?.name}) for collection grid`);
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
              
              // Include embedded object fields for section rendering
              const isEmbedded = field.extensions?.relation?.embedded === true;
              const shouldIncludeObject = isObject && !isEmbedded;
              const shouldIncludeEmbedded = isObject && isEmbedded;
              
              console.log(`Field ${field.name}: underlying kind=${current?.kind}, isScalar=${isScalar}, isObject=${isObject}, isEmbedded=${isEmbedded}, shouldIncludeObject=${shouldIncludeObject}, shouldIncludeEmbedded=${shouldIncludeEmbedded}, isNotId=${isNotId}, type.kind=${field.type.kind}`);
              return isScalar || shouldIncludeObject || shouldIncludeEmbedded;
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
          
          // Check if this is a COLLECTION type (list of objects)
          const isCollection = isList && current?.kind === "OBJECT";
          const collectionObjectTypeName = isCollection && typeName && typeName !== null ? typeName : undefined;
          let connectionField = isCollection && field.extensions?.relation?.connectionField ? 
            field.extensions.relation.connectionField : undefined;
          
          // Fallback: try to derive connectionField if not explicitly defined
          if (isCollection && !connectionField && collectionObjectTypeName) {
            // Common patterns: if the collection is named 'seasons', the connection field might be 'serie'
            // or if it's 'stars', it might be 'serie' as well
            const entityName = listField.slice(0, -1); // Remove 's' from end (e.g., 'series' -> 'serie')
            
            // For now, let's use the entity name as a fallback
            connectionField = entityName;
            console.log(`Collection field ${field.name}: Using fallback connectionField: ${connectionField}`);
          }
          
          // Debug collection field detection
          if (isCollection) {
            console.log(`Collection field ${field.name}:`, {
              typeName,
              extensions: field.extensions,
              connectionField,
              relation: field.extensions?.relation
            });
          }
          
          // Get description field type for object types
          const descriptionFieldType = isObject && objectTypeName && descriptionField ? 
            getDescriptionFieldType(schema, objectTypeName, descriptionField) : undefined;
          
          // Get query names for object types
          const queryNames = isObject && objectTypeName ? getQueryNamesForObjectType(schema, objectTypeName) : null;
          const listQueryName = queryNames?.listQueryName;
          const singleQueryName = queryNames?.singleQueryName;
          
          // Check if the object field is non-null (required)
          const isObjectRequired = isObject && isNonNullField(field.type);
          
          // Check if this is an embedded object field
          const isEmbedded = field.extensions?.relation?.embedded === true;
          const embeddedFields = isEmbedded && objectTypeName ? 
            processEmbeddedObjectFields(schema, objectTypeName, field.name) : undefined;
          
          console.log(`Field ${field.name}: type=${typeName}, isNumeric=${isNumeric}, isBoolean=${isBoolean}, isDate=${isDate}, isRequired=${isRequired}, isList=${isList}, isEnum=${isEnum}, isObject=${isObject}, isEmbedded=${isEmbedded}, isCollection=${isCollection}, objectTypeName=${objectTypeName}, descriptionField=${descriptionField}, collectionObjectTypeName=${collectionObjectTypeName}, connectionField=${connectionField}`);
          
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
            descriptionFieldType,
            listQueryName,
            singleQueryName,
            isEmbedded,
            embeddedFields,
            isCollection,
            collectionObjectTypeName,
            connectionField,
            required: isObject ? isObjectRequired : isRequired,
            value: getDefaultValue(typeName || "String", isBoolean, isList, isObject),
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

  // Initialize customization state when formFields change
  React.useEffect(() => {
    if (formFields.length > 0) {
      const entityTypeName = getElementTypeNameOfListField(schemaData as SchemaData, listField);
      if (entityTypeName) {
        const fieldNames = formFields.map(field => field.name);
        const newCustomizationState = createFormCustomizationState(entityTypeName, action, fieldNames);
        setCustomizationState(newCustomizationState);
        console.log('Initialized customization state for', entityTypeName, ':', newCustomizationState);
      }
    }
  }, [formFields, schemaData, listField, action]);

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
    
    // Build field selections including object field details, but EXCLUDE collection fields
    const fieldSelections = formFields
      .filter(field => !field.isCollection) // Exclude collection fields from main query
      .map(field => {
        if (field.isObject && field.objectTypeName && field.descriptionField) {
          if (field.isEmbedded) {
            // For embedded objects, include all fields that are rendered in the form
            const embeddedFieldNames = field.embeddedFields?.map(ef => ef.name.replace(`${field.name}.`, '')) || [];
            console.log(`Embedded object ${field.name}: including fields:`, embeddedFieldNames);
            return `${field.name} {
              ${embeddedFieldNames.join('\n            ')}
            }`;
          } else {
            // For non-embedded objects, include id for proper object reference
            return `${field.name} {
              id
              ${field.descriptionField}
            }`;
          }
        }
        return field.name;
      });
    
    const fieldNames = fieldSelections.join('\n      ');
    const entityName = listField.slice(0, -1); // Remove 's' from end
    
    console.log('Generating queries for:', { 
      entityName, 
      fieldNames, 
      includedFields: formFields.filter(f => !f.isCollection).map(f => ({ name: f.name, isObject: f.isObject, objectTypeName: f.objectTypeName })),
      excludedCollectionFields: formFields.filter(f => f.isCollection).map(f => ({ name: f.name, collectionObjectTypeName: f.collectionObjectTypeName, connectionField: f.connectionField }))
    });
    
    const getQuery = gql`
      query Get${entityName.charAt(0).toUpperCase() + entityName.slice(1)}($id: ID!) {
        ${entityName}(id: $id) {
          id
          ${fieldNames}
        }
      }
    `;
    
    const createMutation = gql`
      mutation Create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}($input: ${entityName}InputForCreate!) {
        create${entityName}(input: $input) {
          id
          ${fieldNames}
        }
      }
    `;
    
    const updateMutation = gql`
      mutation Update${entityName.charAt(0).toUpperCase() + entityName.slice(1)}($input: ${entityName}InputForUpdate!) {
        update${entityName}(input: $input) {
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
            
            // Handle object fields - extract the ID for non-embedded objects
            if (field.isObject && !field.isEmbedded && fieldValue && typeof fieldValue === 'object' && 'id' in fieldValue) {
              fieldValue = fieldValue.id;
            }
            
            updatedData[field.name] = {
              ...field,
              value: fieldValue,
            };
            console.log(`Updated field ${field.name} with value:`, fieldValue);
            
            // Handle embedded object fields - populate their nested fields
            if (field.isEmbedded && field.embeddedFields && fieldValue && typeof fieldValue === 'object') {
              console.log(`Processing embedded object ${field.name}:`, fieldValue);
              field.embeddedFields.forEach(embeddedField => {
                const embeddedFieldName = embeddedField.name.replace(`${field.name}.`, '');
                const embeddedFieldValue = fieldValue[embeddedFieldName];
                
                console.log(`Embedded field ${embeddedField.name}: extracted name = ${embeddedFieldName}, value = ${embeddedFieldValue}`);
                
                if (embeddedFieldValue !== undefined) {
                  updatedData[embeddedField.name] = {
                    ...embeddedField,
                    value: embeddedFieldValue,
                  };
                  console.log(`Updated embedded field ${embeddedField.name} with value:`, embeddedFieldValue);
                } else {
                  updatedData[embeddedField.name] = embeddedField;
                  console.log(`Embedded field ${embeddedField.name} not found in data, using default`);
                }
              });
            }
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
  const handleFieldChange = (fieldName: string, value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }, error?: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value: value === null ? "" : value,
        error: error,
      },
    }));
  };

  // Handle embedded field changes
  const handleEmbeddedFieldChange = (parentFieldName: string, embeddedFieldName: string, value: string | number | boolean | string[] | null, error?: string) => {
    const fullFieldName = `${parentFieldName}.${embeddedFieldName}`;
    setFormData(prev => ({
      ...prev,
      [fullFieldName]: {
        ...prev[fullFieldName],
        value: value === null ? "" : value,
        error: error,
      },
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newFormData = { ...formData };

    formFields.forEach(field => {
      // Get the actual field data from formData (user input) instead of the field definition
      const fieldData = formData[field.name];
      if (!fieldData) return; // Skip if field data not found
      
      const fieldValue = fieldData.value;
      
      if (field.required && (fieldValue === "" || fieldValue === null || fieldValue === undefined)) {
        newFormData[field.name] = { ...field, error: resolveLabel(["form.required"], { entity: listField }, "This field is required") };
        isValid = false;
      } else if (field.isObject && field.required && (!fieldValue || fieldValue === "" || fieldValue === null)) {
        newFormData[field.name] = { ...fieldData, error: resolveLabel(["form.required"], { entity: listField }, "This field is required") };
        isValid = false;
      } else if (field.isNumeric && typeof fieldValue === "string" && isNaN(Number(fieldValue))) {
        newFormData[field.name] = { ...fieldData, error: resolveLabel(["form.invalidNumber"], { entity: listField }, "Must be a valid number") };
        isValid = false;
      } else if (field.isDate && typeof fieldValue === "string") {
        const timestamp = new Date(String(fieldValue)).getTime();
        if (isNaN(timestamp)) {
          newFormData[field.name] = { ...fieldData, error: resolveLabel(["form.invalidDate"], { entity: listField }, "Must be a valid date") };
          isValid = false;
        }
      }
    });

    setFormData(newFormData);
    return isValid;
  };

  // Clean object fields within collection items to only keep ID for non-embedded objects
  const cleanCollectionItemObjectFields = React.useCallback((item: CollectionItem, collectionField: FormField, schema: SchemaData): CollectionItem => {
    const cleanItem = { ...item };
    
    // Use the collection field information to get the object type
    const objectTypeName = collectionField.collectionObjectTypeName;
    if (!objectTypeName) {
      console.warn('No collection object type name found for field:', collectionField.name);
      return cleanItem;
    }
    
    // Find the actual object type from schema
    const objectType = schema.__schema.types.find(type => 
      type.name === objectTypeName
    );
    
    if (objectType && objectType.fields) {
      console.log(`Cleaning object fields for collection item type: ${objectTypeName}`);
      
      objectType.fields.forEach(fieldDef => {
        const fieldName = fieldDef.name;
        const fieldValue = cleanItem[fieldName];
        
        if (fieldValue && typeof fieldValue === 'object' && fieldValue !== null) {
          // Check if this is an object field (not embedded)
          const fieldType = fieldDef.type;
          let current = fieldType as { kind?: string; ofType?: unknown; name?: string };
          
          // Unwrap NON_NULL and LIST wrappers to get the underlying type
          while (current && current.kind && (current.kind === "NON_NULL" || current.kind === "LIST")) {
            current = current.ofType as { kind?: string; ofType?: unknown; name?: string };
          }
          
          const isObject = current?.kind === "OBJECT";
          const isEmbedded = fieldDef.extensions?.relation?.embedded === true;
          
          console.log(`Field ${fieldName}: isObject=${isObject}, isEmbedded=${isEmbedded}, type=${current?.name}`);
          
          if (isObject && !isEmbedded && 'id' in fieldValue) {
            // For non-embedded object fields, only keep the ID and remove __typename
            const cleanedObject = { id: (fieldValue as { id: string }).id };
            
            // Remove __typename if it exists
            if ('__typename' in fieldValue) {
              console.log(`🗑️ Removed __typename from object field ${fieldName}`);
            }
            
            cleanItem[fieldName] = cleanedObject;
            console.log(`✅ Cleaned object field ${fieldName} in collection item:`, { 
              fieldName, 
              originalValue: fieldValue, 
              cleanedValue: cleanedObject,
              removedTypename: '__typename' in fieldValue,
              isNonNull: fieldDef.type.kind === "NON_NULL",
              underlyingType: current?.name
            });
          } else if (isObject && isEmbedded) {
            console.log(`🔒 Keeping embedded object field ${fieldName} as-is:`, fieldValue);
          } else if (!isObject) {
            console.log(`📝 Field ${fieldName} is not an object type:`, current?.kind);
          }
        }
      });
    } else {
      console.warn(`Object type ${objectTypeName} not found in schema or has no fields`);
    }
    
    return cleanItem;
  }, []);

  // Recursively clean object fields and remove _typename from nested structures
  const deepCleanCollectionItem = React.useCallback((item: unknown): unknown => {
    if (typeof item !== 'object' || item === null) {
      return item;
    }
    
    // If it's an array, clean each item
    if (Array.isArray(item)) {
      return item.map(deepCleanCollectionItem);
    }
    
    // If it's an object, clean it recursively
    const cleanedItem = { ...item } as Record<string, unknown>;
    
    // Remove __typename from the current level
    if ('__typename' in cleanedItem) {
      console.log(`🗑️ Removed __typename from collection item level`);
      delete cleanedItem.__typename;
    }
    
    // Recursively clean nested properties
    Object.keys(cleanedItem).forEach(key => {
      const value = cleanedItem[key];
      if (typeof value === 'object' && value !== null) {
        cleanedItem[key] = deepCleanCollectionItem(value);
      }
    });
    
    return cleanedItem;
  }, []);

  // Transform collection data for Simfinity mutation
  const transformCollectionDataForMutation = React.useCallback((collectionChanges: Record<string, CollectionFieldState>): Record<string, unknown> => {
    const transformedCollections: Record<string, unknown> = {};
    
    Object.entries(collectionChanges).forEach(([fieldName, changes]) => {
      const field = formFields.find(f => f.name === fieldName);
      if (field && field.isCollection) {
        const transformedCollection: Record<string, unknown> = {};
        
        // Handle added items - remove connection field and __status metadata, clean object fields
        if (changes.added && changes.added.length > 0) {
          transformedCollection.added = changes.added.map((item: CollectionItem) => {
            let cleanItem = { ...item };
            // Remove metadata fields
            delete cleanItem.__status;
            delete cleanItem.__originalData;
            // Remove connection field if present
            if (field.connectionField && cleanItem[field.connectionField] !== undefined) {
              delete cleanItem[field.connectionField];
            }
            // Clean object fields within the item
            cleanItem = cleanCollectionItemObjectFields(cleanItem, field, schemaData as SchemaData);
            // Also do deep cleaning to remove _typename from nested structures
            cleanItem = deepCleanCollectionItem(cleanItem) as CollectionItem;
            return cleanItem;
          });
        }
        
        // Handle updated items - remove connection field and __status metadata, clean object fields
        if (changes.modified && changes.modified.length > 0) {
          transformedCollection.updated = changes.modified.map((item: CollectionItem) => {
            let cleanItem = { ...item };
            // Remove metadata fields
            delete cleanItem.__status;
            delete cleanItem.__originalData;
            // Remove connection field if present
            if (field.connectionField && cleanItem[field.connectionField] !== undefined) {
              delete cleanItem[field.connectionField];
            }
            // Clean object fields within the item
            cleanItem = cleanCollectionItemObjectFields(cleanItem, field, schemaData as SchemaData);
            // Also do deep cleaning to remove __typename from nested structures
            cleanItem = deepCleanCollectionItem(cleanItem) as CollectionItem;
            return cleanItem;
          });
        }
        
        // Handle deleted items - just the IDs
        if (changes.deleted && changes.deleted.length > 0) {
          transformedCollection.deleted = changes.deleted;
        }
        
        // Only include collection if there are changes
        if (Object.keys(transformedCollection).length > 0) {
          transformedCollections[fieldName] = transformedCollection;
        }
      }
    });
    
    return transformedCollections;
  }, [formFields, cleanCollectionItemObjectFields, deepCleanCollectionItem, schemaData]);

  // Cache invalidation functions
  const invalidateEntityListCache = React.useCallback(async (entityType: string) => {
    try {
      // Evict all queries that contain the entity type name
      await client.resetStore();
      
      console.log(`🗑️ Invalidated cache for entity type: ${entityType}`);
    } catch (error) {
      console.error(`Error invalidating cache for ${entityType}:`, error);
    }
  }, [client]);

  const invalidateEntityCache = React.useCallback(async (entityId: string, entityType: string) => {
    try {
      // Get the entity name (singular form)
      const entityName = entityType.slice(0, -1); // Remove 's' from end
      
      // Evict the specific entity from cache
      client.cache.evict({ 
        id: client.cache.identify({ 
          __typename: entityName.charAt(0).toUpperCase() + entityName.slice(1), 
          id: entityId 
        }) 
      });
      
      // Also evict any list queries that might contain this entity
      client.cache.gc();
      
      console.log(`🗑️ Invalidated cache for entity ${entityId} of type ${entityType}`);
    } catch (error) {
      console.error(`Error invalidating cache for entity ${entityId}:`, error);
    }
  }, [client]);

  // Transform form data for Simfinity mutation submission
  const transformFormDataForMutation = React.useCallback((formData: FormData, collectionChanges?: Record<string, CollectionFieldState>): Record<string, unknown> => {
    const transformedData: Record<string, unknown> = {};
    
    // First, transform collection fields using the dedicated function
    if (collectionChanges) {
      const transformedCollections = transformCollectionDataForMutation(collectionChanges);
      Object.assign(transformedData, transformedCollections);
    }
    
    // Then transform non-collection fields
    formFields.forEach(field => {
      if (!field.isCollection) { // Skip collection fields as they're already processed
        if (field.isEmbedded) {
          // Handle embedded object fields (like director in the example)
          const embeddedData: Record<string, unknown> = {};
          if (field.embeddedFields) {
            field.embeddedFields.forEach(embeddedField => {
              const embeddedFieldName = embeddedField.name.replace(`${field.name}.`, '');
              const embeddedFieldValue = formData[embeddedField.name]?.value;
              if (embeddedFieldValue !== undefined && embeddedFieldValue !== null && embeddedFieldValue !== '') {
                embeddedData[embeddedFieldName] = embeddedFieldValue;
              }
            });
          }
          // Only include embedded object if it has data
          if (Object.keys(embeddedData).length > 0) {
            transformedData[field.name] = embeddedData;
            console.log(`Embedded object ${field.name}:`, embeddedData);
          }
        } else if (field.isObject) {
          // Handle object reference fields (like genre in the example: {id: "idofrelatedobject"})
          const currentValue = formData[field.name]?.value;
          if (currentValue && typeof currentValue === 'object' && 'id' in currentValue) {
            // Extract ID from object value
            transformedData[field.name] = { id: (currentValue as { id: string }).id };
            console.log(`Object field ${field.name}:`, { id: (currentValue as { id: string }).id });
          } else if (typeof currentValue === 'string' && currentValue) {
            // Direct ID string
            transformedData[field.name] = { id: currentValue };
            console.log(`Object field ${field.name}:`, { id: currentValue });
          }
        } else {
          // Handle scalar fields (string, number, boolean, list of scalars)
          const currentValue = formData[field.name]?.value;
          if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
            // For list fields, only include if they actually changed from the original value
            if (field.isList && action === "edit") {
              // In edit mode, compare with original entity data to see if changed
              const originalValue = field.value; // This is the original value from the entity
              
              // Only include list field if it actually changed
              if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
                transformedData[field.name] = currentValue;
                console.log(`List field ${field.name} changed:`, { original: originalValue, current: currentValue });
              } else {
                console.log(`List field ${field.name} unchanged, skipping:`, currentValue);
              }
            } else {
              // For non-list fields or create mode, include if they have a value
              transformedData[field.name] = currentValue;
              console.log(`Scalar field ${field.name}:`, currentValue);
            }
          }
        }
      }
    });
    
    return transformedData;
  }, [formFields, transformCollectionDataForMutation, action]);



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get collection changes if in edit mode
      const collectionChanges = action === "edit" ? getCollectionChanges() : {};
      
      if (Object.keys(collectionChanges).length > 0) {
        console.log('Collection changes to be processed:', collectionChanges);
      }

      // Transform form data for mutation using the new transformation functions
      const transformedData = transformFormDataForMutation(formData, collectionChanges);
      
      console.log('Transformed data for Simfinity mutation:', transformedData);

      if (action === "create") {
        const result = await createEntity({
          variables: { input: transformedData }
        });
        console.log('Entity created:', result.data);
        setSuccessMessage(resolveLabel(["form.successCreated"], { entity: listField }, "Entity created successfully!"));
        
        // Invalidate and refetch list queries for the entity type
        await invalidateEntityListCache(listField);
      } else if (action === "edit") {
        // For update mutations, include the ID inside the input
        const updateInput = { id: entityId, ...transformedData };
        const result = await updateEntity({
          variables: { input: updateInput }
        });
        console.log('Entity updated:', result.data);
        setSuccessMessage(resolveLabel(["form.successUpdated"], { entity: listField }, "Entity updated successfully!"));
        
        // Invalidate and refetch both the specific entity and list queries
        await invalidateEntityCache(entityId!, listField);
        await invalidateEntityListCache(listField);
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

  // Render embedded object section using shared FormFieldRenderer
  const renderEmbeddedSection = (field: FormField, enabled: boolean = true) => {
    if (!field.isEmbedded || !field.embeddedFields) return null;
    
    const sectionLabel = getFieldLabel(field.name);
    
    // Get section-level customization (for the embedded object section itself)
    const sectionCustomization = getEmbeddedSectionCustomization(customizationState.customization, field.name);
    const sectionSize = sectionCustomization?.size || { xs: 12, sm: 12, md: 12 }; // Default to full width
    
    // Handle dynamic visible/enabled values for sections
    const sectionVisible = sectionCustomization?.visible;
    const sectionEnabled = sectionCustomization?.enabled;
    
    const isSectionVisible = typeof sectionVisible === 'function' 
      ? sectionVisible(field.name, field.value, formData)
      : (sectionVisible ?? true);
      
    const isSectionEnabled = typeof sectionEnabled === 'function'
      ? sectionEnabled(field.name, field.value, formData)
      : (sectionEnabled ?? true);
    
    if (!isSectionVisible) return null;
    
    return (
      <Grid key={field.name} size={sectionSize}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{sectionLabel}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {field.embeddedFields.map(embeddedField => {
                // Get the current value from formData for this embedded field
                const currentValue = formData[embeddedField.name]?.value;
                
                console.log(`Embedded field ${embeddedField.name}: original value =`, embeddedField.value, 'current value from formData =', currentValue);
                
                // Get field-level customization for this embedded field
                const embeddedFieldName = embeddedField.name.replace(`${field.name}.`, '');
                const fieldCustomization = getEmbeddedFieldCustomization(customizationState.customization, field.name, embeddedFieldName);
                const fieldSize = getEmbeddedFieldSize(field.name, embeddedFieldName, customizationState.customization);
                
                // Convert embedded field to the format expected by FormFieldRenderer
                const fieldForRenderer = {
                  name: embeddedFieldName,
                  type: embeddedField.type,
                  isNonNull: embeddedField.required,
                  isList: embeddedField.isList,
                  extensions: { embedded: true }
                };
                
                return (
                  <Grid key={embeddedField.name} size={fieldSize}>
                    <FormFieldRenderer
                      field={fieldForRenderer}
                      value={currentValue !== undefined ? currentValue : embeddedField.value}
                      onChange={(fieldName, value) => {
                        const customOnChange = fieldCustomization?.onChange;
                        
                        if (customOnChange) {
                          // Convert unknown value to the expected type
                          const typedValue = value as string | number | boolean | string[] | null;
                          const result = customOnChange(embeddedFieldName, typedValue, formData, customizationActions.setFieldData, customizationActions.setFieldVisible, customizationActions.setFieldEnabled);
                          // Pass both value and error to handleEmbeddedFieldChange
                          handleEmbeddedFieldChange(field.name, embeddedFieldName, result.value as string | number | boolean | string[] | null, result.error);
                        } else {
                          // Use default handler - ensure value is properly typed
                          const typedValue = value as string | number | boolean | string[] | null;
                          handleEmbeddedFieldChange(field.name, embeddedFieldName, typedValue);
                        }
                      }}
                      error={embeddedField.error}
                      disabled={action === "view" || !isSectionEnabled || !enabled}
                      schemaData={schemaData}
                      entityTypeName={entityTypeName || ''}
                      customizationState={customizationState}
                      parentFieldPath={field.name}
                      isEmbedded={true}
                      hideIdField={true}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
    );
  };

  // Render form field
  const renderField = (field: FormField & { onChange?: (value: string | number | boolean | string[] | null) => void }, enabled: boolean = true) => {
    console.log(`Rendering field ${field.name} with value:`, field.value, 'from formData:', formData[field.name]?.value);
    const fieldLabel = getFieldLabel(field.name);
    const isViewMode = action === "view";
    
    // Get field customization for custom onChange
    const fieldCustomization = customizationState.customization[field.name];
    const customOnChange = fieldCustomization && 'onChange' in fieldCustomization ? fieldCustomization.onChange : undefined;
    
    // Use custom onChange if provided, otherwise use the default handleFieldChange
    const onChange = customOnChange 
      ? (value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => {
          const result = customOnChange(field.name, value, formData, customizationActions.setFieldData, customizationActions.setFieldVisible, customizationActions.setFieldEnabled);
          // Pass both value and error to handleFieldChange to handle state properly
          handleFieldChange(field.name, result.value as string | number | boolean | string[] | null | { id: string; [key: string]: unknown }, result.error);
        }
      : ((value: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }) => handleFieldChange(field.name, value));
    
    if (field.isObject && field.objectTypeName && field.descriptionField && field.descriptionFieldType && field.listQueryName && field.singleQueryName) {
      return (
        <>
          <ObjectFieldSelector
            label={fieldLabel}
            value={field.value as string | null | { id: string; [key: string]: unknown }}
            onChange={onChange}
            error={field.error}
            required={field.required}
            disabled={isViewMode || !enabled}
            objectTypeName={field.objectTypeName}
            descriptionField={field.descriptionField}
            descriptionFieldType={field.descriptionFieldType}
            listQueryName={field.listQueryName}
            singleQueryName={field.singleQueryName}
          />
        </>
      );
    }
    
    if (field.isEnum && field.enumValues) {
      return (
        <>
          <FormControl fullWidth error={!!field.error}>
            <InputLabel>{fieldLabel}</InputLabel>
            <Select
              value={field.value as string}
              onChange={(e) => onChange(e.target.value)}
              label={fieldLabel}
              required={field.required}
              disabled={isViewMode || !enabled}
            >
              {field.enumValues.map((enumValue) => (
                <MenuItem key={enumValue} value={enumValue}>
                  {enumValue}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {field.error && (
            <FormHelperText error>{field.error}</FormHelperText>
          )}
        </>
      );
    }
    
    if (field.isList) {
      return (
        <>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={field.value as string[]}
            onChange={(_, newValue) => onChange(newValue)}
            disabled={isViewMode || !enabled}
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
        </>
      );
    }
    
    if (field.isBoolean) {
      return (
        <>
          <FormControlLabel
            control={
              <input
                type="checkbox"
                checked={field.value as boolean}
                onChange={(e) => onChange(e.target.checked)}
                disabled={isViewMode || !enabled}
              />
            }
            label={fieldLabel}
          />
          {field.error && (
            <FormHelperText error>{field.error}</FormHelperText>
          )}
        </>
      );
    }

    if (field.isDate) {
      // Format date value for date input (YYYY-MM-DD)
      const formatDateForInput = (dateValue: string | number | boolean | string[] | null | { id: string; [key: string]: unknown }): string => {
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
        <>
          <TextField
            fullWidth
            label={fieldLabel}
            type="date"
            value={formatDateForInput(field.value as string | number | boolean | string[] | null | { id: string; [key: string]: unknown })}
            onChange={(e) => onChange(e.target.value as string | number | boolean | string[] | null | { id: string; [key: string]: unknown })}
            error={!!field.error}
            helperText={field.error}
            required={field.required}
            disabled={isViewMode || !enabled}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </>
      );
    }

    return (
      <>
        <TextField
          fullWidth
          label={fieldLabel}
          type={field.isNumeric ? "number" : "text"}
          value={field.value as string}
          onChange={(e) => onChange(e.target.value as string | number | boolean | string[] | null | { id: string; [key: string]: unknown })}
          error={!!field.error}
          helperText={field.error}
          required={field.required}
          disabled={isViewMode || !enabled}
        />
      </>
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
          {resolveLabel([getEntityName(listField, 'plural')], { entity: listField }, getEntityName(listField, 'plural'))}
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
        } {resolveLabel([getEntityName(listField, 'single')], { entity: listField }, getEntityName(listField, 'single'))}
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
                {(() => {
                  const mainFormFields = formFields.filter(field => !field.isCollection);
                  const collectionFields = formFields.filter(field => field.isCollection);
                  
                  console.log('Form rendering:', {
                    mainFormFields: mainFormFields.map(f => f.name),
                    collectionFields: collectionFields.map(f => ({ name: f.name, collectionObjectTypeName: f.collectionObjectTypeName, connectionField: f.connectionField }))
                  });
                  
                  // Get ordered fields based on customization
                  const orderedFields = getFieldOrder(customizationState);
                  const visibleFields = mainFormFields.filter(field => isFieldVisible(field.name, customizationState, field.value, formData));
                  
                  // Sort fields according to customization order
                  const sortedFields = visibleFields.sort((a, b) => {
                    const aIndex = orderedFields.indexOf(a.name);
                    const bIndex = orderedFields.indexOf(b.name);
                    if (aIndex === -1 && bIndex === -1) return 0;
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                  });
                  
                  return sortedFields.map(field => {
                    // Get field customization properties
                    const fieldSize = getFieldSize(field.name, customizationState.customization);
                    const isEnabled = isFieldEnabled(field.name, customizationState, field.value, formData);
                    
                    // Handle embedded object fields as sections - these will be rendered separately at the bottom
                    if (field.isEmbedded) {
                      return null; // Don't render embedded sections here
                    }
                    
                    // Handle regular fields with customization
                    return (
                      <Grid key={field.name} size={fieldSize}>
                        {renderField(formData[field.name] || field, isEnabled)}
                      </Grid>
                    );
                  });
                })()}
              </Grid>

          {/* Embedded Object Sections - Rendered at the bottom */}
          {(() => {
            const embeddedFields = formFields.filter(field => field.isEmbedded);
            if (embeddedFields.length === 0) return null;
            
            // Sort embedded fields by their customization order
            const sortedEmbeddedFields = embeddedFields.sort((a, b) => {
              const aCustomization = getEmbeddedSectionCustomization(customizationState.customization, a.name);
              const bCustomization = getEmbeddedSectionCustomization(customizationState.customization, b.name);
              
              const aOrder = aCustomization?.order ?? 999;
              const bOrder = bCustomization?.order ?? 999;
              
              return aOrder - bOrder;
            });
            
            return (
              <>
                <Divider sx={{ my: 3 }} />
                {sortedEmbeddedFields.map(field => renderEmbeddedSection(field, true))}
              </>
            );
          })()}

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

      {/* Collection Fields */}
      {(() => {
        const validCollectionFields = formFields.filter(field => 
          field.isCollection && field.collectionObjectTypeName && field.connectionField
        );
        
        console.log('Rendering collection fields:', {
          totalCollectionFields: formFields.filter(f => f.isCollection).length,
          validCollectionFields: validCollectionFields.map(f => ({
            name: f.name,
            collectionObjectTypeName: f.collectionObjectTypeName,
            connectionField: f.connectionField
          })),
          invalidCollectionFields: formFields.filter(f => f.isCollection && (!f.collectionObjectTypeName || !f.connectionField)).map(f => ({
            name: f.name,
            collectionObjectTypeName: f.collectionObjectTypeName,
            connectionField: f.connectionField
          }))
        });
        
        return validCollectionFields.map(field => (
          <Box key={field.name} sx={{ mt: 3 }}>
            <CollectionFieldGrid
              collectionField={{
                name: field.name,
                objectTypeName: field.collectionObjectTypeName!,
                connectionField: field.connectionField!,
              }}
              parentEntityId={entityId || ""}
              parentEntityType={getElementTypeNameOfListField(schemaData, listField) || "" }
              isEditMode={action === "edit"}
              collectionState={getCollectionState(field.name)}
              onCollectionStateChange={updateCollectionState}
            />
          </Box>
        ));
      })()}

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
