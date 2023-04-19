import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'app-request-password',
  templateUrl: './request-password.component.html',
  styleUrls: ['./request-password.component.sass']
})
export class RequestPasswordComponent implements OnInit {
  requestPasswordForm: FormGroup;
  success = false;

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.requestPasswordForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
  }

  submit() {
    this.auth.requestPassword(this.requestPasswordForm.value).subscribe(
      () => this.success = true
    );
  }
}
