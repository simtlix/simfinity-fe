export type FieldSize = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

export type FieldCustomization = {
  size?: FieldSize;
  enabled?: boolean;
  visible?: boolean;
  order?: number;
  errorMessage?: (value: unknown) => string | undefined;
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
  visible?: boolean; // Controls whether the entire section is visible
  enabled?: boolean; // Controls whether the entire section is enabled
};

export type FormCustomization = Record<string, FieldCustomization | EmbeddedSectionCustomization>;

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
const formCustomizations = new Map<string, FormCustomization>();

export function registerFormCustomization(
  entityType: string,
  customization: FormCustomization
): void {
  console.log(`Registering form customization for ${entityType}:`, customization);
  formCustomizations.set(entityType, customization);
}

export function getFormCustomization(entityType: string): FormCustomization | undefined {
  return formCustomizations.get(entityType);
}

export function createFormCustomizationState(
  entityType: string,
  fieldNames: string[]
): FormCustomizationState {
  const customization = getFormCustomization(entityType) || {};
  
  // Initialize field visibility and enabled state
  const fieldVisibility: Record<string, boolean> = {};
  const fieldEnabled: Record<string, boolean> = {};
  
  fieldNames.forEach(fieldName => {
    const fieldCustomization = customization[fieldName];
    fieldVisibility[fieldName] = fieldCustomization?.visible ?? true;
    fieldEnabled[fieldName] = fieldCustomization?.enabled ?? true;
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

export function isFieldVisible(fieldName: string, state: FormCustomizationState): boolean {
  return state.fieldVisibility[fieldName] ?? true;
}

export function isFieldEnabled(fieldName: string, state: FormCustomizationState): boolean {
  return state.fieldEnabled[fieldName] ?? true;
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
