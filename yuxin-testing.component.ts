// Third-party imports
import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// First-party imports
import {
  InputDropdownNsComponent,
  InputDropdownSettings,
  ListItem,
  PageTitleComponent,
} from 'components-ng-shared';
// Local imports
import { AtLeastTwoItemsSelectedValidator } from './custom-validators/atLeastTwoItemsSelected.validator';
import { AtlantaSelectedValidator } from './custom-validators/atlantaSelected.validator';
@Component({
  selector: 'app-yuxin-testing',
  standalone: true,
  imports: [
    PageTitleComponent,
    InputDropdownNsComponent,
    JsonPipe,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './yuxin-testing.component.html',
  styleUrls: ['./yuxin-testing.component.scss'],
})
export class YuxinTestingComponent implements OnInit {
  mockedData: Array<any> = [];
  disable = false;
  disableChamblee = true;
  dropdownSettings: InputDropdownSettings = {};
  itemsShowLimit = 99999999;
  labelHidden = false;
  limitSelection = -1;
  mode: 'chip' | 'delimiter' | undefined = 'chip';
  myForm: FormGroup = new FormGroup({});
  selectedItems: Array<any> = [];
  singleSelection = false;
  showAll = true;
  showFilter = true;
  showLimit = false;

  constructor(readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.dropdownSettings = {
      allowSearchFilter: this.showFilter,
      dataConfig: {
        idField: 'item_id',
        textField: 'item_text',
        disabledField: 'isDisabled',
      },
      dataFetched: false,
      disabled: this.disable,
      enableCheckAll: this.showAll,
      itemsShowLimit: this.itemsShowLimit,
      labelHidden: this.labelHidden,
      limitSelection: this.limitSelection,
      mode: this.mode,
      placeholdersText: {
        displayPlaceholderText: 'Select Cities',
        noDataAvailablePlaceholderText:
          'There is no data available. Please try again later or contact our support at (123) 456-7890',
        noResultsFoundPlaceholderText: 'No matched cities found',
        searchPlaceholderText: 'Search Cities',
      },
      singleSelection: this.singleSelection,
      validators: [
        {
          errorKey: 'required',
          errorMessage: '- This field is required',
          validator: Validators.required,
        },
        {
          errorKey: 'atLeastTwoItemSelected',
          errorMessage: '- Please select at least two cities',
          validator: AtLeastTwoItemsSelectedValidator,
        },
        {
          errorKey: 'atlantaSelected',
          errorMessage: '- Please at least select Atlanta',
          validator: AtlantaSelectedValidator,
        },
      ],
    };

    // Mock data
    // this.mockedData = this.mockedCitiesData;

    // Mock fetching data from an endpoint
    this.fetchData()
      .then((data) => {
        this.mockedData = data;
        this.dropdownSettings = {
          ...this.dropdownSettings,
          dataFetched: true,
        };
      })
      .catch((error) => {
        console.error(error);
        this.dropdownSettings = {
          ...this.dropdownSettings,
          dataFetched: true,
        };
      });

    this.myForm = this.fb.group({
      city: [
        this.selectedItems,
        [
          Validators.required,
          AtLeastTwoItemsSelectedValidator,
          AtlantaSelectedValidator,
        ],
      ],
    });
  }

  // Event handlers for emitting events from the dropdown component
  public handleOnSelect(item: any): void {
    console.log('%c onItemSelect', 'background: #0f5cf5; color: white;', item);
    console.log(
      '%c form value',
      'background: #0f5cf5; color: white;',
      this.myForm.get('city')?.value,
    );
    this.selectedItems = this.myForm?.get('city')?.value;
  }

  public handleOnDeSelect(item: any): void {
    console.log(
      '%c onItemDeSelect',
      'background: #d82511; color: white;',
      item,
    );
    console.log(
      '%c form value',
      'background: #d82511; color: white;',
      this.myForm.get('city')?.value,
    );
    this.selectedItems = this.myForm?.get('city')?.value;
  }

  public handleOnSelectAll(items: any): void {
    console.log('%c onSelectAll', 'background: #d97906; color: white;', items);
    setTimeout(() => {
      console.log(
        '%c form value',
        'background: #d97906; color: white;',
        this.myForm.get('city')?.value,
      );
      this.selectedItems = this.myForm?.get('city')?.value;
    }, 0);
  }

  public handleOnDeSelectAll(items: any): void {
    console.log(
      '%c onDeSelectAll',
      'background: #62309b; color: white;',
      items,
    );
    setTimeout(() => {
      console.log(
        '%c form value',
        'background: #62309b; color: white;',
        this.myForm.get('city')?.value,
      );
      this.selectedItems = this.myForm?.get('city')?.value;
    }, 0);
  }

  public handleOnFilterChange(item: any): void {
    console.log('%c onFilterChange', 'background: #21b787; color: #333', item);
  }

  public handleOnDropDownClose(): void {
    console.log('dropdown closed');
  }

  public toggleLabel(): void {
    this.labelHidden = !this.labelHidden;
    this.dropdownSettings = {
      ...this.dropdownSettings,
      labelHidden: this.labelHidden,
    };
  }

  // Methods for updating dropdown settings
  public toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.dropdownSettings = {
      ...this.dropdownSettings,
      enableCheckAll: this.showAll,
    };
  }

  public toggleShowFilter(): void {
    this.showFilter = !this.showFilter;
    this.dropdownSettings = {
      ...this.dropdownSettings,
      allowSearchFilter: this.showFilter,
    };
  }

  public toggleShowLimit(): void {
    this.showLimit = !this.showLimit;
    this.dropdownSettings = {
      ...this.dropdownSettings,
      itemsShowLimit: this.showLimit ? 3 : 99999999,
    };
  }

  public toggleLimitSelection(): void {
    this.limitSelection = this.limitSelection === -1 ? 2 : -1;
    this.dropdownSettings = {
      ...this.dropdownSettings,
      limitSelection: this.limitSelection,
    };
  }

  // Toggle single selection mode
  public toggleSingleSelection(): void {
    this.singleSelection = !this.singleSelection;
    this.dropdownSettings = {
      ...this.dropdownSettings,
      singleSelection: this.singleSelection,
    };
  }

  public toggleDisableChamblee(): void {
    this.disableChamblee = !this.disableChamblee;
    this.mockedData[2].isDisabled = this.disableChamblee;
    this.mockedData = [...this.mockedData];
  }

  public toggleDisable(): void {
    this.disable = !this.disable;
    this.dropdownSettings = {
      ...this.dropdownSettings,
      disabled: this.disable,
    };
  }

  public toggleMode(): void {
    this.dropdownSettings = {
      ...this.dropdownSettings,
      mode: this.dropdownSettings.mode === 'chip' ? 'delimiter' : 'chip',
    };
  }

  public resetForm(): void {
    const cityControl = this.myForm?.get('city');
    if (cityControl) {
      cityControl.setValue([]);
    }
    this.selectedItems = this.myForm?.get('city')?.value;
  }

  public submitForm(items: ListItem[]): void {
    console.log(
      '%c form submitted',
      'background: #0f5cf5; color: white;',
      items,
    );
  }

  private fetchData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = true;
        if (success) {
          resolve(this.mockedCitiesData);

          console.info(
            '%c cities data fetched successfully',
            'background: #00875A; color: white;',
          );
        } else {
          reject(new Error('Error fetching data.'));
        }
      }, 2000);
    });
  }

  readonly mockedCitiesData = [
    { item_id: 1, item_text: 'Atlanta' },
    { item_id: 2, item_text: 'Duluth' },
    {
      item_id: 3,
      item_text: 'Chamblee',
      isDisabled: this.disableChamblee,
    },
    { item_id: 4, item_text: 'Sandy Springs' },
    {
      item_id: 5,
      item_text:
        'Lorem ipsum dolor sit amet consecing elit Nullam nec purus et nunc Donec auctor nunc nec Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam nec purus et nunc Donec auctor nunc nec Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam nec purus et nunc Donec auctor nunc nec Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam elit Nullam nec purus et nunc Donec auctor nunc nec Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam nec purus et nunc Donec auctor nunc nec Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam nec purus et nunc Donec auctor nunc nec Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam nec purus et nunc nec purus et nunc Donec auctor nunc nec',
    },
    { item_id: 6, item_text: 'Roswell' },
    { item_id: 7, item_text: 'Alpharetta' },
    { item_id: 8, item_text: 'Johns Creek' },
    { item_id: 9, item_text: 'Suwanee' },
    { item_id: 10, item_text: 'Lawrenceville' },
    { item_id: 11, item_text: 'Lilburn' },
    { item_id: 12, item_text: 'Snellville' },
    { item_id: 13, item_text: 'Buford' },
    { item_id: 14, item_text: 'Sugar Hill' },
    { item_id: 15, item_text: 'Gwinnett' },
    { item_id: 16, item_text: 'Acworth' },
    { item_id: 17, item_text: 'Kennesaw' },
    { item_id: 18, item_text: 'Cartersville' },
    { item_id: 19, item_text: 'Rome' },
    { item_id: 20, item_text: 'Dalton' },
    { item_id: 21, item_text: 'Athens' },
    { item_id: 22, item_text: 'Gainesville' },
    { item_id: 23, item_text: 'Macon' },
    { item_id: 24, item_text: 'Warner Robins' },
    { item_id: 25, item_text: 'Columbus' },
    { item_id: 26, item_text: 'LaGrange' },
    { item_id: 27, item_text: 'Albany' },
    { item_id: 28, item_text: 'Thomasville' },
    { item_id: 29, item_text: 'Savannah' },
    { item_id: 30, item_text: 'Brunswick' },
    { item_id: 31, item_text: 'Valdosta' },
    { item_id: 32, item_text: 'Waycross' },
    { item_id: 33, item_text: 'Augusta' },
    { item_id: 34, item_text: 'Fort Gordon' },
    { item_id: 35, item_text: 'Statesboro' },
    { item_id: 36, item_text: 'Milledgeville' },
    { item_id: 37, item_text: 'Americus' },
    { item_id: 38, item_text: 'Bainbridge' },
    { item_id: 39, item_text: 'Moultrie' },
    { item_id: 40, item_text: 'Tifton' },
    { item_id: 41, item_text: 'Cordele' },
    { item_id: 42, item_text: 'Fitzgerald' },
    { item_id: 43, item_text: 'Douglas' },
    { item_id: 44, item_text: 'Valdosta' },
    { item_id: 45, item_text: 'Waycross' },
    { item_id: 46, item_text: 'Augusta' },
    { item_id: 47, item_text: 'Fort Gordon' },
    { item_id: 48, item_text: 'Statesboro' },
    { item_id: 49, item_text: 'Milledgeville' },
    { item_id: 50, item_text: 'Americus' },
    { item_id: 51, item_text: 'Bainbridge' },
    { item_id: 52, item_text: 'Moultrie' },
    { item_id: 53, item_text: 'Tifton' },
    { item_id: 54, item_text: 'Cordele' },
    { item_id: 55, item_text: 'Fitzgerald' },
    { item_id: 56, item_text: 'Douglas' },
    { item_id: 57, item_text: 'Jesup' },
    { item_id: 58, item_text: 'Waycross' },
    { item_id: 59, item_text: 'Brunswick' },
    { item_id: 60, item_text: 'Darien' },
    { item_id: 61, item_text: 'St. Marys' },
    { item_id: 62, item_text: 'Kingsland' },
    { item_id: 63, item_text: 'Folkston' },
    { item_id: 64, item_text: 'Nahunta' },
    { item_id: 65, item_text: 'Blackshear' },
    { item_id: 66, item_text: 'Waycross' },
    { item_id: 67, item_text: 'Alma' },
    { item_id: 68, item_text: 'Douglas' },
    { item_id: 69, item_text: 'Valdosta' },
    { item_id: 70, item_text: 'Waycross' },
  ];
}
