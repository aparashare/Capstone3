import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveClassComponent } from './live-class.component';

describe('LiveClassComponent', () => {
  let component: LiveClassComponent;
  let fixture: ComponentFixture<LiveClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
