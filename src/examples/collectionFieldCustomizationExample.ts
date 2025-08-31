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
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
        console.log('Serie name changed:', { fieldName, value, formData });
        // Note: parentFormAccess is undefined for main entity fields (only available in collection item context)
        console.log('Parent form access:', parentFormAccess);
        return { value, error: undefined };
      }
    },
    
    // Collection field customization - seasons
    seasons: {
      size: { xs: 12, sm: 12, md: 12 }, // Full width for collection section
      order: 2,
      visible: true,
      enabled: true,
      // Callback for when delete button is pressed
      onDelete: async (item, setMessage) => {
        // Example: Prevent deletion of seasons with episodes
        if (item.episodeCount && Number(item.episodeCount) > 0) {
          setMessage({
            type: 'error',
            message: `Cannot delete season "${item.name}" because it has ${item.episodeCount} episodes. Remove episodes first.`
          });
          return false; // Cancel deletion
        }
        
        setMessage({
          type: 'info',
          message: `Season "${item.name}" will be deleted.`
        });
        return true; // Allow deletion
      },
      // Mode-specific customizations for collection items
      onEdit: {
        fieldsCustomization: {
          name: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 1,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Season name changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          },
          number: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 2,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Season number changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          }
        },
        onSubmit: async (item, setFieldData, formData, setFieldVisible, setFieldEnabled, setMessage, parentFormAccess) => {
          console.log('Season onSubmit in edit mode:', item);
          console.log('Parent form data:', parentFormAccess.parentFormData);
          
          // Example: Validate season data before saving
          if (!item.name || String(item.name).trim() === '') {
            setMessage({
              type: 'error',
              message: 'Season name is required'
            });
            return false; // Cancel submission
          }
          
          // Example: Access parent form data (series title)
          const seriesTitle = (parentFormAccess.parentFormData.title as { value?: unknown })?.value;
          if (seriesTitle && String(item.name).toLowerCase().includes('final')) {
            setMessage({
              type: 'warning',
              message: `This appears to be the final season of "${seriesTitle}". Are you sure?`
            });
          }
          
          // Example: Auto-generate slug from series title and season name
          if (item.name && !item.slug && seriesTitle) {
            const slug = `${String(seriesTitle)}-${String(item.name)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            setFieldData('slug', slug);
          }
          
          // Example: Update parent form based on season data
          if (item.number && Number(item.number) > 5) {
            parentFormAccess.setParentFieldData('isLongRunning', true);
            setMessage({
              type: 'info',
              message: 'Series marked as long-running due to high season count'
            });
          }
          
          return true; // Allow submission
        }
      },
      // Create mode customizations for collection items
      onCreate: {
        fieldsCustomization: {
          name: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 1,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Season name changed in serie create:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          },
          number: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 2,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Season number changed in serie create:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          }
        },
        onSubmit: async (item, setFieldData, _formData, _setFieldVisible, _setFieldEnabled, _setMessage, parentFormAccess) => {
          console.log('Season onSubmit in create mode:', item);
          console.log('Parent form data:', parentFormAccess.parentFormData);
          
          // Example: Auto-increment season number based on parent series
          if (!item.number) {
            // Logic to get next season number would go here
            const nextNumber = 1; // Simplified example
            setFieldData('number', nextNumber);
          }
          
          // Example: Read parent series genre to set season defaults
          const seriesGenre = (parentFormAccess.parentFormData.genre as { value?: unknown })?.value;
          if (seriesGenre === 'documentary' && !item.episodeLength) {
            setFieldData('episodeLength', 45); // Longer episodes for documentaries
          }
          
          return true; // Allow submission
        }
      }
    },
    
    // Collection field customization - episodes
    episodes: {
      size: { xs: 12, sm: 12, md: 12 },
      order: 3,
      visible: true,
      enabled: true,
      // Callback for when delete button is pressed
      onDelete: async (item, setMessage) => {
        // Example: Allow deletion but show confirmation message
        setMessage({
          type: 'warning',
          message: `Episode "${item.name}" will be permanently deleted.`
        });
        return true; // Allow deletion
      },
      // Mode-specific customizations for collection items
      onEdit: {
        fieldsCustomization: {
          name: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 1,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Episode name changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          },
          number: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 2,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Episode number changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          },
          date: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 3,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Episode date changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          },
          season: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 4,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Episode season changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          }
        },
        onSubmit: async (item, setFieldData, _formData, _setFieldVisible, _setFieldEnabled, setMessage, parentFormAccess) => {
          console.log('Episode onSubmit in edit mode:', item);
          
          // Example: Access parent series data for episode validation
          const seriesRating = (parentFormAccess.parentFormData.rating as { value?: unknown })?.value;
          if (seriesRating === 'R' && item.audience === 'children') {
            setMessage({
              type: 'error',
              message: 'Cannot create child-friendly episode for R-rated series'
            });
            return false;
          }
          
          // Example: Auto-generate episode code from series code
          const seriesCode = (parentFormAccess.parentFormData.code as { value?: unknown })?.value;
          if (seriesCode && item.number && !item.code) {
            const episodeCode = `${seriesCode}-E${String(item.number).padStart(2, '0')}`;
            setFieldData('code', episodeCode);
          }
          
          return true; // Allow submission
        }
      },
      // Create mode customizations for collection items
      onCreate: {
        fieldsCustomization: {
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
        },
        onSubmit: async (item, setFieldData, _formData, _setFieldVisible, _setFieldEnabled, _setMessage, parentFormAccess) => {
          console.log('Episode onSubmit in create mode:', item);
          
          // Example: Inherit defaults from parent series
          const seriesGenre = (parentFormAccess.parentFormData.genre as { value?: unknown })?.value;
          const seriesLanguage = (parentFormAccess.parentFormData.language as { value?: unknown })?.value;
          
          if (seriesGenre && !item.genre) {
            setFieldData('genre', seriesGenre as string); // Inherit series genre
          }
          
          if (seriesLanguage && !item.language) {
            setFieldData('language', seriesLanguage as string); // Inherit series language
          }
          
          // Example: Update parent series episode count
          const currentEpisodeCount = (parentFormAccess.parentFormData.totalEpisodes as { value?: unknown })?.value || 0;
          parentFormAccess.setParentFieldData('totalEpisodes', Number(currentEpisodeCount) + 1);
          
          return true; // Allow submission
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
        fieldsCustomization: {
          name: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 1,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Star name changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          },
          country: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 2,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Star country changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
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
        fieldsCustomization: {
          serie: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 1,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Assigned serie changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
          },
          star: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 2,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              console.log('Assigned star changed in serie edit:', { fieldName, value, formData });
              console.log('Parent form access available:', parentFormAccess);
              return { value, error: undefined };
            }
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
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
        console.log('Serie name changed:', { fieldName, value, formData });
        // Note: parentFormAccess is undefined for main entity fields (only available in collection item context)
        console.log('Parent form access:', parentFormAccess);
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
        fieldsCustomization: {
          name: {
            size: { xs: 12, sm: 6, md: 6 },
            order: 1,
            onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled, parentFormAccess) => {
              // Enable episodes collection when season name is set
              if (value && String(value).trim() !== '') {
                console.log('Season name set, episodes collection should be enabled');
                console.log('Parent form access available:', parentFormAccess);
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
        fieldsCustomization: {
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
    }
  });
}

// Call this function in your app initialization
// setupCollectionFieldCustomizations();
