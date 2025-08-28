import { registerFormCustomization } from '@/lib/formCustomization';

// Example of how to customize collection item edit forms
// Format: collectionfield.itemField.mode
export function setupCollectionItemEditCustomizations() {
  
  // Example 1: Customize star edit form in seasons collection
  registerFormCustomization("seasons.star", "edit", {
    fieldsCustomization: {
      name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1,
      onChange: (fieldName, value, formData) => {
        console.log('Star name changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    country: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 2,
      onChange: (fieldName, value, formData) => {
        console.log('Star country changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    }
    }
  });

  // Example 2: Customize episode edit form in episodes collection
  registerFormCustomization("episodes.episode", "edit", {
    fieldsCustomization: {
      name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1,
      onChange: (fieldName, value, formData) => {
        console.log('Episode name changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    number: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 2,
      onChange: (fieldName, value, formData) => {
        console.log('Episode number changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    date: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 3,
      onChange: (fieldName, value, formData) => {
        console.log('Episode date changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    season: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 4,
      onChange: (fieldName, value, formData) => {
        console.log('Episode season changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    }
    }
  });

  // Example 3: Customize assigned star and serie edit form
  registerFormCustomization("stars.assignedStarAndSerie", "edit", {
    fieldsCustomization: {
      serie: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1,
      onChange: (fieldName, value, formData) => {
        console.log('Assigned serie changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    star: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 2,
      onChange: (fieldName, value, formData) => {
        console.log('Assigned star changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    }
    }
  });

  // Example 4: Conditional field visibility and enabling
  registerFormCustomization("episodes.episode", "edit", {
    fieldsCustomization: {
      name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1,
      onChange: (fieldName, value, _formData, setFieldData) => {
        // Enable number field only when name has a value
        if (value && String(value).trim() !== '') {
          setFieldData('number', 1);
        }
        return { value, error: undefined };
      }
    },
    number: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 2,
      enabled: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const nameValue = formDataTyped.name?.value;
        return !!(nameValue && String(nameValue).trim() !== '');
      }
    },
    season: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 3,
      visible: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const numberValue = formDataTyped.number?.value;
        return !!(numberValue && Number(numberValue) > 0);
      }
    }
    }
  });
}

// Call this function in your app initialization
// setupCollectionItemEditCustomizations();
