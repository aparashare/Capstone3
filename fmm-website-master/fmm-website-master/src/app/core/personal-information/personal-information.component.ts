import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {FormBuilder, Validators, FormGroup, AbstractControl} from '@angular/forms';
import {UserService} from '../services/user.service';
import {User} from '../models/User';
import {UploadService} from '../services/file-upload.service';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.sass']
})
export class PersonalInformationComponent implements OnInit, OnDestroy {
  public days;
  public months;
  public years;
  public fileData: File = null;
  public url = null;
  public personalInformationForm: FormGroup;
  public personalInformation;
  public user: User;
  public avatar_url: any;
  public countries;
  @Input() status: boolean;
  @Output() infoChange = new EventEmitter<any>();
  private subscription;

  public readonly REQUIRED_FIELD = 'This field is required';
  public readonly INVALID_PHONE_FIELD = 'Phone has to be numeric and from 11 to 13 characters';
  public readonly INVALID_BIRTHDAY_FIELD = 'Age has to be between 4 and 120 years';

  constructor(private formBuilder: FormBuilder,
    private uploadService: UploadService,
              private userService: UserService) {
    this.userService.getCountries().subscribe(data => this.countries = data);
    this.days = Array.from({length: 31}, (v, k) => k + 1);
    this.months = Array.from({length: 12}, (v, k) => k + 1);
    this.years = Array.from({length: 100}, (v, k) => k + +moment().format('YYYY') - 100).reverse();
    this.subscription = this.userService.user.subscribe(data => {
      this.user = data;
      this.userService.getPersonalInformation(this.user.id).subscribe( res => {
        this.personalInformation = res.results[0];
        this.createForm();
      });
    })
  }

  public changeInfo(): void {
    this.infoChange.emit(this.personalInformationForm.value);
  }

  ngOnInit() {}
  ngOnDestroy(): void { this.subscription.unsubscribe();}

  createForm(){
    this.personalInformationForm = this.formBuilder.group({
      first_name: [this.user?.first_name, Validators.required],
      last_name: [this.user?.last_name, Validators.required],
      gender: [this.personalInformation?.gender, Validators.required],
      day: [this.personalInformation?.birthday?.split('-')[2].replace(/^0+/, '')],
      month: [this.personalInformation?.birthday?.split('-')[1].replace(/^0+/, '')],
      year: [this.personalInformation?.birthday?.split('-')[0]],
      city: [this.personalInformation?.city],
      country_of_origin: [this.personalInformation?.country_of_origin],
      phone: [this.personalInformation?.phone, [Validators.required, Validators.pattern('^(\\+\\d{1,3}[- ]?)?\\d{10}$')]],
      user: [this.user.id],
      avatar: [this.avatar_url],
    });
    if (this.status) {
      this.personalInformationForm.disable();
    }
    this.onChanges();
  }

  onChanges() {
    this.changeInfo();
  }

  fileProgress(fileInput: any) {
    this.fileData = fileInput.target.files[0] as File;
    const formData = new FormData();
    this.uploadService.fileUpload(this.fileData).subscribe(data=>{
      this.personalInformationForm.get('avatar').setValue(data.Location);
    },error =>{

      
    })
    this.preview();
  }

  preview() {
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (event) => {
      this.url = reader.result;
    };
  }

  birthdayValidator(control: AbstractControl) {
    const selectedYear = control.value;
    const currentYear = (new Date()).getFullYear();
    const diff = currentYear - (selectedYear || currentYear);
    if (diff < 4 || diff > 120) {
       return { invalid: true };
    }
    return null;
  }

}
