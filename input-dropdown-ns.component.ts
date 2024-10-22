// Third-party imports
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
// Local imports
import { InputDropdownListFilterPipe } from './input-dropdown-list-filter.pipe';
import {
  InputDropdownSettings,
  ListItem,
} from '../../interfaces/input-dropdown-ns';

// Control Value Accessor for the component
export const DROPDOWN_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputDropdownNsComponent),
  multi: true,
};

// Helper function for ControlValueAccessor interface
const noop = (): void => {};

@Component({
  selector: 'input-dropdown-ns',
  standalone: true,
  imports: [CommonModule, FormsModule, InputDropdownListFilterPipe],
  templateUrl: './input-dropdown-ns.component.html',
  styleUrls: ['./input-dropdown-ns.component.scss'],
  providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR, InputDropdownListFilterPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDropdownNsComponent implements ControlValueAccessor, OnInit {
  // Label for the dropdown
  @Input({ required: true }) label: string = '';
  // Form control name for the dropdown
  @Input() formControlName: string | undefined = undefined;
  // Dropdown settings object
  @Input() set settings(value: InputDropdownSettings) {
    this._settings = value
      ? Object.assign(this.defaultSettings, value)
      : Object.assign(this.defaultSettings);
  }
  // Dropdown data
  @Input() set data(value: Array<any>) {
    if (value) {
      const firstItem = value[0];
      this._sourceDataType = typeof firstItem;
      this._sourceDataFields = this.getFields(firstItem);
      this._data = value.map((item: any) =>
        typeof item === 'string' || typeof item === 'number'
          ? new ListItem(item)
          : new ListItem({
              id: item[this._settings.dataConfig?.idField ?? ''],
              text: item[this._settings.dataConfig?.textField ?? ''],
              isDisabled: item[this._settings.dataConfig?.disabledField ?? ''],
            }),
      );
      this.filteredData = this._data;
    } else {
      this._data = [];
    }
  }

  // Event emitter whenever the filter changes
  @Output() onFilterChange: EventEmitter<{
    filterItem: ListItem;
    matchedCount: number;
  }> = new EventEmitter<any>();
  // Event emitter when the dropdown is closed
  @Output() onDropDownClose: EventEmitter<ListItem> = new EventEmitter<any>();
  // Event emitter when a list item is selected
  @Output() onSelect: EventEmitter<ListItem> = new EventEmitter<any>();
  // Event emitter when a list item is deselected
  @Output() onDeSelect: EventEmitter<ListItem> = new EventEmitter<any>();
  // Event emitter when all list items are selected
  @Output() onSelectAll: EventEmitter<Array<ListItem>> = new EventEmitter<
    Array<any>
  >();
  // Event emitter when all list items are deselected
  @Output() onDeSelectAll: EventEmitter<Array<ListItem>> = new EventEmitter<
    Array<any>
  >();

  // Host class for the component
  @HostBinding('class')
  hostClass = 'inputDropdownContainer';

  // Close dropdown on click outside the component
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.closeDropdown();
    }
  }

  // Close dropdown on blur
  @HostListener('blur')
  public onTouched() {
    this.onTouchedCallback();
  }

  // Dropdown settings object
  public _settings: InputDropdownSettings = {};
  // Dropdown data
  public _data: Array<ListItem> = [];
  // Selected items in the dropdown
  public selectedItems: Array<ListItem> = [];
  // Filtered data based on the filter criteria
  public filteredData: Array<ListItem> = [];
  // Filter object for the dropdown
  public filter: ListItem = new ListItem(this.data);
  // Optional Form control for the dropdown
  public control: FormControl | undefined = undefined;

  // To keep note of the source data type. Could be array of string/number/object
  private _sourceDataType: any = null;
  // Store source data fields names
  private _sourceDataFields: Array<string> = [];
  // onTouched callback function for ControlValueAccessor
  private onTouchedCallback: () => void = noop;
  // onChange callback function for ControlValueAccessor
  private onChangeCallback: (_: any) => void = noop;

  // Default settings for the dropdown
  defaultSettings: InputDropdownSettings = {
    allowSearchFilter: false,
    dataConfig: {
      idField: 'id',
      textField: 'text',
      disabledField: 'disabled',
    },
    dataFetched: true,
    disabled: false,
    enableCheckAll: false,
    itemsShowLimit: 999999999999,
    labelHidden: false,
    limitSelection: -1,
    maxHeight: 225,
    mode: 'chip',
    open: false,
    placeholdersText: {
      displayPlaceholderText: '',
      noDataAvailablePlaceholderText: '',
      noResultsFoundPlaceholderText: '',
      searchPlaceholderText: 'Search',
    },
    selectAllText: 'Select All',
    singleSelection: false,
    unSelectAllText: 'Unselect All',
    validators: [],
  };

  constructor(
    readonly controlContainer: ControlContainer,
    readonly listFilterPipe: InputDropdownListFilterPipe,
    readonly cdr: ChangeDetectorRef,
    readonly elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    // Get the form control if formControlName is provided, and apply custom validators if any
    if (this.formControlName) {
      this.control = this.controlContainer.control?.get(
        this.formControlName,
      ) as FormControl;

      if (this._settings.validators) {
        this.applyCustomValidators();
      }
    }
  }

  // From ControlValueAccessor interface methods
  writeValue(value: any): void {
    if (value !== undefined && value !== null && value.length > 0) {
      if (this._settings.singleSelection) {
        this.handleSingleSelection(value);
      } else {
        this.handleMultipleSelection(value);
      }
    } else {
      this.selectedItems = [];
    }

    this.onChangeCallback(value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  // Event handlers to handle filter text change
  public onFilterTextChange = this.debounce((): void => {
    this.filteredData = this.listFilterPipe.transform(this._data, this.filter);
    this.onFilterChange.emit({
      filterItem: this.filter,
      matchedCount: this.filteredData.length,
    });
  }, 300);

  // Get the error messages for the form control
  public getErrorMessages(): any[] {
    let errorMessages = [];
    if (this.control?.errors) {
      for (let errorKey in this.control.errors) {
        errorMessages.push(
          this._settings.validators?.find(
            ({ errorKey: key }) => key === errorKey,
          )?.errorMessage,
        );
      }
    }
    if (this.control?.dirty) {
      return errorMessages;
    }

    return [];
  }

  // Event handlers to handle item selection
  public onItemClick(item: ListItem): void {
    if (this._settings.disabled || item.isDisabled) return;

    const found = this.isSelected(item);
    const allowAdd =
      this._settings.limitSelection === -1 ||
      (this._settings.limitSelection &&
        this._settings.limitSelection > 0 &&
        this.selectedItems.length < this._settings.limitSelection);
    if (!found && allowAdd) {
      this.addSelected(item);
    } else {
      this.removeSelected(item);
    }

    if (this._settings.singleSelection) this.closeDropdown();
  }

  // Method to check if an item is selected
  public isSelected(clickedItem: ListItem): boolean {
    return this.selectedItems.some((item) => clickedItem.id === item.id);
  }

  // Method to check if the limit of selection is reached
  public isLimitSelectionReached(): boolean {
    return this._settings.limitSelection === this.selectedItems.length;
  }

  // Method to check if all items are selected
  public isAllItemsSelected(): boolean {
    let filteredItems = this.listFilterPipe.transform(this._data, this.filter);
    const itemDisabledCount = filteredItems.filter(
      (item) => item.isDisabled,
    ).length;
    if (!this._data || this._data.length === 0) {
      return false;
    }
    return (
      filteredItems.length === this.selectedItems.length + itemDisabledCount
    );
  }

  // Method to get the count of items remaining to show
  public itemShowRemaining(): number {
    return this.selectedItems.length - (this._settings?.itemsShowLimit ?? 0);
  }

  // Method to toggle the dropdown
  public toggleDropdown(evt: any): void {
    evt.preventDefault();
    if (this._settings.disabled) {
      return;
    }
    this._settings.open = !this._settings.open;

    if (!this._settings.open) {
      this.onDropDownClose.emit();
    }

    this.filter.text = '';
  }

  // Method to close the dropdown
  public closeDropdown(): void {
    this._settings.open = false;
    this.onDropDownClose.emit();
  }

  // Method to toggle select all items
  public toggleSelectAll(): void {
    if (this._settings.disabled) return;

    if (!this.isAllItemsSelected()) {
      this.selectedItems = this.listFilterPipe
        .transform(this._data, this.filter)
        .filter((item) => !item.isDisabled)
        .slice();
      this.onSelectAll.emit(this.emittedValue(this.selectedItems));
    } else {
      this.selectedItems = [];
      this.onDeSelectAll.emit(this.emittedValue(this.selectedItems));
    }
    this.onChangeCallback(this.emittedValue(this.selectedItems));
  }

  // Method to clear the selection
  public clearSelection(): void {
    if (this._settings.disabled) return;

    this.selectedItems = [];
    this.onChangeCallback(this.emittedValue(this.selectedItems));
  }

  // Get the fields of the input data
  private getFields(inputData: any): string[] {
    const fields: string[] = [];
    if (typeof inputData !== 'object') {
      return fields;
    }
    for (const prop in inputData) {
      fields.push(prop);
    }
    return fields;
  }

  // Apply custom validators to the form control
  private applyCustomValidators(): void {
    this._settings.validators?.forEach(({ validator }) => {
      this.control?.addValidators(validator);
    });
    this.control?.updateValueAndValidity();
  }

  // Method to handle single selection
  private handleSingleSelection(value: any) {
    if (value.length >= 1) {
      const firstItem = value[0];
      this.selectedItems = [
        typeof firstItem === 'string' || typeof firstItem === 'number'
          ? new ListItem(firstItem)
          : new ListItem({
              id: firstItem[this._settings.dataConfig?.idField ?? ''],
              text: firstItem[this._settings.dataConfig?.textField ?? ''],
              isDisabled:
                firstItem[this._settings.dataConfig?.disabledField ?? ''],
            }),
      ];
    }
  }

  // Method to handle multiple selection
  private handleMultipleSelection(value: any) {
    const _data = value.map((item: any) =>
      typeof item === 'string' || typeof item === 'number'
        ? new ListItem(item)
        : new ListItem({
            id: item[this._settings.dataConfig?.idField ?? ''],
            text: item[this._settings.dataConfig?.textField ?? ''],
            isDisabled: item[this._settings.dataConfig?.disabledField ?? ''],
          }),
    );
    if (this._settings.limitSelection && this._settings.limitSelection > 0) {
      this.selectedItems = _data.splice(0, this._settings.limitSelection);
    } else {
      this.selectedItems = _data;
    }
  }

  // Method to add an item to the selected list
  private addSelected(item: ListItem): void {
    if (this._settings.singleSelection) {
      this.selectedItems = [];
      this.selectedItems.push(item);
    } else {
      this.selectedItems.push(item);
    }
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    this.onSelect.emit(this.emittedValue(item));
  }

  // Method to remove an item from the selected list
  private removeSelected(itemSel: ListItem): void {
    this.selectedItems.forEach((item) => {
      if (itemSel.id === item.id) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
      }
    });
    this.onChangeCallback(this.emittedValue(this.selectedItems));
    this.onDeSelect.emit(this.emittedValue(itemSel));
  }

  // Method to prepare the emitted value
  private emittedValue(val: any): any {
    const selected: any[] = [];
    if (Array.isArray(val)) {
      val.forEach((item) => {
        selected.push(this.objectify(item));
      });
    } else if (val) {
      return this.objectify(val);
    }
    return selected;
  }

  // Convert the ListItem object to the source data type
  private objectify(val: ListItem): any {
    if (this._sourceDataType === 'object') {
      const obj: any = {};
      if (this._settings.dataConfig?.idField) {
        obj[this._settings.dataConfig?.idField] = val.id;
      }
      if (this._settings.dataConfig?.textField) {
        obj[this._settings.dataConfig?.textField] = val.text;
      }
      if (
        this._settings.dataConfig?.disabledField &&
        this._sourceDataFields.includes(
          this._settings.dataConfig?.disabledField,
        )
      ) {
        obj[this._settings.dataConfig?.disabledField] = val.isDisabled;
      }
      return obj;
    }
    if (this._sourceDataType === 'number') {
      return Number(val.id);
    } else {
      return val.text;
    }
  }

  // Debounce utility function
  private debounce(func: Function, delay: number): Function {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
}
