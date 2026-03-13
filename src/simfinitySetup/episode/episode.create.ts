import { registerFormCustomization } from '@simtlix/simfinity-fe-components';

export function registerEpisodeCreateCustomization() {
  registerFormCustomization("episode", "create", {
    mode: "stepper",
    steps: [
      {
        stepId: "basic-info",
        stepLabel: "Basic Information"
      },
      {
        stepId: "season-info",
        stepLabel: "Season"
      }
    ],
    fieldsCustomization: {
      name: {
        stepId: "basic-info",
        size: { xs: 12, sm: 12, md: 12 },
        order: 1,
        onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
          console.log('Episode name changed:', { fieldName, value, formData });
          if (value && String(value).trim() !== '') {
            setFieldEnabled('number', true);
            setFieldEnabled('season', true);
            setFieldData('number', 1);
          } else {
            setFieldEnabled('number', false);
            setFieldEnabled('season', false);
            setFieldData('number', "");
            setFieldData('season', "");
          }
          return { value, error: undefined };
        }
      },

      number: {
        stepId: "basic-info",
        size: { xs: 12, sm: 6, md: 6 },
        order: 2,
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
        stepId: "basic-info",
        size: { xs: 12, sm: 6, md: 6 },
        order: 3,
        onChange: (fieldName, value, formData) => {
          console.log('Episode date changed:', { fieldName, value, formData });
          return { value, error: undefined };
        }
      },

      season: {
        stepId: "season-info",
        size: { xs: 12, sm: 12, md: 12 },
        order: 1,
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
    }
  });
}
