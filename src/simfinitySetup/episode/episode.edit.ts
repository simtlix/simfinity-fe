import { registerFormCustomization } from '@simtlix/simfinity-fe-components';

export function registerEpisodeEditCustomization() {
  registerFormCustomization("episode", "edit", {
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
        size: { xs: 12, sm: 6, md: 6 },
        order: 1,
        onChange: (fieldName, value, formData, setFieldData, setFieldVisible, setFieldEnabled) => {
          console.log('Episode name changed in edit mode:', { fieldName, value, formData });
          if (value && String(value).trim() !== '') {
            setFieldEnabled('number', true);
            setFieldEnabled('season', true);
          }
          return { value, error: undefined };
        }
      },

      number: {
        stepId: "basic-info",
        size: { xs: 12, sm: 6, md: 6 },
        order: 2,
        enabled: true
      },

      date: {
        stepId: "basic-info",
        size: { xs: 12, sm: 6, md: 6 },
        order: 3
      },

      season: {
        stepId: "season-info",
        size: { xs: 12, sm: 6, md: 6 },
        order: 4,
        enabled: true
      }
    }
  });
}
