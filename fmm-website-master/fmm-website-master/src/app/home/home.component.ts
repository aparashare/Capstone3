import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LoginComponent} from '../login/login.component';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {AuthService} from '../auth/auth.service';
import {RegisterComponent} from '../register/register.component';
import {Router} from '@angular/router';
import {Workshop} from '../core/models/Workshop';
import {UserMentorAccount} from '../core/models/Mentor';
import {WorkshopService} from '../core/services/workshop.service';
import {MentorService} from '../core/services/mentor.service';
import {HttpParams} from '@angular/common/http';
import {ErrorService} from '../auth/error.service';
import {MatTabGroup} from '@angular/material/tabs';
import {UserService} from '../core/services/user.service';
import {Testimonial} from '../core/models/Testimonial';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  customOptions: any = {
    loop: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 600,
    margin:25,
    nav: true,
    navText: ["<div class='nav-btn prev-slide'></div>", "<div class='nav-btn next-slide'></div>"],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
      // 940: {
      //   items: 4
      // }
    }
  }

  public mentorUsers: UserMentorAccount[];
  public workshops: Workshop[];
  public registrationUser = new FormControl('');
  public testimonials: Testimonial[];
  public leadForm;
  @ViewChild('f') myNgForm;

  constructor(public dialog: MatDialog,
              public router: Router,
              private auth: AuthService,
              private errorService: ErrorService,
              private mentorService: MentorService,
              private userService: UserService,
              private formBuilder: FormBuilder,
              private workshopService: WorkshopService) {
    this.userService.getTestimonials().subscribe(
      data => this.testimonials = data.results as Testimonial[]
    )
  }


  public next(tabGroup: MatTabGroup) {
    if (!tabGroup || !(tabGroup instanceof MatTabGroup)) return;

    const tabCount = tabGroup._tabs.length;
    tabGroup.selectedIndex = (tabGroup.selectedIndex + 1) % tabCount;
  }

  public prev(tabGroup: MatTabGroup) {
    if (!tabGroup || !(tabGroup instanceof MatTabGroup)) return;

    const tabCount = tabGroup._tabs.length;
    tabGroup.selectedIndex = (tabGroup.selectedIndex - 1) % tabCount;
  }

  ngOnInit() {
    let p = new HttpParams().set('page_size', '4');
    this.mentorService.getUserMentorsAccounts(p).subscribe(data => this.mentorUsers = data.results);
    p = p.set('page_size', '6');
    this.workshopService.getWorkshops(p).subscribe(data => this.workshops = data.results);
    this.initLeadForm();
  }

  openSignIn(){
    const dialogRef = this.dialog.open(LoginComponent, {width: '400px', height: 'fit-content'});

    dialogRef.afterClosed().subscribe(result => {});
  }

  openRegister(){
    const dialogRef = this.dialog.open(RegisterComponent, {width: '400px', height: 'fit-content'});

    dialogRef.afterClosed().subscribe(result => {});
  }

  initLeadForm() {
    this.leadForm= this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      comment: ['', Validators.required],
    })
  }

  submitLeadForm() {
    if (this.leadForm.valid) {
      this.userService.createLead(this.leadForm.value).subscribe(
        () => {
          this.errorService.open('Successfully submitted');
          this.myNgForm.resetForm();
        }
      );
    }
  }

  register() {
    if (this.registrationUser.valid) {
      this.auth.register({email: this.registrationUser.value}).subscribe();
    }
  }

  openVideo() {
    const dialogRef = this.dialog.open(VideoDialogComponent);

    dialogRef.afterClosed().subscribe(() => {});
  }

  subscribeTo() {
    this.auth.subscribe(this.registrationUser.value).subscribe(
      () => this.errorService.open('Subscribed successfully')
    );
  }

}

@Component({
  selector: 'app-video',
  template: `
    <iframe width="560" height="315" src="https://www.youtube.com/embed/9rKhLl-sLHE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  `
})
export class VideoDialogComponent {}
