import {Component, Inject, OnInit,NgZone} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef,MatDialog} from '@angular/material/dialog';

import { CookieService } from 'ngx-cookie-service';
import {WorkshopService} from '../../core/services/workshop.service';
import {PaymentForm} from '../../core/models/PaymentForm';
import { GoogleAnalyticsService } from 'src/app/core/services/google-analytics.service';

declare var Razorpay: any;

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.sass']
})
export class PaymentDialogComponent implements OnInit {
success = false;
  constructor(
    private zone: NgZone,
    private workshopService: WorkshopService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private cookieService: CookieService,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentForm) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.googleAnalyticsService.eventEmitter('payment_open', 'payment', this.cookieService.get('username'));
  }

  afterPayment(){
    this.zone.run(() => {
      this.success = true;
      this.dialogRef.close();
    });


  }

  openRazorpayCheckout() {
    // this.dialogRef.close();
    var datas = this.data['res'];
    var $this =this;
    const options = {
      key: datas.data_key,
      amount: datas.data_amount,
      name: datas.data_name,
      description: datas.data_description,
      "order_id":datas.data_order_id,
      prefill: {
        name: datas.data_prefill_name,
        email: datas.data_prefill_email,
        contact: datas.data_prefill_contact,
      },
      "handler": (response)=>{
        console.log("response",response)
        const formData = new FormData();
        formData.append('user',this.data['user'].user)
        formData.append('razorpay_payment_id',response.razorpay_payment_id)
        formData.append('razorpay_order_id',response.razorpay_order_id)
        formData.append('razorpay_signature',response.razorpay_signature)
        formData.append('amount',datas.data_amount)
        formData.append('workshop',this.data['user'].workshop)
        this.workshopService.postWorkshopPayment(formData).subscribe((ress)=>{

            console.log(ress)
            this.zone.run(() => {
              this.dialogRef.close();
            });
                  // window.location.reload();

        });
    },
      theme: {
        color: this.data['res'].data_theme_color
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}
