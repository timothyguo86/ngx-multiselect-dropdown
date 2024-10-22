// Third party imports
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function AtlantaSelectedValidator(
  control: AbstractControl,
): ValidationErrors | null {
  if (Array.isArray(control.value)) {
    const selectedItems = control.value;
    const atlantaSelected = selectedItems.some(
      (item: any) => item.item_text === 'Atlanta',
    );

    if (!atlantaSelected) {
      return { atlantaSelected: true };
    }
  }

  return null;
}
