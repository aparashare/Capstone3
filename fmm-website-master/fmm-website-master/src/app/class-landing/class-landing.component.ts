import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Workshop} from '../core/models/Workshop';
import {WorkshopService} from '../core/services/workshop.service';
import {ActivatedRoute} from '@angular/router';
import {HttpParams} from '@angular/common/http';
import {UserService} from '../core/services/user.service';
import {User} from '../core/models/User';
import {WorkshopUser} from '../core/models/WorkshopUser';
import {mergeMap} from 'rxjs/operators';
import {PaymentForm} from '../core/models/PaymentForm';
import {WindowRefService} from '../core/services/window-ref.service';
import {MatDialog} from '@angular/material/dialog';
import {PaymentDialogComponent} from './payment-dialog/payment-dialog.component';
import { FormControl } from '@angular/forms';
import {AuthService} from '../auth/auth.service';
import {LoginComponent} from '../login/login.component';
import { Router } from '@angular/router';
import {PersistanceService} from '../core/services/persistor.service';
@Component({
  selector: 'app-class-landing',
  templateUrl: './class-landing.component.html',
  styleUrls: ['./class-landing.component.sass'],
  providers: [WindowRefService],
})
export class ClassLandingComponent implements OnInit, OnDestroy {
  public workshop: Workshop;
  private workshopId;
  public similarWorkshops: Workshop[];
  public user: User;
  public workshopUser: WorkshopUser;
  public paymentForm: PaymentForm;
  private subs;
  userRegistered = false;
  isEnrollLoader = true;

  public promoCode: FormControl;

  constructor(private workshopService: WorkshopService,
              private userService: UserService,
              public dialog: MatDialog,
              private winRef: WindowRefService,
              private router: Router,
              private auth : AuthService,
              private persister: PersistanceService,
              private route: ActivatedRoute) {
    this.promoCode = new FormControl('');
  }

  ngOnInit(): void {
    this.subs = this.route.paramMap.subscribe( paramMap => {
      console.log("paramMap",paramMap)
      this.workshopId = paramMap.get('id');
      if (this.workshopId) {
        this.workshopService.getWorkshop(this.workshopId)
          .subscribe( data => {
          
            this.workshop = data
            if(!this.auth.checkLogin()){
              this.isEnrollLoader=false;
            }
          });
      }
      this.userService.user.pipe(
        mergeMap(data => {
          this.user = data;
          return this.userService.getWorkshopUser(data.id)
        })
      ).subscribe( res => {
        this.persister.set('reviewClass',this.workshop)
        this.persister.set('user',this.user)
        const userWorkshops = res.results as WorkshopUser[];
        this.isEnrollLoader=false
        console.log("this.userRegistered",this.userRegistered)
        this.userRegistered = !!userWorkshops.filter(w => {
          if(w.workshop.id === this.workshop.id){

            if(parseInt(w.workshop.price)==0){
              console.log("zero price")
              return true;
            }else{
              console.log("price is :",w.workshop.price)
              console.log("payment :",w.payment)
              if(w.payment){
                return true;
              }else{
                return false;
              }
              
            }
          }else{
            return false;
          }
        }
          
          )[0];
      });
    });
    const p = new HttpParams().set('page_size', '3');
    this.workshopService.getWorkshops(p).subscribe(data => this.similarWorkshops = data.results);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  openSummary(){
    this.router.navigate(['/class-summary'],{
      state: {
        user: this.user,
        class: this.workshop
      }
    });
  }

  openSignIn(id){
    const dialogRef = this.dialog.open(LoginComponent, {width: '400px', height: 'fit-content',data: {
      "type": 'class',
      "id":id
    }});

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  registerForClass() {
    this.isEnrollLoader=true
    console.log("this.auth.checkLogin()",this.auth.checkLogin())
    if(!this.auth.checkLogin()){

      console.log("this.auth.isLogged$",this.auth.isLogged$)
      this.openSignIn(this.workshopId);
    }

    if (this.promoCode.value) {
      const discount = 1;
      this.workshopService.createWorkshopCoupon(discount, this.promoCode.value, this.workshopId).subscribe();
    }
    if (this.user && this.workshopId) {

      this.userService.user.pipe(
        mergeMap(data => {
          this.user = data;
          return this.userService.getWorkshopUser(data.id)
        })
      ).subscribe( res => {
        const userWorkshops = res.results as WorkshopUser[];
        // let works= !!userWorkshops.filter(w => w.workshop.id === this.workshop.id)[0];
        var works= userWorkshops.filter(w => {
          return w.workshop.id === this.workshop.id

        })[0];
        console.log("userRegistered",this.userRegistered)
        if(!!works){

          if(parseInt(this.workshop.price) == 0){
              if (this.workshopId) {
                this.workshopService.getWorkshop(this.workshopId)
                  .subscribe( data => {
                    this.workshop = data
                    this.userRegistered =true;
                    this.isEnrollLoader=false
                    
                  
                  });
              }

  
          }else{
            if(works.payment){
              this.userRegistered =true;
              this.isEnrollLoader=false
            }else{
  
              this.workshopService.workshopPay(works.id).subscribe(resp => {
  
              this.paymentForm = resp;
              this.openPaymentDialog({res:resp,user:{workshop:this.workshopId,user: this.user.id}});
  
  
              })         
  
            }
          }
        }else{
      this.workshopService.registerForWorkshop(this.workshopId, this.user.id
      ).subscribe(res => {

        if(parseInt(this.workshop.price) == 0){

          this.userRegistered =true;
          this.isEnrollLoader=false

        }else{
          if(res.payment){
            this.userRegistered =true;
            this.isEnrollLoader=false
          }else{

            this.workshopService.workshopPay(res.id).subscribe(resp => {

            this.paymentForm = resp;
            this.openPaymentDialog({res:resp,user:{workshop:this.workshopId,user: this.user.id}});


            })         

          }
        }
      })
     }

      });





      // this.workshopService.registerForWorkshop(this.workshopId, this.user.id
      // ).subscribe(res => {
      //   this.workshopService.getWorkshopUsers(res.id).subscribe(res => {
      //     if(parseInt(res.workshop.price)==0){
      //       this.userService.user.pipe(
      //         mergeMap(data => {
      //           this.user = data;
      //           return this.userService.getWorkshopUser(data.id)
      //         })
      //       ).subscribe( res => {
      //         const userWorkshops = res.results as WorkshopUser[];
      //         this.userRegistered = !!userWorkshops.filter(w => w.workshop.id === this.workshop.id)[0];
      //       });
      //     }else{

      //       this.paymentForm = res;
      //       this.openPaymentDialog(res);
      //     }
      //   })
        // if (this.workshop.price) {
        // }
      // });
    }
  }

  mentorOwnsWorkshop(): boolean {
    return this.workshop?.mentor?.id === this.user?.mentor_account?.id;
  }

  openPaymentDialog(paymentF): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '700px',
      data: paymentF
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
        if (this.workshopId) {
          this.workshopService.getWorkshop(this.workshopId)
            .subscribe( data => {
              this.workshop = data
              this.userService.user.pipe(
                mergeMap(data => {
                  this.user = data;
                  return this.userService.getWorkshopUser(data.id)
                })
              ).subscribe( res => {
                const userWorkshops = res.results as WorkshopUser[];
                this.isEnrollLoader=false
                console.log("this.userRegistered",this.userRegistered)
                this.userRegistered = !!userWorkshops.filter(w => {
                  if(w.workshop.id === this.workshop.id){
        
                    if(parseInt(w.workshop.price)==0){
                      console.log("zero price")
                      return true;
                    }else{
                      console.log("price is :",w.workshop.price)
                      console.log("payment :",w.payment)
                      if(w.payment){
                        return true;
                      }else{
                        return false;
                      }
                      
                    }
                  }else{
                    return false;
                  }
                }
                  
                  )[0];
              });
            });
        
       
      }
      


    });
  }

  scroll(target: string): void {
    const el: HTMLElement | null = document.getElementById(target);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }), 0);
    }
  }

}



// pipe(
//   mergeMap( user => {
//     this.workshopUser = user as WorkshopUser;
//     return this.workshopService.workshopPay(user.id);
//   })