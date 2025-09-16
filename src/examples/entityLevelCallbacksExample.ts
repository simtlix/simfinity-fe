import { registerFormCustomization } from '@simtlix/simfinity-fe-components';

// Example demonstrating entity-level callback functions
// This shows how to use the new beforeSubmit, afterSuccess, and onError callbacks

export function setupEntityLevelCallbacksExample() {
  // Example 1: Episode creation with comprehensive callbacks
  registerFormCustomization("episode", "create", {
    fieldsCustomization: {
      name: {
        size: { xs: 12, sm: 6, md: 6 },
        order: 1
      }
    },
      beforeSubmit: async (formData, collectionChanges, transformedData, actions) => {
    console.log('Before creating episode:', { formData, collectionChanges, transformedData });
    
    // Example: Validate episode number uniqueness
    const episodeNumber = (formData.number as { value?: unknown })?.value;
    const seasonId = (formData.season as { value?: unknown })?.value;
    
    if (episodeNumber && seasonId && typeof seasonId === 'object' && 'id' in seasonId) {
      if (episodeNumber === 1) {
        actions.setFormMessage({
          type: 'warning',
          message: 'Episode 1 is typically the pilot. Please verify this is correct.'
        });
      }
    }
    
    // Example: Auto-generate description if empty
    if (!(formData.description as { value?: unknown })?.value || String((formData.description as { value?: unknown }).value).trim() === '') {
      const name = (formData.name as { value?: unknown })?.value;
      if (name) {
        actions.setFieldData('description', `Episode ${episodeNumber}: ${name}`);
      }
    }
    
    // Example: Validate collection changes
    if (collectionChanges.guestStars) {
      const { added, modified } = collectionChanges.guestStars;
      if (added.length + modified.length > 5) {
        actions.setFormMessage({
          type: 'warning',
          message: 'You have many guest stars. Consider if this is a special episode.'
        });
      }
    }
    
    // Return true to continue (or undefined/void for same effect)
    return true;
  },
    onSuccess: async (result) => {
      console.log('Episode created successfully:', result);
      
      return {
        message: 'Episode created successfully! Would you like to add another episode or view the series?',
        navigateTo: undefined, // Stay on current page
        action: () => {
          console.log('Custom success action triggered');
        }
      };
    },
    onError: async (error, formData, actions) => {
      console.error('Error creating episode:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate')) {
          actions.setFormMessage({
            type: 'error',
            message: 'An episode with this number already exists in this season. Please choose a different number.'
          });
          
          actions.setFieldData('number', '');
        } else {
          actions.setFormMessage({
            type: 'error',
            message: `Failed to create episode: ${error.message}`
          });
        }
      } else {
        actions.setFormMessage({
          type: 'error',
          message: 'An unexpected error occurred while creating the episode.'
        });
      }
    }
  });

  // Example 2: Series creation with business logic validation
  registerFormCustomization("serie", "create", {
    fieldsCustomization: {},
    beforeSubmit:
    async (formData, collectionChanges, transformedData, actions) => {
      console.log('Before creating series:', { formData, collectionChanges, transformedData });
      
      // Example: Business rule validation that prevents submission
      const genre = (formData.genre as { value?: unknown })?.value;
      const targetAudience = (formData.targetAudience as { value?: unknown })?.value;
      
      if (genre === 'horror' && targetAudience === 'children') {
        actions.setFormMessage({
          type: 'error',
          message: 'Horror content is not suitable for children. Please adjust the genre or target audience.'
        });
        
        // Return false to prevent form submission
        return false;
      }
      
      // Example: Auto-generate slug from title
      const title = (formData.title as { value?: unknown })?.value;
      if (title && !(formData.slug as { value?: unknown })?.value) {
        const slug = String(title).toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        actions.setFieldData('slug', slug);
      }
      
      // Return true to continue submission
      return true;
    },
    onSuccess: async (result) => {
      console.log('Series created successfully:', result);
      
      return {
        message: 'Series created successfully! You can now add seasons and episodes.',
        navigateTo: `/entities/serie/${(result as { id?: string })?.id}/edit`, // Navigate to edit page
        action: () => {
          console.log('Navigating to series edit page');
        }
      };
    },
    onError: async (error, formData, actions) => {
      console.error('Error creating series:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate')) {
          actions.setFormMessage({
            type: 'error',
            message: 'A series with this title already exists. Please choose a different title.'
          });
        } else if (error.message.includes('permission')) {
          actions.setFormMessage({
            type: 'error',
            message: 'You do not have permission to create series. Please contact an administrator.'
          });
        } else {
          actions.setFormMessage({
            type: 'error',
            message: `Failed to create series: ${error.message}`
          });
        }
      }
    }
  });

  // Example 3: Season editing with change tracking
  registerFormCustomization("season", "edit", {
    fieldsCustomization: {},
    beforeSubmit:
    async (formData, collectionChanges, transformedData, actions) => {
      console.log('Before updating season:', { formData, collectionChanges, transformedData });
      
      // Example: Track significant changes
      const originalTitle = (formData.title as { __originalValue?: unknown })?.__originalValue;
      const currentTitle = (formData.title as { value?: unknown })?.value;
      
      if (originalTitle !== currentTitle) {
        actions.setFormMessage({
          type: 'info',
          message: 'Season title changed. This may affect episode listings and search.'
        });
      }
      
      // Example: Validate episode count changes with potential blocking
      if (collectionChanges.episodes) {
        const { added, deleted } = collectionChanges.episodes;
        const netChange = added.length - deleted.length;
        
        if (netChange > 0) {
          actions.setFormMessage({
            type: 'info',
            message: `Added ${netChange} episode(s) to this season.`
          });
        } else if (netChange < 0) {
          // Warn about deleting too many episodes
          if (Math.abs(netChange) > 10) {
            actions.setFormMessage({
              type: 'error',
              message: `You are trying to delete ${Math.abs(netChange)} episodes. This is not allowed for data integrity.`
            });
            return false; // Block submission
          } else {
            actions.setFormMessage({
              type: 'warning',
              message: `Removed ${Math.abs(netChange)} episode(s) from this season. This action cannot be undone.`
            });
          }
        }
      }
      
      // Continue with submission
      return true;
    },
    onSuccess: async (result) => {
      console.log('Season updated successfully:', result);
      
      return {
        message: 'Season updated successfully!',
        navigateTo: undefined, // Stay on edit page
        action: () => {
          console.log('Season edit completed');
        }
      };
    },
    onError: async (error, formData, actions) => {
      console.error('Error updating season:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          actions.setFormMessage({
            type: 'error',
            message: 'Season not found. It may have been deleted by another user.'
          });
        } else if (error.message.includes('episodes')) {
          actions.setFormMessage({
            type: 'error',
            message: 'Cannot delete season with existing episodes. Please remove all episodes first.'
          });
        } else {
          actions.setFormMessage({
            type: 'error',
            message: `Failed to update season: ${error.message}`
          });
        }
      }
    }
  });
}

// Call this function in your app initialization
// setupEntityLevelCallbacksExample();
