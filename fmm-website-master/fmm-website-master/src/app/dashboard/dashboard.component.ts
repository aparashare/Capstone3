import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../core/services/user.service';
import {User} from '../core/models/User';
import {WorkshopUser} from '../core/models/WorkshopUser';
import {AppointmentUser} from '../core/models/Appointment';
import {WorkshopAssignmentUser} from '../core/models/WorkshopAssignment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public user: User;
  public pastClass: any;
  public upcommingClass: any;
  private subscription;
  public workshops: WorkshopUser[];
  public appointments: AppointmentUser[];
  public assignments: WorkshopAssignmentUser[];
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.subscription = this.userService.user.subscribe( data => {
      this.user = data;
      this.userService.getWorkshopUser(data.id).subscribe( res =>{
        this.workshops = res.results as WorkshopUser[]
      });
      this.userService.getAppointmentUsers(data.id).subscribe( res => this.appointments = res.results as AppointmentUser[]);
      this.userService.getWorkshopAssignments(data.id).subscribe( res => this.assignments = res.results as WorkshopAssignmentUser[])
    });
  }
  ngOnDestroy(): void {this.subscription.unsubscribe();}

}
