import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { ColorService } from 'src/app/services/color/color.service';
// import { statusColors } from 'src/environments/environment';

declare function setHeightWidth(): any;
declare var $: any;
declare var feather: any;

@Component({
  selector: 'app-deliveryorderreport',
  templateUrl: './deliveryorderreport.component.html',
  styleUrls: ['./deliveryorderreport.component.css'],
})
export class DeliveryorderreportComponent implements OnInit {
  // statusColors: any = statusColors
  model!: NgbDateStruct;
  loginfo: any;
  companyid: number = 0;
  storeid: number = 0;
  fromdate: string = '';
  todate: string = '';
  smodel = '';
  dmodel = '';
  feather: any = feather
  // date: { year: number; month: number }
  showcalender = false;
  stores: any = [];
  storeOrderCount: any = []
  displaydate = moment().format('Do MMM YYYY');
  daterange: any;
  orders: any = [];
  transaxns: any[] = []
  invoiceno: string = '';
  temporder: any;
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment().subtract(1, 'month').startOf('month'),
      moment().subtract(1, 'month').endOf('month'),
    ],
  };
  selected: any = {
    startDate: moment().subtract(7, 'days'),
    endDate: moment(),
  };
  invalidDates: moment.Moment[] = [
    moment().add(2, 'days'),
    moment().add(3, 'days'),
    moment().add(5, 'days'),
  ];
  statuses = [
    { id: 0, status: 'accepted' },
    { id: 3, status: 'foodready' },
    { id: 4, status: 'dispatch' },
    { id: 5, status: 'completed' },
  ];
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };
  constructor(
    private auth: AuthService,
    private calendar: NgbCalendar,
    public modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private cservice: ColorService
  ) {
    // this.loginfo = JSON.parse(localStorage.getItem('loginInfo'))
    // this.companyid = this.loginfo.CompanyId;
  }

  ngOnInit() {
    feather.replace();
    setHeightWidth();
    this.auth.companyid.subscribe((companyid) => {
      this.companyid = companyid;
      // this.Auth.isloading.next(true);
      this.model = this.calendar.getToday();
      // this.startdate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      // this.enddate = moment().format('YYYY-MM-DD');
      this.getstores();
      this.showmenu = false
      this.smodel = '';
      this.storeid = 0
      // this.deliveryOrderReport();
      // document.getElementById("date-range").addEventListener('onselected', e => {
      //   console.log(e)
      // })
    });
  }
  // ngAfterViewInit(): void {
  //   feather.replace();
  //   setHeightWidth();
  // }
  icon: SafeHtml = feather.icons.copy.toSvg()
  onDateSelect(date: NgbDate) {
    console.log(date);
    this.model = date;
    this.displaydate = moment(`${date.year}-${date.month}-${date.day}`).format(
      'Do MMM YYYY'
    );
    this.showcalender = false;
    // this.fetchEntries(`${date.year}-${date.month}-${date.day}`)
  }

  getstores() {
    this.auth.GetStores(this.companyid).subscribe((data: any) => {
      console.log(data);
      this.stores = data;
    });
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      map((term) =>
        term === ''
          ? []
          : this.stores
            .filter(
              (v: any) => v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 10)
      )
    );
  search1 = (text$: Observable<string>) =>
    text$.pipe(
      map((term) =>
        term === ''
          ? []
          : this.stores
            .filter(
              (v: any) => v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 10)
      )
    );

  formatter = (x: { Name: string }) => x.Name;
  formatter1 = (x: { Name: string }) => x.Name;

  selectedItem(store: any) {
    console.log(store);
    this.storeid = store.Id;
  }
  selectedDelItem(store: any) {
    console.log(store);
    this.storeid = store.Id;
  }

  deliveryOrderReport() {
    this.auth
      .DeliveryOrderReport(
        this.storeid,
        this.companyid,
        this.startdate.format('YYYY-MM-DD HH:mm A'),
        this.enddate.format('YYYY-MM-DD HH:mm A'),
        this.invoiceno
      )
      .subscribe((data: any) => {
        console.log(data);
        this.orders = data['report'];
        // this.storeOrderCount = data['ordercountreport'];
        console.log(this.orders);
        this.transaxns = data["transactions"]
        this.transaxns.forEach(txn => {
          txn.InvoiceNo = this.orders.filter((x: any) => x.OdrsId == txn.OrderId)[0].InvoiceNo
        })
        // this.orders = this.temporder.filter((x: any) => x.OrderId);
      });
  }

  showmenu: boolean = false
  DeliveryOrderCount() {
    this.storeOrderCount["isloading"] = true
    this.auth
      .DeliveryOrderCount(
        this.storeid,
        this.companyid,
        this.startdate.format('YYYY-MM-DD HH:mm A'),
        this.enddate.format('YYYY-MM-DD HH:mm A'),
        this.invoiceno
      )
      .subscribe((data: any) => {
        console.log(data);
        feather.replace();
        this.showmenu = true
        this.storeOrderCount = data['report'];
      });
  }

  change(e: any) {
    console.log(e);
  }

  startdate: moment.Moment = moment().startOf('day').subtract(16, 'hour');
  enddate: moment.Moment = moment().endOf('day');

  date(e: any) {
    if (e.startDate && e.endDate) {
      this.startdate = e.startDate.format('YYYY-MM-DD');
      this.enddate = e.endDate.format('YYYY-MM-DD');
    }
  }

  selectOrder(order: any) {
    console.log(order);
    this.temporder = order;
    console.log(this.temporder);
    this.temporder.StatusName = order.StatusName;
    this.temporder.OrderStatusId = order.OrderStatusId;
    this.temporder.StoreName = order.StoreName;
    this.temporder.InvoiceNo = order.InvoiceNo;
    this.temporder.Note = order.Note;
    this.temporder.BillAmount = order.BillAmount;
    this.temporder.PaidAmount = order.PaidAmount;
    this.temporder.OrderedDate = moment(order.OrderedDate).format('YYYY-MM-DD');
    this.temporder.DeliveryDateTime = moment(order.DeliveryDateTime).format(
      'YYYY-MM-DD'
    );
    this.temporder.DeliveredDateTime = moment(order.DeliveredDateTime).format(
      'YYYY-MM-DD'
    );
    this.temporder.DeliveryStoreId = order.DeliveryStoreId;
    this.temporder.DeliveryStoreObj = this.stores.filter(
      (x: any) => x.Id == this.temporder.DeliveryStoreId
    )[0];
  }
  // save() {
  //   if (this.temporder.InvoiceNo.includes('Z') || this.temporder.InvoiceNo.includes('S')) {
  //     this.auth.updateuporder(this.temporder.OrderId, this.temporder).subscribe(data => {
  //       this.temporder = null
  //     })
  //   } else {
  //     this.auth.updateorder({ OrderJson: JSON.stringify(this.temporder) }).subscribe(data => {
  //       this.temporder = null
  //     })
  //   }
  // }

  setDateRange() {
    setTimeout(() => {
      $('input[name="datetimes"]').daterangepicker({
        timePicker: true,
        startDate: this.startdate,
        endDate: this.enddate,
        "cancelClass": "btn-secondary",
        locale: {
          format: 'DD/M hh:mm A'
        }
      }, (a: moment.Moment, b: moment.Moment) => {
        this.startdate = a;
        this.enddate = b;
        console.log(a.format('YYYY-MM-DD HH:mm A'), b.format('YYYY-MM-DD HH:mm A'))
      });
    }, 500);
  }
  getstorereport(store: any) {
    this.storeid = store.Id
    this.smodel = store
    this.deliveryOrderReport()
  }
  oti: number = 0
  toClipBoard() {
    // Clipboard
    let cbt: string = "STORE \t TAK \t DEL \t PICK \t FBONL \t\t cash \t card \t phonepe \n"
    this.storeOrderCount.forEach((r: any) => {
      cbt += `${r.Name} \t ${r.takeaway} \t ${r.delivery} \t ${r.pickup} \t ${r.fbonline} \t\t ${r.cash} \t ${r.card} \t ${r.phonepe} \n`
    });
    navigator.clipboard.writeText(cbt)
  }
  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      this.setDateRange()
      if (this.hidecontent) {
        this.keyarr = [];
      }
    }
  }
}

/*
[{id:0,status:'accepted'},
{id:3,status:'foodready'},
{id:4,status:'dispatch'},
{id:5,status:'completed'}]
*/
