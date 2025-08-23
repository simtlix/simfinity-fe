import { registerFormCustomization } from '@/lib/formCustomization';

// Episode form customization
// This should be called early in your application, typically in a layout or main component

export function setupEpisodeFormCustomization() {
  // Register customization for create mode
  registerFormCustomization("episode", "create", {
    name: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices
      order: 1, // First in the row
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
        console.log('Episode name changed:', { fieldName, value, formData });
        
        // If name has a value, enable number and season fields and set number to 1
        if (value && String(value).trim() !== '') {
          setFieldEnabled('number', true);
          setFieldEnabled('season', true);
          setFieldData('number', 1);
        } else {
          // If name is empty, disable number and season fields and clear their values
          setFieldEnabled('number', false);
          setFieldEnabled('season', false);
          setFieldData('number', "");
          setFieldData('season', "");
        }
        
        return { value, error: undefined };
      }
    },
    
    number: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices
      order: 2, // Second in the row (same row as name)
      // Dynamic enabled: only enabled when name has a value
      enabled: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const nameValue = formDataTyped.name?.value;
        return !!(nameValue && String(nameValue).trim() !== '');
      },
      onChange: (fieldName, value, formData) => {
        console.log('Episode number changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    
    date: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices (second row)
      order: 3, // Third in order (second row)
      onChange: (fieldName, value, formData) => {
        console.log('Episode date changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    
    season: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices (second row)
      order: 4, // Fourth in order (second row, at the end)
      // Dynamic enabled: only enabled when name has a value
      enabled: (fieldName, value, formData) => {
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const nameValue = formDataTyped.name?.value;
        return !!(nameValue && String(nameValue).trim() !== '');
      },
      onChange: (fieldName, value, formData) => {
        console.log('Episode season changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    }
  });

  // Register customization for edit mode (different behavior)
  registerFormCustomization("episode", "edit", {
    name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 1,
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
        console.log('Episode name changed in edit mode:', { fieldName, value, formData });
        
        // In edit mode, we don't auto-fill or disable fields as aggressively
        if (value && String(value).trim() !== '') {
          setFieldEnabled('number', true);
          setFieldEnabled('season', true);
        }
        
        return { value, error: undefined };
      }
    },
    
    number: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 2,
      enabled: true // Always enabled in edit mode
    },
    
    date: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 3
    },
    
    season: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 4,
      enabled: true // Always enabled in edit mode
    }
  });
}

// Call this function in your app initialization
// setupEpisodeFormCustomization();
