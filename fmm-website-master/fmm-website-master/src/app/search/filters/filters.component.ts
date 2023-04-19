import {AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Options } from 'ng5-slider';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../core/services/user.service';
import {MentorService} from '../../core/services/mentor.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.sass']
})
export class FiltersComponent implements OnInit, AfterViewInit {
  value = 100;
  highValue = 60;
  stars = [
    {number: '1', empty: '5432', text: '1 star & up'},
    {number: '12', empty: '543', text: '2 stars & up'},
    {number: '123', empty: '54', text: '3 stars & up'},
    {number: '1234', empty: '5', text: '4 stars & up'},
    {number: '12345', empty: '', text: '5'}].reverse();
  public categories;
  options: Options = {
    floor: 0,
    ceil: 200,
    getSelectionBarColor: () => {return '#D19733'},
    getPointerColor: () => {return '#ffffff'}
  };
  public countries;
  public filtersForm;
  @Input() mentors: boolean;
  @Output() filters = new EventEmitter<FormGroup>();
  constructor(private formBuilder: FormBuilder,
              private mentorService: MentorService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.mentorService.getAllExpertise().subscribe( data =>  this.categories = data);
    this.userService.getCountries().subscribe(data => this.countries = data);
    this.filtersForm = this.formBuilder.group({
      years: ['', Validators.required],
      user__personal_info__country_of_origin: [''],
      user__personal_info__city__icontains: [''],
      title__icontains: [''],
      price: [''],
      user__personal_info__gender: [''],
    });
  }

  ngAfterViewInit(): void {
    this.filtersForm.valueChanges.subscribe(() => {
      this.filters.emit(this.filtersForm.value);
    })
  }

  clearFilters() {
    this.filtersForm.reset();
  }
}
