import { registerFormCustomization } from '@/lib/formCustomization';

// Episode form customization
// This should be called early in your application, typically in a layout or main component

export function setupEpisodeFormCustomization() {
  registerFormCustomization("episode", {
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
          // If name is empty, disable number and season fields
          setFieldEnabled('number', false);
          setFieldEnabled('season', false);
        }
        
        return { value, error: undefined };
      }
    },
    
    number: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices
      order: 2, // Second in the row (same row as name)
      enabled: false, // Initially disabled until name is entered
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
      enabled: false, // Initially disabled until name is entered
      onChange: (fieldName, value, formData) => {
        console.log('Episode season changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    }
  });
}

// Call this function in your app initialization
// setupEpisodeFormCustomization();
