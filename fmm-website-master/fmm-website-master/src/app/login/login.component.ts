import { Component, OnInit,Optional, Inject  } from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {UserService} from '../core/services/user.service';
import {Router} from '@angular/router';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Token} from '../core/models/Token';
import { GoogleAnalyticsService } from '../core/services/google-analytics.service';
import {MatDialog} from '@angular/material/dialog';
import {RegisterComponent} from '../register/register.component';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPasswordRequest = false;
  error: string;
  constructor(private authService: AuthService,
    public dialog: MatDialog,
              private userService: UserService,
              private router: Router,
              public dialogRef: MatDialogRef<LoginComponent>,
              private formBuilder: FormBuilder,
              @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
              private googleAnalyticsService: GoogleAnalyticsService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: '',
      password: '',
    });
  }

  submit() {
    this.authService.login(this.loginForm.value).subscribe((data) => {
        this.googleAnalyticsService.eventEmitter('logged_in', 'login', this.loginForm.get('username').value);
        this.authService.isLogged$.next(true);
        this.authService.setCookies(this.loginForm.get('username').value, data);
        this.userService.getSelf().subscribe();
        this.resetForm();
        this.userService.getSelf().subscribe(
          user => {
            if (user.first_name) {
              if(this.dialogData && this.dialogData.type == 'class'){

                this.router.navigate(['/class/' + this.dialogData.id],{ state: { example: 'bar' } })
              }else{

                this.router.navigate(['dashboard']);
              }
            } else {
              this.router.navigate(['registration']);
            }
            this.dialogRef.close();
          }
        );
      });
  }
  openRegister(){
    const dialogRef = this.dialog.open(RegisterComponent, {width: '400px', height: 'fit-content'});

    dialogRef.afterClosed().subscribe(result => {});
  }


  resetForm() {
    this.loginForm.reset();
  }


}
