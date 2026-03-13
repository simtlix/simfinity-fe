import { registerSerieCreateCustomization } from './serie.create';
import { registerSerieEditCustomization } from './serie.edit';
import { registerSerieViewCustomization } from './serie.view';

export function setupSerieFormCustomization() {
  registerSerieCreateCustomization();
  registerSerieEditCustomization();
  registerSerieViewCustomization();
}
