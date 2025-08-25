export type FieldSize = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

export type FieldCustomization = {
  size?: FieldSize;
  enabled?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  visible?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  order?: number;
  onChange?: (
    fieldName: string,
    value: string | number | boolean | string[] | null,
    formData: Record<string, unknown>,
    setFieldData: (fieldName: string, value: string | number | boolean | string[] | null) => void,
    setFieldVisible: (fieldName: string, visible: boolean) => void,
    setFieldEnabled: (fieldName: string, enabled: boolean) => void
  ) => { value: string | number | boolean | string[] | null; error?: string };
};

export type EmbeddedSectionCustomization = {
  size?: FieldSize; // Controls the section's size in the main form
  order?: number;   // Controls the section's order relative to other fields/sections
  visible?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean); // Controls whether the entire section is visible
  enabled?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean); // Controls whether the entire section is enabled
};

export type CollectionItemCustomization = {
  size?: FieldSize;
  enabled?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  visible?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean);
  order?: number;
  onChange?: (
    fieldName: string,
    value: string | number | boolean | string[] | null,
    formData: Record<string, unknown>,
    setFieldData: (fieldName: string, value: string | number | boolean | string[] | null) => void,
    setFieldVisible: (fieldName: string, visible: boolean) => void,
    setFieldEnabled: (fieldName: string, enabled: boolean) => void
  ) => { value: string | number | boolean | string[] | null; error?: string };
  // Support for nested field customizations within collection items
  fields?: Record<string, FieldCustomization>;
};

export type CollectionFieldCustomization = {
  size?: FieldSize; // Controls the collection section's size in the main form
  order?: number;   // Controls the collection section's order relative to other fields/sections
  visible?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean); // Controls whether the entire collection section is visible
  enabled?: boolean | ((fieldName: string, value: unknown, formData: Record<string, unknown>) => boolean); // Controls whether the entire collection section is enabled
  items?: Record<string, CollectionItemCustomization>; // Customization for individual items within the collection
};

export type FormCustomization = Record<string, FieldCustomization | EmbeddedSectionCustomization | CollectionFieldCustomization>;

export type FormCustomizationState = {
  customization: FormCustomization;
  fieldVisibility: Record<string, boolean>;
  fieldEnabled: Record<string, boolean>;
  fieldOrder: string[];
};

export type FormCustomizationActions = {
  setFieldData: (fieldName: string, value: string | number | boolean | string[] | null) => void;
  setFieldVisible: (fieldName: string, visible: boolean) => void;
  setFieldEnabled: (fieldName: string, enabled: boolean) => void;
  setFieldOrder: (fieldOrder: string[]) => void;
};

// Global registry for form customizations
// Key format: "entityType:mode" (e.g., "episode:create", "episode:edit")
const formCustomizations = new Map<string, FormCustomization>();

export function registerFormCustomization(
  entityType: string,
  mode: "create" | "edit" | "view",
  customization: FormCustomization
): void {
  const key = `${entityType}:${mode}`;
  console.log(`Registering form customization for ${entityType} in ${mode} mode:`, customization);
  formCustomizations.set(key, customization);
}

export function getFormCustomization(entityType: string, mode: "create" | "edit" | "view"): FormCustomization | undefined {
  const key = `${entityType}:${mode}`;
  return formCustomizations.get(key);
}

export function createFormCustomizationState(
  entityType: string,
  mode: "create" | "edit" | "view",
  fieldNames: string[]
): FormCustomizationState {
  const customization = getFormCustomization(entityType, mode) || {};
  
  // Initialize field visibility and enabled state
  const fieldVisibility: Record<string, boolean> = {};
  const fieldEnabled: Record<string, boolean> = {};
  
  fieldNames.forEach(fieldName => {
    const fieldCustomization = customization[fieldName];
    
    // Handle dynamic visible/enabled values
    const visible = fieldCustomization?.visible;
    const enabled = fieldCustomization?.enabled;
    
    // For static values, store them; for dynamic functions, store default true
    fieldVisibility[fieldName] = typeof visible === 'function' ? true : (visible ?? true);
    fieldEnabled[fieldName] = typeof enabled === 'function' ? true : (enabled ?? true);
  });
  
  // Create field order based on customization or default order
  const fieldOrder = fieldNames.sort((a, b) => {
    const aCustomization = customization[a];
    const bCustomization = customization[b];
    
    // If both have order, sort by order
    if (aCustomization?.order !== undefined && bCustomization?.order !== undefined) {
      return aCustomization.order - bCustomization.order;
    }
    
    // If only one has order, prioritize it
    if (aCustomization?.order !== undefined) return -1;
    if (bCustomization?.order !== undefined) return 1;
    
    // Default order
    return 0;
  });
  
  return {
    customization,
    fieldVisibility,
    fieldEnabled,
    fieldOrder,
  };
}

export function getFieldSize(fieldName: string, customization: FormCustomization): FieldSize {
  const fieldCustomization = customization[fieldName];
  return fieldCustomization?.size || { xs: 12, sm: 6, md: 4 };
}

export function isFieldVisible(fieldName: string, state: FormCustomizationState, currentValue?: unknown, formData?: Record<string, unknown>): boolean {
  const fieldCustomization = state.customization[fieldName];
  const visible = fieldCustomization?.visible;
  
  if (typeof visible === 'function') {
    return visible(fieldName, currentValue, formData || {});
  }
  
  return state.fieldVisibility[fieldName] ?? (visible ?? true);
}

export function isFieldEnabled(fieldName: string, state: FormCustomizationState, currentValue?: unknown, formData?: Record<string, unknown>): boolean {
  const fieldCustomization = state.customization[fieldName];
  const enabled = fieldCustomization?.enabled;
  
  if (typeof enabled === 'function') {
    return enabled(fieldName, currentValue, formData || {});
  }
  
  return state.fieldEnabled[fieldName] ?? (enabled ?? true);
}

export function getFieldOrder(state: FormCustomizationState): string[] {
  return state.fieldOrder;
}

// Helper function to get embedded field customization
export function getEmbeddedFieldCustomization(
  customization: FormCustomization,
  sectionName: string,
  fieldName: string
): FieldCustomization | undefined {
  const embeddedFieldKey = `${sectionName}.${fieldName}`;
  const fieldCustomization = customization[embeddedFieldKey];
  
  if (fieldCustomization && 'onChange' in fieldCustomization) {
    return fieldCustomization as FieldCustomization;
  }
  
  return undefined;
}

// Helper function to get embedded section customization
export function getEmbeddedSectionCustomization(
  customization: FormCustomization,
  sectionName: string
): EmbeddedSectionCustomization | undefined {
  const sectionCustomization = customization[sectionName];
  
  if (sectionCustomization && !('onChange' in sectionCustomization)) {
    return sectionCustomization as EmbeddedSectionCustomization;
  }
  
  return undefined;
}

// Helper function to get embedded field size relative to section
export function getEmbeddedFieldSize(
  sectionName: string,
  fieldName: string,
  customization: FormCustomization,
  defaultSize: FieldSize = { xs: 12, sm: 6, md: 4 }
): FieldSize {
  const embeddedFieldKey = `${sectionName}.${fieldName}`;
  const fieldCustomization = customization[embeddedFieldKey];
  
  if (fieldCustomization && 'size' in fieldCustomization && fieldCustomization.size) {
    return fieldCustomization.size;
  }
  
  return defaultSize;
}

// Helper function to get collection field customization
export function getCollectionFieldCustomization(
  customization: FormCustomization,
  collectionFieldName: string
): CollectionFieldCustomization | undefined {
  const collectionCustomization = customization[collectionFieldName];
  
  if (collectionCustomization && 'items' in collectionCustomization) {
    return collectionCustomization as CollectionFieldCustomization;
  }
  
  return undefined;
}

// Helper function to get collection item field customization
export function getCollectionItemFieldCustomization(
  customization: FormCustomization,
  collectionFieldName: string,
  itemTypeName: string,
  fieldName: string
): FieldCustomization | undefined {
  const collectionCustomization = getCollectionFieldCustomization(customization, collectionFieldName);
  
  if (collectionCustomization?.items && collectionCustomization.items[itemTypeName]) {
    const itemCustomization = collectionCustomization.items[itemTypeName];
    
    // First check if the field has direct customization
    if (itemCustomization.fields && itemCustomization.fields[fieldName]) {
      return itemCustomization.fields[fieldName];
    }
    
    // Fallback to the old format for backward compatibility
    if (itemCustomization && 'onChange' in itemCustomization) {
      return itemCustomization as FieldCustomization;
    }
  }
  
  return undefined;
}

// Helper function to get collection item field size
export function getCollectionItemFieldSize(
  collectionFieldName: string,
  itemTypeName: string,
  fieldName: string,
  customization: FormCustomization,
  defaultSize: FieldSize = { xs: 12, sm: 6, md: 4 }
): FieldSize {
  const itemCustomization = getCollectionItemFieldCustomization(customization, collectionFieldName, itemTypeName, fieldName);
  
  if (itemCustomization && itemCustomization.size) {
    return itemCustomization.size;
  }
  
  return defaultSize;
}

// Helper function to check if a field is a collection field
export function isCollectionField(
  customization: FormCustomization,
  fieldName: string
): boolean {
  const fieldCustomization = customization[fieldName];
  return fieldCustomization && 'items' in fieldCustomization;
}
