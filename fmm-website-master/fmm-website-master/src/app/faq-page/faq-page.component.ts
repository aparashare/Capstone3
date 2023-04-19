import { Component, OnInit } from '@angular/core';
import { PagesService, Faq } from '../core/services/pages.service';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.sass']
})
export class FaqPageComponent implements OnInit {

  public faqs: Faq[];

  constructor(private pagesService: PagesService) { }

  public ngOnInit(): void {
    this.pagesService.getAllFaqs().subscribe((response) => {
      this.faqs = response.results as Faq[];
    })
  }
}
