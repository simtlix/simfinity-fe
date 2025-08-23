import { registerFormCustomization } from '@/lib/formCustomization';

// Example of how to use the form customization system
// This should be called early in your application, typically in a layout or main component

export function setupFormCustomizations() {
  // Example 1: Customize a "serie" entity form (create mode)
  registerFormCustomization("serie", "create", {
    name: {
      size: { xs: 12, sm: 6, md: 4 },
      enabled: true, // default is true
      visible: true, // default is true
      order: 1, // order in the form (lower numbers appear first)
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
        // Example: Auto-capitalize the first letter
        const stringValue = String(value);
        const capitalizedValue = stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
        
        // Example: Show/hide other fields based on this value
        if (stringValue.toLowerCase().includes('movie')) {
          setFieldVisible('director', true);
          setFieldVisible('year', true);
        } else {
          setFieldVisible('director', false);
          setFieldVisible('year', false);
        }
        
        // Example: Enable/disable fields based on value
        if (stringValue.length > 10) {
          setFieldEnabled('description', true);
        } else {
          setFieldEnabled('description', false);
        }
        
        return { value: capitalizedValue, error: undefined };
      }
    },
    
    director: {
      size: { xs: 12, sm: 6, md: 4 },
      enabled: true,
      visible: true,
      order: 2,
      onChange: (fieldName, value, formData, setFieldData) => {
        // Example: Auto-fill country field when director is selected
        if (value && typeof value === 'string') {
          // Simulate fetching director info and setting related fields
          setFieldData('country', 'United States'); // This would come from API
        }
        
        return { value, error: undefined };
      }
    },
    
    year: {
      size: { xs: 12, sm: 6, md: 4 },
      enabled: true,
      visible: true,
      order: 3
    },
    
    categories: {
      size: { xs: 12, sm: 6, md: 4 },
      enabled: true,
      visible: true,
      order: 4,
      onChange: (fieldName, value, formData, setFieldData, setFieldVisible) => {
        // Example: Show genre-specific fields based on categories
        if (Array.isArray(value) && value.includes('Horror')) {
          setFieldVisible('rating', true);
          setFieldVisible('ageRestriction', true);
        } else {
          setFieldVisible('rating', false);
          setFieldVisible('ageRestriction', false);
        }
        
        return { value, error: undefined };
      }
    },
    
    description: {
      size: { xs: 12, sm: 12, md: 8 }, // Larger field for description
      enabled: false, // Initially disabled
      visible: true,
      order: 5
    },
    
    rating: {
      size: { xs: 12, sm: 6, md: 4 },
      enabled: true,
      visible: false, // Initially hidden
      order: 6
    },
    
    ageRestriction: {
      size: { xs: 12, sm: 6, md: 4 },
      enabled: true,
      visible: false, // Initially hidden
      order: 7
    }
  });

  // Example 2: Customize an "episode" entity form (create mode)
  registerFormCustomization("episode", "create", {
    number: {
      size: { xs: 12, sm: 6, md: 3 },
      order: 1
    },
    
    name: {
      size: { xs: 12, sm: 6, md: 6 },
      order: 2
    },
    
    airDate: {
      size: { xs: 12, sm: 6, md: 3 },
      order: 3
    },
    
    season: {
      size: { xs: 12, sm: 6, md: 4 },
      order: 4,
      onChange: (fieldName, value, formData, setFieldData) => {
        // Example: Auto-fill series field based on season
        const serieData = formData as Record<string, { value?: unknown }>;
        if (value && serieData.serie?.value) {
          // This would typically fetch from API based on season
          setFieldData('serie', serieData.serie.value as string | number | boolean | string[] | null);
        }
        
        return { value, error: undefined };
      }
    }
  });

  // Example 3: Demonstrate embedded section customization with setFieldData examples (create mode)
  registerFormCustomization("serie", "create", {
    // Section-level customization for the "director" embedded object
    director: {
      size: { xs: 12, sm: 6, md: 6 }, // Section takes half the screen on medium+ devices
      order: 3, // Appears after name and categories
      visible: true,
      enabled: true
    },
    
    // Field-level customization for fields within the "director" embedded object
    "director.name": {
      size: { xs: 12, sm: 6, md: 6 }, // Field takes half the section width
      onChange: (fieldName, value, formData, setFieldData) => {
        // Auto-capitalize director name
        if (value && typeof value === 'string') {
          const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
          
          // Example: Auto-fill related fields when director name changes
          if (capitalized.toLowerCase().includes('gilligan')) {
            setFieldData('director.country', 'United States');
            setFieldData('director.genre', 'Drama');
          }
          
          return { value: capitalized, error: undefined };
        }
        return { value, error: undefined };
      }
    },
    
    "director.country": {
      size: { xs: 12, sm: 6, md: 6 }, // Field takes the other half of the section width
      onChange: (fieldName, value, formData, setFieldData) => {
        // Example: Auto-fill production company based on country
        if (value === 'United States') {
          setFieldData('production.company', 'AMC Networks');
        } else if (value === 'United Kingdom') {
          setFieldData('production.company', 'BBC Studios');
        }
        
        return { value, error: undefined };
      }
    },
    
    // Another section that can appear in the same row
    "production": {
      size: { xs: 12, sm: 6, md: 6 }, // Section takes the other half of the screen
      order: 4, // Appears after director section
      visible: true,
      enabled: true
    },
    
    "production.company": {
      size: { xs: 12, sm: 12, md: 12 } // Field takes full width of its section
    },
    
    "production.year": {
      size: { xs: 12, sm: 6, md: 6 } // Field takes half the section width
    },
    
    "production.budget": {
      size: { xs: 12, sm: 6, md: 6 } // Field takes the other half of the section width
    }
  });

  // Example 4: Demonstrate setFieldData with different field types (create mode)
  registerFormCustomization("episode", "create", {
    name: {
      onChange: (fieldName, value, formData, setFieldData) => {
        // Example: Auto-fill episode number based on name pattern
        if (value && typeof value === 'string') {
          const match = value.match(/Episode (\d+)/);
          if (match) {
            setFieldData('number', parseInt(match[1]));
          }
        }
        
        return { value, error: undefined };
      }
    },
    
    // Example: Object field (ObjectFieldSelector) - setting the selected object ID
    serie: {
      onChange: (fieldName, value, formData, setFieldData) => {
        // When a serie is selected, auto-fill related fields
        if (value) {
          // Example: Fetch serie details and auto-fill fields
          // In a real app, you might call an API here
          setFieldData('season', 1);
          setFieldData('airDate', '2023-01-15');
          
          // You can also set embedded field values
          setFieldData('production.company', 'AMC Networks');
          setFieldData('production.year', 2023);
        }
        
        return { value, error: undefined };
      }
    },
    
    // Example: Embedded field with complex logic
    "production.budget": {
      onChange: (fieldName, value, formData, setFieldData) => {
        // Auto-calculate budget based on episode length and complexity
        const formDataTyped = formData as Record<string, { value?: unknown }>;
        const episodeNumber = formDataTyped.number?.value;
        const season = formDataTyped.season?.value;
        
        if (episodeNumber && season) {
          let baseBudget = 1000000; // Base budget
          
          // Increase budget for season finales
          if (Number(episodeNumber) >= 10) {
            baseBudget += 500000;
          }
          
          // Increase budget for later seasons
          if (Number(season) > 3) {
            baseBudget += 200000;
          }
          
          setFieldData('production.budget', baseBudget);
        }
        
        return { value, error: undefined };
      }
    }
  });
}

// Call this function in your app initialization
// setupFormCustomizations();
