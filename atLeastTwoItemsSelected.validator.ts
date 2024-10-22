// Third party imports
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function AtLeastTwoItemsSelectedValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (Array.isArray(control.value) && control.value.length < 2) {
    return { atLeastTwoItemSelected: true };
  }

  return null;
}
