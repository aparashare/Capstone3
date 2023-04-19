import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-mentor-review',
  templateUrl: './mentor-review.component.html',
  styleUrls: ['./mentor-review.component.sass']
})
export class MentorReviewComponent implements OnInit {
  public rating;
  public review;
  ngOnInit(): void {
    this.review = this.formBuilder.group({
      title: 'Review by ' + String(this.data.user.first_name) + ' ' + String(this.data.user.last_name),
      content: ['', Validators.required],
      mark: '',
      workshop: this.data.workshop,
      user: this.data.user.id
    });
  }

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MentorReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    if (!isNaN(this.review.get('mark').value)) {
      this.review.get('mark').setValue(0);
    }
    this.review.get('mark').setValue(this.rating * 2);
    this.dialogRef.close(this.review.value);
  }

  onStarChange(e) {
    this.rating = e.rating;
  }
}
