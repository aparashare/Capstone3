import {Component, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {BaseChartDirective, Color, Label} from 'ng2-charts';

@Component({
  selector: 'app-lifetime-report',
  templateUrl: './lifetime-report.component.html',
  styleUrls: ['./lifetime-report.component.sass']
})
export class LifetimeReportComponent implements OnInit {
  public lineChartData: ChartDataSets[] = [
    { data: [400, 600, 400, 1000, 800, 1200, 1200, 600, 1000, 800, 1200, 1000] },
  ];
  public lineChartLabels: Label[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    elements: {
      line: {
        fill: false,
        tension: 0,
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
        },
      }],
      yAxes: [{
        gridLines: {
          drawBorder: false,
          borderDash: [8, 4],
        },
        display: true,
        ticks: {
          beginAtZero: true,
          max: 1400
        }
      }]
    },
    legend: {
      display: false,
    },
    annotation: {
      annotations: [],
    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: '#FFC149',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor() { }

  ngOnInit() {}

}
