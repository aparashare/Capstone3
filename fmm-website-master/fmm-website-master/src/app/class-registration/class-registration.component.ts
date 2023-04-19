import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import {FormBuilder, Validators, AbstractControl} from '@angular/forms';
import {WorkshopService} from '../core/services/workshop.service';
import {UserService} from '../core/services/user.service';
import {User} from '../core/models/User';
import {Router} from '@angular/router';
import {Meeting, MeetingInformation, YuWeeSesion} from './YuWeeInterfaces';
import {YuWeeUser} from '../core/models/YuWeeUser';
import {environment} from '../../environments/environment';
import {concatMap} from 'rxjs/operators';
import {UploadService} from '../core/services/file-upload.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

// import * as momentTimezone from 'moment-timezone';
declare var $:any;
declare var YuWee: any;
@Component({
  selector: 'app-class-registration',
  templateUrl: './class-registration.component.html',
  styleUrls: ['./class-registration.component.sass']
})
export class ClassRegistrationComponent implements OnInit {
  private yuweeUser: YuWeeUser;
  public session: YuWeeSesion;
  public yuweeUserData;
  public y;
  public userInfo;
  public isMentor = false;
  tags = [];
  public days;
  public pictureUrl;
  public months;
  public htmlContent="";
  public years;
  public workshopForm;
  public url;
  public roomId;
  public fileData: File = null;
  // public timezones = momentTimezone.tz.names();
  public timezones;
  public time = ['00:00 AM', '00:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM', '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM',
    '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM',
    '11:00 PM', '11:30 PM'];
  public currencies;
  public freeWorkshops = false;
  public canCreateFreeWorkshops: boolean;

  public readonly REQUIRED_FIELD = 'This field is required';
  public readonly INVALID_FIELD = 'This field is invalid';
  public readonly REQUIRED_TAGS_FIELD = 'At least one tag is required';
  public readonly REQUIRED_PICTURE_FIELD = 'The picture is required';
  public readonly INVALID_DATE_FIELD = 'Date cannot be in the past or more than 60 days into the future';

  private user: User;

  editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '300px',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'},
        {class: 'comic-sans-ms', name: 'Comic Sans MS'}
      ],
      customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
};


  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private uploadService: UploadService,
              private router: Router,
              private workshopService: WorkshopService) {
    this.userService.user.subscribe(data => {
      this.user = data;
      this.canCreateFreeWorkshops = data.mentor_account.can_create_free_workshops;
    });
    this.userService.getCurrencies().subscribe( data => this.currencies = data);
    this.days = Array.from({length: 31}, (v, k) => k + 1);
    this.months = Array.from({length: 12}, (v, k) => k + 1);
    this.years = Array.from({length: 2}, (v, k) => k + +moment().format('YYYY'));
    this.workshopForm = this.formBuilder.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      start_at: ['', Validators.required],
      tags: ['', this.tagsValidator],
      price: ['', [Validators.required, Validators.min(0)]],
      price_currency: ['', Validators.required],
      amount: ['', [Validators.max(100), Validators.min(0), Validators.required]],
      mentor: ['', Validators.required],
      day: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required],
      time: ['', Validators.required],
      picture: [null, Validators.required]
    })
  }

  setHandlersYuWee() {
    const myHandlers = {
      onSessionCreateSuccess: (data) => this.sessionCreateSuccess(data),
      onSessionCreateFailure: (data) => this.sessionCreateFailure(data),
      onServerConnected: () => this.yuweeServerConnected(),
      onNewGroupCreation: (data) => this.onNewGroupCreation(data),
    };

    this.y.setHandlers(myHandlers);
  }

  initSession() {
    // console.log('environment.yuweeAppId ',environment.yuweeAppId);
    // console.log('environment.yuweeAppSecret ',environment.yuweeAppSecret);
    // console.log('environment.yuweeClientId ',environment.yuweeClientId);
    
    this.y.setAppCredentials(environment.yuweeAppId, environment.yuweeAppSecret, environment.yuweeClientId);
    this.userService.user.subscribe(u => this.user = u);
    this.userService.getSelfYuwee().subscribe(data => this.yuweeUser = data);

    this.userService.user.pipe(
      concatMap(result1 => {
        this.user = result1;
        return this.userService.getSelfYuwee();
      })
    ).subscribe(
      success => {
        this.yuweeUser = success;
        // console.log('this.user.email ', this.user.email);
        // console.log('this.yuweeUser.password ',this.yuweeUser.password);
        this.userInfo = this.y.createSessionViaCredentials(this.user.email, this.yuweeUser.password);
      }
      // 
    );
  };
  yuweeServerConnected() {
    if (this.user.mentor_account) {
      let email = this.yuweeUser['yuwee_response_json'].result.email;

      this.y.createGroup([email],'class-'+new Date().getTime());


    }

// // this.y.addMembersInGroupByEmail('5f4e3983829d3d3c8ed2383f', ['eddymentor@yopmail.com'])

// // this.y.fetchRoomDetails('5f4e052ca48ec941619d8dd0');
// // this.y.fetchChatList()
// this.y.fetchChatMessages('5f4eb9958590344b051d3610',this.pageCount);




//     if (this.isMentor) {
//       this.hostMeetingAndJoinAsMentor();

//     } else{

//     }
  };
  sessionCreateSuccess(data) {
    // console.log('SESSION CREATION IN YUWEE SUCCESS !', JSON.stringify(data));
    this.session = data;
    this.yuweeUserData = data.user;
    const param = {
      user: this.yuweeUserData,
      access_token: this.session.access_token
    };
    this.y.init(param);
  }

  sessionCreateFailure (data) {console.log('Failure', data)}

  onNewGroupCreation(data){
      this.roomId = data.groupInfo.roomId
      console.log("///////////////////////",this.roomId)

  }

  ngOnInit(): void {
    this.y = new YuWee();
    this.getYuWeeUser();
    this.setHandlersYuWee();
    this.initSession();
    this.userService.getSelfYuwee().subscribe(data =>{
      this.yuweeUser = data
    });

  }

  getYuWeeUser() {
    this.userService.user.pipe(
      concatMap(result1 => {
        this.user = result1;
        return this.userService.getSelfYuwee();
      })
    ).subscribe(
      success => this.yuweeUser = success,
      errorData => { console.log('cant get YuWEE user' + errorData) }
    );
  }

  addTag(value, tag) {
    if (value) {
      this.tags.push(value);
      value = '';
      tag.value = '';
    }
  }

  removeTag(value) {
    this.tags = this.tags.filter(obj => obj !== value);
  }

  tagsValidator = (control: AbstractControl) => {
    if (this.tags.length === 0 && !control.dirty) {
      return { required: true };
   }
   return null;
  }

  onFree() {
    this.freeWorkshops = !this.freeWorkshops;
    this.workshopForm.patchValue({
      price: this.freeWorkshops ? 0 : ''
    })
    if (this.freeWorkshops) {
      this.workshopForm.get('price').disable()
      this.workshopForm.get('price_currency').disable()
    } else {
      this.workshopForm.get('price').enable()
      this.workshopForm.get('price_currency').enable()
    }
  }

  submitForm() {
    if (!this.workshopForm.get('picture').value) {
      this.workshopForm.get('picture').markAsTouched();
      this.workshopForm.get('picture').setErrors({ incorrect: true });
    }

    console.log("form submit req")
    this.workshopForm.get('mentor').setValue(this.user.mentor_account.id);
    this.workshopForm.get('tags').setValue(this.tags);
    const date = moment(
      this.workshopForm.get('year').value + '-' +
      this.workshopForm.get('month').value + '-' +
      this.workshopForm.get('day').value + ' ' +
      this.workshopForm.get('time').value, 'YYYY-MM-DD hh:mm A');
    this.workshopForm.get('start_at').setValue(date.format('YYYY-MM-DD HH:mm'));
    this.setStartDateValidity();

    // this.workshopForm.get('topics').markAsTouched()
console.log("this.workshopForm.valid",this.workshopForm)
    if (this.workshopForm.valid) {
      delete this.workshopForm.value.time;
      delete this.workshopForm.value.day;
      delete this.workshopForm.value.month;
      delete this.workshopForm.value.year;
      const formData = new FormData();
      console.log(this.workshopForm.controls)
      Object.keys(this.workshopForm.controls).forEach(key => {
        if(key=='picture' || key =='topics'){

        }else{

          formData.append(key, this.workshopForm.get(key).value);
        }
      });
      formData.append('room_id',this.roomId)
      formData.append('picture',this.pictureUrl)
      formData.append('topics',this.htmlContent)
      console.log("formdata",formData)
      this.workshopService.postWorkshop(formData).subscribe(
      () => this.router.navigate(['/dashboard']))
    }
  }

  fileProgress(fileInput: any) {
      this.fileData = fileInput.target.files[0]
      this.workshopForm.get('picture').setValue(this.fileData);
      this.uploadService.fileUpload(this.fileData).subscribe(data=>{
        this.pictureUrl=data.Location

      },error =>{

        
      })
    this.preview(this.fileData);
  }

  preview(file) {
    const mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      this.url = reader.result;
    };
  }

  private setStartDateValidity() {
    if(!this.validStartAt()) {
      this.workshopForm.get('year').markAsTouched();
      this.workshopForm.get('year').setErrors({ incorrect: true });

      this.workshopForm.get('month').markAsTouched();
      this.workshopForm.get('month').setErrors({ incorrect: true });

      this.workshopForm.get('day').markAsTouched();
      this.workshopForm.get('day').setErrors({ incorrect: true });
    } else {
      this.workshopForm.get('year').setErrors(null);
      this.workshopForm.get('month').setErrors(null);
      this.workshopForm.get('day').setErrors(null);
    }
  }

  private validStartAt(): boolean {
    const selectedDate = new Date(this.workshopForm.get('start_at').value);
    const now = new Date();

    return selectedDate >= now && selectedDate <= new Date(now.setDate(now.getDate() + 60));
  }

}
