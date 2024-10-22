// Third-party imports
import { Pipe, PipeTransform } from '@angular/core';
//  Local Imports
import { ListItem } from '../../interfaces/input-dropdown-ns';

/**
 * Pipe that filters a list of items based on a filter criteria.
 *
 * @pipe
 * @name inputDropdownListFilter
 * @standalone true
 * @pure false
 *
 * @example
 * ```html
 * @for (item of items | inputDropdownListFilter: filter; track $index)
 * ```
 *
 * @class
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'inputDropdownListFilter',
  standalone: true,
  pure: false,
})
export class InputDropdownListFilterPipe implements PipeTransform {
  // Transform function that filters an array of listItems based on a filter criteria
  public transform(items: ListItem[], filter: ListItem): ListItem[] {
    if (!items || !filter) return items;

    return items.filter((item: ListItem) => this.applyFilter(item, filter));
  }

  // Function that applies the filter criteria to each listItem
  private applyFilter(item: ListItem, filter: ListItem): boolean {
    if (typeof item.text === 'string' && typeof filter.text === 'string') {
      return !(
        filter.text &&
        item.text &&
        item.text.toLowerCase().indexOf(filter.text.toLowerCase()) === -1
      );
    } else {
      return !(
        filter.text &&
        item.text &&
        item.text
          .toString()
          .toLowerCase()
          .indexOf(filter.text.toString().toLowerCase()) === -1
      );
    }
  }
}
