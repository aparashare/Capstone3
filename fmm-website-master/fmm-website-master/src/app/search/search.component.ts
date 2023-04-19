import {Component, OnDestroy, OnInit} from '@angular/core';
import {WorkshopService} from '../core/services/workshop.service';
import {MentorService} from '../core/services/mentor.service';
import {Expertise, UserMentorAccount} from '../core/models/Mentor';
import {Workshop} from '../core/models/Workshop';
import {HttpParams} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.sass']
})
export class SearchComponent implements OnInit, OnDestroy {
  public dataMentors: UserMentorAccount[];
  public dataWorkshops: Workshop[];
  public selectedMentors = true;
  public pageSize = 10;
  public count = 100;
  public searchQuery;
  public external = false;
  pageIndex = 0;
  sub;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  constructor(private workshopService: WorkshopService,
              private route: ActivatedRoute,
              private router: Router,
              private mentorService: MentorService) { }

  ngOnInit(): void {
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        if (params.search) {
          this.searchQuery = params.search;
          this.external = true;
          this.getData({search: params.search});
        }
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getMentors(p?) {
    this.mentorService.getUserMentorsAccounts(p)
      .subscribe(data => {
        this.count = data.count;
        this.dataMentors = data.results;
      });
  }

  getWorkshops(p?) {
    this.workshopService.getWorkshops(p)
      .subscribe(data => {
        this.dataWorkshops = data.results;
        this.count = data.count;
      });
  }

  getDataAgain(e) {
    let filters = new HttpParams();
    Object.entries(e).forEach(
      ([key, value]) => {
        if (value && key !== 'price') {
          filters = filters.set(key, String(value));
        }
        if (key === 'price' && value ) {
          filters = filters.set(key + '__lte', String(value[1]));
          filters = filters.set(key + '__gte', String(value[0]));
        }
        if (key === 'title__icontains') {
          this.searchQuery = value;
        }
      }
    );
    if (!this.external) {
      this.getData(filters);
    }
  }

  changeSelected() {
    this.selectedMentors = !this.selectedMentors;
    this.getData(false);
  }

  getData(e) {
    this.external = false;
    // this.pageEvent = e;
    // const p = new HttpParams()
    //   .set('page', String(this.pageIndex + 1))
    //   .set('page_size', String(this.pageSize));
    if (this.selectedMentors) {
      this.getMentors(e);
    } else {
      this.getWorkshops(e);
    }
  }

}
