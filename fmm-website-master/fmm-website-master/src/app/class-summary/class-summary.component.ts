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
import {WorkshopUser} from '../core/models/WorkshopUser';
import * as moment from 'moment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Workshop} from '../core/models/Workshop';
import {MentorService} from '../core/services/mentor.service';

import { ChartType,ChartOptions } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

export interface PeriodicElement {
  name: number;
  engage: number;
  attendance: string;
}
export interface data {
  className: string;
  tutorName: string;
  date: string;
  time: string;
  strength: string;
  enrolled: string;
}




@Component({
  selector: 'app-live-class',
  templateUrl: './class-summary.component.html',
  styleUrls: ['./class-summary.component.css']
})


export class ClassSummaryComponent implements OnInit, OnDestroy,AfterViewInit {

  container: HTMLElement; 
  private subs;
  public data:any={};
  public avDuration = 0;
  public totalDuration = 0;
  public totalAverage = 0;
  displayedColumns: string[] = ['name','engagement','attendance'];
  dataSource = [];
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };
  public pieChartLabels: Label[] = [['Not Engaged'], ['Engaged']];
  public pieChartData: number[] = [this.totalDuration,this.avDuration];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartColors = [
    {
      backgroundColor: ['rgba(255,0,0)', 'rgb(71, 70, 157)'],
    },
  ];

  routeState: any;
  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private http: HttpClient,
              private workshopService: WorkshopService,
              public dialog: MatDialog,
              ) {
                if (this.router.getCurrentNavigation().extras.state) {
                  this.data = this.router.getCurrentNavigation().extras.state;

                    console.log("hey data is here ",this.data)

                    this.workshopService.getWorkshopEnrolledUsers(this.data.class.id)
                    .subscribe((data) =>{
                      console.log("enrolled user data")
                      let u =[];
                        this.dataSource = data.map(function(d){
                          u.push(d.id)
                        return  {name: d.first_name +" "+d.last_name, "engage": 0, attendance:'Absent',id:d.id}
                      })
                      console.log(u)
                          this.workshopService.getWorkshopDuration({
                            userId:this.data.class.mentor.user.id,
                            classId:this.data.class.id,
                            userIds:u.toString()
                          }).subscribe((durationData) => {

                            this.dataSource.map(function(e){
                              if(durationData['otherDuration'].length>0){

                                durationData['otherDuration'].forEach(function(f){
                                  if(e.id == f.userId){
                                    e.engage = ((f.duration/durationData['userDuration'])*100).toFixed(2)
                                    e.attendance ='Present'
                                  }
                                })
                              }
                            })

                            this.avDuration = this.dataSource.reduce(function(acc,c){
                                return acc + parseInt(c.engage)
                            },0)

                            console.log(this.avDuration,this.totalDuration)
                            this.totalDuration = 100 - (this.avDuration/this.dataSource.length)
                            this.totalAverage = this.avDuration/this.dataSource.length
                            this.pieChartData=[this.totalDuration,this.totalAverage]
                            console.log("I got the users duration",durationData)
                            console.log("I got the users duration",this.totalDuration,this.avDuration)

                          })
                      
                    })
                
                }

                
              }
  

              formatLabel(value: number) {
                return value
              }

              ngOnDestroy(): void {
                
              }
  
              ngAfterViewInit(){
                
              }
    
              ngOnInit(): void {
              
              
              }

}

 