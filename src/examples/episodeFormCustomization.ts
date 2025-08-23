import { registerFormCustomization } from '@/lib/formCustomization';

// Episode form customization
// This should be called early in your application, typically in a layout or main component

export function setupEpisodeFormCustomization() {
  registerFormCustomization("episode", {
    name: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices
      order: 1, // First in the row
      onChange: (fieldName, value, formData) => {
        console.log('Episode name changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    
    number: {
      size: { xs: 12, sm: 6, md: 6 }, // Half width on small+ devices
      order: 2, // Second in the row (same row as name)
      onChange: (fieldName, value, formData) => {
        console.log('Episode number changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    },
    
    airDate: {
      size: { xs: 12, sm: 12, md: 12 }, // Full width (second row)
      order: 3, // Third in order (second row)
      onChange: (fieldName, value, formData) => {
        console.log('Episode air date changed:', { fieldName, value, formData });
        return { value, error: undefined };
      }
    }
  });
}

// Call this function in your app initialization
// setupEpisodeFormCustomization();
