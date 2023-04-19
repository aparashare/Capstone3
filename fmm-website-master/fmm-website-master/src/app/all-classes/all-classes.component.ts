import {Component, OnDestroy, OnInit} from '@angular/core';
import {Workshop} from '../core/models/Workshop';
import {User} from '../core/models/User';
import {WorkshopUser} from '../core/models/WorkshopUser';
import {AppointmentUser} from '../core/models/Appointment';
import {WorkshopAssignmentUser} from '../core/models/WorkshopAssignment';
import {UserService} from '../core/services/user.service';

@Component({
  selector: 'app-all-classes',
  templateUrl: './all-classes.component.html',
  styleUrls: ['./all-classes.component.sass']
})
export class AllClassesComponent implements OnInit, OnDestroy {
  public user: User;
  private subscription;
  private upcommingClass=[];
  private pastClass=[];
  public condition=true;
  public workshops: WorkshopUser[];
  public appointments: AppointmentUser[];
  public assignments: WorkshopAssignmentUser[];
  constructor(private userService: UserService) { }


  conditionChange(c){

    this.condition = c 

  }

  ngOnInit() {
    this.subscription = this.userService.user.subscribe( data => {
      this.user = data;
      this.userService.getWorkshopUser(data.id).subscribe( res => {
        this.workshops = res.results as WorkshopUser[]
        res.results.forEach((element)=>{

          if(new Date(element.workshop.start_at).getTime() >= new Date().getTime()){
            this.upcommingClass.push(element)
            
          }else{
            
            this.pastClass.push(element)

          }

       })
      
      });
      
      // this.userService.getAppointmentUsers(data.id).subscribe( res => this.appointments = res.results as AppointmentUser[]);
      // this.userService.getWorkshopAssignments(data.id).subscribe( res => this.assignments = res.results as WorkshopAssignmentUser[])
    });
  }
  ngOnDestroy(): void {this.subscription.unsubscribe();}

}
