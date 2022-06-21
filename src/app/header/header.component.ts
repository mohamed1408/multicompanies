import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth.service';
// import * as jq from 'jquery';
// import { Observable } from 'rxjs';
declare var $: any; // ADD THIS
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @ViewChild('logoutmodal', { static: true }) logoutmodal!: ElementRef;
  @ViewChild('lockmodal', { static: true }) lockmodal!: ElementRef;
  @ViewChild('logoff_prompt', { static: true }) logoff_prompt!: ElementRef;

  user: any;
  menus: Array<any> = [];
  companies: any = [];
  companyid: number = 0;
  stores: any = [];
  storeid: number = 0;

  constructor(
    private auth: AuthService,
    public modalService: NgbModal,
    private router: Router
  ) {
    this.menus = getMenuData;
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    this.auth.user.subscribe((user) => {
      this.user = user;
    });
    this.auth.companies.subscribe((companies) => {
      this.companies = companies;
    });
    this.auth.companyid.subscribe((companyid) => {
      this.companyid = companyid;
    });
    // console.log(router.url)
    this.menuActiveConfig(router.url, getMenuData);
    router.events.forEach((event) => {
      console.log(event);
      if (event instanceof NavigationStart) {
        this.auth.isloading.next(false);
        const pageName = event['url'].replace('/', '');
        this.menuActiveConfig(event['url'], getMenuData);

        // if (event["url"] == "/") {
        //   this.showHead = false;
        // } else if (event["url"] == "/signup") {
        //   this.showHead = false;
        //   //this.AppName = "";
        // } else if (event["url"] == "/unlockscreen") {
        //   this.showHead = false;
        // } else if (event["url"] == "/password-reset") {
        //   this.showHead = false;
        // } else {
        //   this.showHead = true;
        // }
      }
    });
  }

  ngOnInit(): void {}

  menuActiveConfig(route: string, menu: navlink[]) {
    let exists = false;
    menu.forEach((nav) => {
      if (nav.url == route) {
        nav.active = true;
        exists = true;
        return;
      } else {
        nav.active = false;
        // exists = false;
        nav.isCollapsed = !this.menuActiveConfig(route, nav.children);
      }
    });
    return exists;
  }

  toggleCollapse(i: number) {
    if (this.menus[i].isCollapsed) {
      this.menus[i].isCollapsed = false;
    } else {
      this.menus.forEach((menu, ind) => {
        if (ind == i) menu.isCollapsed = true;
        else menu.isCollapsed = false;
      });
    }
  }

  setCompanyId() {
    this.auth.companyid.next(this.companyid);
  }

  navbartoggle() {
    // console.log(document.getElementById("maindiv"))
    document.getElementById('maindiv')?.classList.toggle('hk-nav-toggle');
  }

  openmodal(modal: any) {
    this.modalService.open(modal, { centered: true });
  }

  logout() {
    localStorage.removeItem('ctoken');
    localStorage.removeItem('utoken');
    this.auth.accLocked.next(true);
    this.auth.loggedIn.next(false);
    this.modalService.dismissAll();
  }

  lock() {
    localStorage.removeItem('utoken');
    this.auth.accLocked.next(true);
    this.modalService.dismissAll();
  }

  prompt_logoff() {
    this.modalService.open(this.logoff_prompt);
  }

  getstores() {
    this.auth.GetStores(this.companyid).subscribe((data) => {
      console.log(data);
      this.stores = data;
      this.auth.isloading.next(false);
    });
  }
}

interface navlink {
  title: string;
  url: string;
  icon: string;
  svg: string;
  icon_res: string;
  hidden: boolean;
  roles: Array<string>;
  notification_count: number;
  isCollapsed: boolean;
  children: Array<navlink>;
  active: boolean;
}

let getMenuData: Array<navlink> = [
  {
    title: 'Storewise Report',
    url: '/storewisereport',
    icon: 'fa fa-pie-chart',
    svg: '../../assets/svg/file-text.svg',
    icon_res: 'svg',
    hidden: false,
    roles: ['admin'],
    notification_count: 4,
    isCollapsed: true,
    children: [],
    active: false,
  },
  {
    title: 'Products',
    url: '/products',
    icon: 'fa fa-pie-chart',
    svg: '../../assets/svg/tag.svg',
    icon_res: 'svg',
    hidden: false,
    roles: ['admin'],
    notification_count: 4,
    isCollapsed: true,
    children: [],
    active: false,
  },
  {
    title: 'Enquiry Orders',
    url: '/enquiryorders',
    icon: 'fa fa-pie-chart',
    svg: '../../assets/svg/phone-incoming.svg',
    icon_res: 'svg',
    hidden: false,
    roles: ['admin'],
    notification_count: 4,
    isCollapsed: true,
    children: [],
    active: false,
  },
  {
    title: 'REPORTS',
    url: '/monthwiseproduct',
    icon: 'fa fa-pie-chart',
    svg: '../../assets/svg/file-text.svg',
    icon_res: 'svg',
    hidden: false,
    roles: ['admin'],
    notification_count: 4,
    isCollapsed: true,
    children: [
      {
        title: 'Order Wise',
        url: '/orderwisereport',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
      {
        title: 'Product Wise',
        url: '/productwisereport',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
      {
        title: 'Category Wise',
        url: '/categorywisereport',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
      {
        title: 'Store Wise',
        url: '/storewisereportpd',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
      {
        title: 'Time Wise',
        url: '/timewisereport',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
      {
        title: 'Month Wise Product',
        url: '/monthwiseproductreport',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
      {
        title: 'SPG Wise',
        url: '/spgwisereport',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
      {
        title: 'Delivery Order',
        url: '/deliveryorderreport',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
    ],
    active: false,
  },
];
