// Third party imports
import { ValidatorFn } from '@angular/forms';

/**
 * Interface defining configurable options for the input dropdown
 */
export interface InputDropdownSettings {
  /** AllowSearchFilter: Enable filter option for the list. */
  allowSearchFilter?: boolean;
  /** DataConfig: Data mapping configuration for the dropdown list item. */
  dataConfig?: {
    /** IdField: Field name for the id of the list item. */
    idField?: string;
    /** TextField: Field name for the text of the list item. */
    textField?: string;
    /** DisabledField: Field name for the disabled state of the list item. */
    disabledField?: string;
  };
  /** DataFetched: Set to true if data is fetched from an endpoint. */
  dataFetched?: boolean;
  /** Disable: Disable the dropdown */
  disabled?: boolean;
  /** EnableCheckAll: Enable the option to select all items in list	 */
  enableCheckAll?: boolean;
  /** ItemsShowLimit: Limit the number of items to show in the input field. If not set will show all selected.	 */
  itemsShowLimit?: number;
  /** LabelHidden: Hide the label of the dropdown */
  labelHidden?: boolean;
  /** LimitSelection: Limit the selection of number of items from the dropdown list. Once the limit is reached, all unselected items gets disabled. */
  limitSelection?: number;
  /** MaxHeight: Set maximum height of the dropdown list in px. */
  maxHeight?: number;
  /** Mode: Display modes for selected items */
  mode?: 'chip' | 'delimiter';
  /** Open: Open state of dropdown */
  open?: boolean;
  /** PlaceholdersText: Custom placeholder text */
  placeholdersText?: {
    /** DisplayPlaceholderText: Text to be show in the display, when no items are selected. */
    displayPlaceholderText?: string;
    /** NoDataAvailablePlaceholderText: Text to be show in the dropdown, when no data available from endpoint. */
    noDataAvailablePlaceholderText?: string;
    /** NoResultsFoundPlaceholderText: Text to be show in the dropdown, when no matched data found after filter. */
    noResultsFoundPlaceholderText?: string;
    /** SearchPlaceholderText: Text to be show in the dropdown filter, when no filter input provided. */
    searchPlaceholderText?: string;
  };
  /** SelectAllText: Text to display as the label of select all option */
  selectAllText?: string;
  /** SingleSelection: Mode of this component. If set true user can select more than one option. */
  singleSelection?: boolean;
  /** UnSelectAllText: Text to display as the label of unSelect option */
  unSelectAllText?: string;
  /** Validators: Array of validators to be applied to the input */
  validators?: {
    /** ErrorKey: Key to be used for the error message */
    errorKey: string;
    /** ErrorMessage: Error message to be displayed */
    errorMessage: string;
    /** Validator: Validator function to be applied */
    validator: ValidatorFn;
  }[];
}

/**
 * Interface defining the structure of a list item
 */
export class ListItem {
  id: string | number = '';
  text: string | number = '';
  isDisabled?: boolean;

  // Map the source to the ListItem model
  public constructor(source: any) {
    if (typeof source === 'string' || typeof source === 'number') {
      this.id = this.text = source;
      this.isDisabled = false;
    }
    if (typeof source === 'object') {
      this.id = source.id;
      this.text = source.text;
      this.isDisabled = source.isDisabled;
    }
  }
}
