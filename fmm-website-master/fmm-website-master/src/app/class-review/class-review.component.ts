import {Component, ElementRef, OnDestroy, OnInit,ViewChild, AfterViewInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {UserService} from '../core/services/user.service';
import {User} from '../core/models/User';
import { Router } from '@angular/router';
import {concatMap} from 'rxjs/operators';
import {MentorReviewComponent} from '../core/mentor-review/mentor-review.component';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {WorkshopService} from '../core/services/workshop.service';
import {PersistanceService} from '../core/services/persistor.service';
import {WorkshopUser} from '../core/models/WorkshopUser';
import * as moment from 'moment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Workshop} from '../core/models/Workshop';
import {MentorService} from '../core/services/mentor.service';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-live-class',
  templateUrl: './class-review.component.html',
  styleUrls: ['./class-review.component.css']
})


export class ClassReviewComponent implements OnInit, OnDestroy,AfterViewInit {

  container: HTMLElement; 
  private subs;
  public className;
  public class:any;
  public mentorName;
  public comment:any;
  public star=0;
  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private http: HttpClient,
              private workshopService: WorkshopService,
              public dialog: MatDialog,
              private persister: PersistanceService
              ) {}
  

              formatLabel(value: number) {
                return value
              }

              ngOnDestroy(): void {
                
              }
  
              ngAfterViewInit(){
                
              }
              onSlideChange(event){
                this.star = event.value
              }

              postReview(){
                  const formData = new FormData();
                  formData.append('user',(this.persister.get('user')).id)
                  formData.append('workshop',(this.persister.get('reviewClass')).id)
                  formData.append('title','Class')
                  formData.append('content',this.comment)
                  formData.append('mark',this.star.toString())
                this.workshopService.postWorkshopReview(formData).subscribe((d)=>{
                  console.log(d)
                  this.router.navigate(['/dashboard'])
                })
              }
    
              ngOnInit(): void {
                this.subs = this.route.queryParams.subscribe( paramMap => {
                  this.class = this.persister.get('reviewClass') 


                })
              
              }

}

 