import { Component, OnInit } from '@angular/core';
import { PagesService, Faq,Policy } from '../core/services/pages.service';

@Component({
  selector: 'app-faq-page',
  templateUrl: './policy-page.component.html',
  styleUrls: ['./policy-page.component.sass']
})
export class PolicyPageComponent implements OnInit {

  public policy: Policy;
  title:any
  content:any

  constructor(private pagesService: PagesService) { }

  public ngOnInit(): void {
    this.pagesService.getPolicy().subscribe((response) => {
      this.policy = response as Policy;


      this.title = this.policy.title
      this.content = this.policy.content
    })
  }
}
