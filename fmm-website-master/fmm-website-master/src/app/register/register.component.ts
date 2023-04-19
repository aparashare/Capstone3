import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  success = false;
  constructor(private auth: AuthService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
  }

  submit() {
    this.auth.register(this.registerForm.value).subscribe(
      () => this.success = true
    );
  }
}
