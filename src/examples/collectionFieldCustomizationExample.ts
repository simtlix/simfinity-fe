import { registerFormCustomization } from '@/lib/formCustomization';

// Example of how to customize collection fields within the main entity customization
// This shows the new syntax where collection field customizations are nested within the main entity
export function setupCollectionFieldCustomizations() {
  
  // Example 1: Serie with embedded seasons collection customization
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1,
      onChange: (fieldName, value, formData) => {
        console.log('Serie name changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    
    // Collection field customization - seasons
    seasons: {
      size: { xs: 12, sm: 12, md: 12 }, // Full width for collection section
      order: 2,
      visible: true,
      enabled: true,
      // Mode-specific customizations for collection items
      onEdit: {
        name: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1,
          onChange: (fieldName, value, formData) => {
            console.log('Season name changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        },
        number: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 2,
          onChange: (fieldName, value, formData) => {
            console.log('Season number changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        }
      },
      // Create mode customizations for collection items
      onCreate: {
        name: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1,
          onChange: (fieldName, value, formData) => {
            console.log('Season name changed in serie create:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        },
        number: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 2,
          onChange: (fieldName, value, formData) => {
            console.log('Season number changed in serie create:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        }
      }
    },
    
    // Collection field customization - episodes
    episodes: {
      size: { xs: 12, sm: 12, md: 12 },
      order: 3,
      visible: true,
      enabled: true,
      // Mode-specific customizations for collection items
      onEdit: {
        name: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1,
          onChange: (fieldName, value, formData) => {
            console.log('Episode name changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        },
        number: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 2,
          onChange: (fieldName, value, formData) => {
            console.log('Episode number changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        },
        date: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 3,
          onChange: (fieldName, value, formData) => {
            console.log('Episode date changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        },
        season: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 4,
          onChange: (fieldName, value, formData) => {
            console.log('Episode season changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        }
      },
      // Create mode customizations for collection items
      onCreate: {
        name: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1
        },
        number: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 2
        },
        date: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 3
        },
        season: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 4
        }
      }
    }
    }
  });

  // Example 2: Serie with embedded stars collection customization
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1
    },
    
    // Collection field customization - stars
    stars: {
      size: { xs: 12, sm: 12, md: 12 },
      order: 2,
      visible: true,
      enabled: true,
      // Mode-specific customizations for collection items
      onEdit: {
        name: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1,
          onChange: (fieldName, value, formData) => {
            console.log('Star name changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        },
        country: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 2,
          onChange: (fieldName, value, formData) => {
            console.log('Star country changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        }
      }
    }
    }
  });

  // Example 3: Serie with assigned stars and series collection customization
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1
    },
    
    // Collection field customization - assigned stars and series
    assignedStarsAndSeries: {
      size: { xs: 12, sm: 12, md: 12 },
      order: 2,
      visible: true,
      enabled: true,
      // Mode-specific customizations for collection items
      onEdit: {
        serie: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1,
          onChange: (fieldName, value, formData) => {
            console.log('Assigned serie changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        },
        star: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 2,
            onChange: (fieldName, value, formData) => {
            console.log('Assigned star changed in serie edit:', { fieldName, value, formData });
            return { value, error: undefined };
          }
        }
      }
    }
    }
  });

  // Example 4: Conditional collection field visibility and enabling
  registerFormCustomization("serie", "edit", {
    fieldsCustomization: {
      name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1,
      onChange: (fieldName, value, formData) => {
        console.log('Serie name changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    
    // Collection field with conditional visibility
    seasons: {
      size: { xs: 12, sm: 12, md: 12 },
      order: 2,
      visible: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const nameValue = formDataTyped.name?.value;
        return !!(nameValue && String(nameValue).trim() !== '');
      },
      enabled: true,
      // Mode-specific customizations for collection items
      onEdit: {
        name: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1,
          onChange: (fieldName, value) => {
            // Enable episodes collection when season name is set
            if (value && String(value).trim() !== '') {
              console.log('Season name set, episodes collection should be enabled');
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
        }
      }
    },
    
    // Episodes collection that depends on seasons
    episodes: {
      size: { xs: 12, sm: 12, md: 12 },
      order: 3,
      visible: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const seasonsValue = formDataTyped.seasons?.value;
        return !!(seasonsValue && Array.isArray(seasonsValue) && seasonsValue.length > 0);
      },
      enabled: true,
      // Mode-specific customizations for collection items
      onEdit: {
        name: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 1
        },
        number: {
          size: { xs: 12, sm: 6, md: 6 },
          order: 2
        }
      }
    }
    }
  });
}

// Call this function in your app initialization
// setupCollectionFieldCustomizations();
