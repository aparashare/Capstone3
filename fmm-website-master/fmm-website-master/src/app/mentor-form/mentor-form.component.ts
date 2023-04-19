import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';

import * as moment from 'moment';

import { UserService } from '../core/services/user.service';
import { MentorService } from '../core/services/mentor.service';
import { Expertise } from '../core/models/Mentor';
import { User, UserEducations } from '../core/models/User';

@Component({
  selector: 'app-mentor-form',
  templateUrl: './mentor-form.component.html',
  styleUrls: ['./mentor-form.component.sass']
})
export class MentorFormComponent implements OnInit {
  mentorForm: FormGroup;
  tags = [];
  firstPage = true;
  public years;
  public user: User;
  public expertise: Expertise[];

  public readonly REQUIRED_FIELD = 'This field is required';
  public readonly INVALID_FIELD = 'This field is invalid';
  public readonly REQUIRED_TAGS_FIELD = 'At least one tag is required';

  ngOnInit(): void {
    this.mentorService.getUserExpertise().subscribe( data =>  this.expertise = data.results);
    this.years = Array.from({length: 100}, (v, k) => k + +moment().format('YYYY') + 1 - 100).reverse();
    this.userService.user.subscribe((user: User) => {
      this.user = user;
      this.tags = user.mentor_account ? user.mentor_account.tags : [];
      this.mentorForm = this.fb.group({
        achievements_array: this.fb.array([]) ,
        education: this.fb.array([]) ,
        tags: ['', this.tagsValidator.bind(this)],
        years_of_experience: [user.mentor_account ? user.mentor_account.years_of_experience : '', [Validators.required, Validators.min(1)]],
        about_expertise: [user.mentor_account ? user.mentor_account.about_expertise : '', Validators.required],
        user: [this.user.id],
        expertise: [user.mentor_account ? user.mentor_account.expertise[0].title : '', Validators.required],
      });
      this.user.mentor_account?.achievements.forEach(achievement => this.addAchievement(achievement));
      this.user.educations.length > 0
        ? this.getUniqueUserEducations().forEach(education => this.addEducation(education))
        : this.addEducation();;

      if (!this.user.mentor_account) {
        this.addAchievement();
      }
    })
  }

  constructor(private fb: FormBuilder,
              private mentorService: MentorService,
              private userService: UserService) {
  }

  newAchievement(achievement: string): FormGroup {
    return this.fb.group({ach: [achievement, Validators.required]});
  }

  achievements_array(): FormArray {return this.mentorForm.get('achievements_array') as FormArray; }

  addAchievement(achievement: string = '') {
    this.achievements_array().push(this.newAchievement(achievement));
  }

  removeAchievement(i: number) {this.achievements_array().removeAt(i); }

  newEducation(education: UserEducations): FormGroup {
    return this.fb.group({
      school_name: [education ? education.school_name : '', Validators.required],
      school_start: [education ? education.school_start : '', Validators.required],
      school_end: [education ? education.school_end : '', Validators.required],
      user: this.user.id
    });
  }

  education(): FormArray { return this.mentorForm.get('education') as FormArray; }

  addEducation(education: UserEducations = null) {
    this.education().push(this.newEducation(education));
  }

  removeEducation(i: number) {this.education().removeAt(i); }

  addTag(value, tag) {
    if (value) {
      this.tags.push(value); value = ''; tag.value = '';
      this.mentorForm.controls.tags.setErrors(null);
    }
  }

  removeTag(value) {
    this.tags = this.tags.filter(obj => obj !== value);
  }

  tagsValidator(control: AbstractControl = this.mentorForm.controls.tags) {
    if (this.tags.length === 0 && control.touched) {
      control.setErrors({required: true});
      return { required: true };
   }
   return null;
  }

  getUniqueUserEducations(): UserEducations[] {
    return this.user.educations.filter((education, index, self) =>
      index === self.findIndex((edu) => (
        edu.school_name === education.school_name &&
        edu.school_start === education.school_start &&
        edu.school_end === education.school_end
      )))
  }


  submitForm() {
    if (!this.mentorForm.dirty) {
      this.firstPage = false;
      return;
    }
    if (this.tags.length === 0) {
      this.mentorForm.controls.tags.setErrors({required: true});
    }
    if (this.mentorForm.valid) {
      const education = this.mentorForm.get('education').value;
      const achievements = this.mentorForm.get('achievements_array').value.map(a => a.ach);
      delete this.mentorForm.value.achievements_array;
      this.mentorForm.addControl('achievements', new FormControl('', Validators.required));
      this.mentorForm.get('achievements').setValue(achievements);
      this.mentorForm.get('tags').setValue(this.tags);
      delete this.mentorForm.value.education;
      delete this.mentorForm.value.ach;
      education.map(e => {
        if (e) {
          this.userService.postUserEducations(e).subscribe();
        }
      });
      if (this.expertise.filter(item => item.title === this.mentorForm.get('expertise').value)[0]) {
        this.mentorForm.get('expertise')
          .setValue([this.expertise.filter(item => item.title === this.mentorForm.get('expertise').value)[0].id]);
        if (this.user.mentor_account) {
          this.mentorService.patchUserMentorsAccount(this.mentorForm.value, this.user.mentor_account.id)
            .subscribe(() => this.firstPage = false);
        } else {
          this.mentorService.postUserMentorsAccount(this.mentorForm.value).subscribe(() => this.firstPage = false);
        }
      } else {
        this.mentorService.postUserExpertise({title : this.mentorForm.get('expertise').value}).subscribe(
          data => {
            this.mentorForm.get('expertise').setValue([data.id]);
            if (this.user.mentor_account) {
              this.mentorService.patchUserMentorsAccount(this.mentorForm.value, this.user.mentor_account.id)
                .subscribe(() => this.firstPage = false);
            } else {
              this.mentorService.postUserMentorsAccount(this.mentorForm.value).subscribe(() => this.firstPage = false);
            }
          }
        );
      }
    }
  }
}
