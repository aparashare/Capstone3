import { Component, OnInit } from '@angular/core';
import { ChartType } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';
import {MentorService, Revenue} from '../core/services/mentor.service';
import {UserService} from '../core/services/user.service';
import {mergeMap, tap} from 'rxjs/operators';
import {User} from '../core/models/User';
import {Workshop} from '../core/models/Workshop';
import {WorkshopUser} from '../core/models/WorkshopUser';
import {AppointmentUser} from '../core/models/Appointment';
import {WorkshopAssignmentUser} from '../core/models/WorkshopAssignment';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-mentor-dashboard',
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.sass']
})
export class MentorDashboardComponent implements OnInit {
  items = [1, 2];
  public user: User;
  public workshops: Workshop[];
  public appointments: AppointmentUser[];
  public assignments: WorkshopAssignmentUser[];
  public doughnutChartLabels: Label[] = ['Courses', 'Classes', 'Mentorship'];
  public doughnutChartData: MultiDataSet = [
    [350, 450, 100],
  ];
  public revenue: Revenue;
  public options = {
    responsive: true,
    maintainAspectRatio: true,
  };
  public chartColors: Array<any> = [{backgroundColor: ['#EC48DB', '#2D3483', '#4FE7F1']}];
  public doughnutChartType: ChartType = 'doughnut';

  constructor(private mentorService: MentorService,
              private userService: UserService) {
    this.userService.user.pipe(
      mergeMap(u => {
        this.user = u;
        const p = new HttpParams().set('mentor', String(u.mentor_account.id));
        this.userService.getWorkshopParams(p).subscribe( res => this.workshops = res.results as Workshop[]);
        this.userService.getAppointmentUsersParams(p).subscribe( res => this.appointments = res.results as AppointmentUser[]);
        this.userService.getWorkshopAssignmentsParams(p).subscribe( res => this.assignments = res.results as WorkshopAssignmentUser[]);
        return this.mentorService.getMentorRevenue(u.mentor_account.id);
      })).subscribe(data => {
      this.revenue = data;
      this.doughnutChartData = [[+data.workshops, +data.appointments]];
    });
  }

  ngOnInit(): void {
  }

}
