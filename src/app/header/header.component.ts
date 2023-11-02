import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
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
  multicompanies: boolean = false;

  showdropdown: Observable<boolean>;
  selected_companies: string = '';
  all: boolean = false;

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
    this.showdropdown = auth.showdropdown;
    // console.log(router.url)
    this.menuActiveConfig(router.url, getMenuData);
    if (router.url == '/maintenance') {
      this.multicompanies = true;
    } else {
      this.multicompanies = false;
    }
    // console.log(router.url, this.multicompanies);
    router.events.forEach((event) => {
      // console.log(event);
      if (event instanceof NavigationStart) {
        this.auth.isloading.next(false);
        const pageName = event['url'].replace('/', '');
        this.menuActiveConfig(event['url'], getMenuData);
        if (event['url'] == '/maintenance') {
          this.multicompanies = true;
        } else {
          this.multicompanies = false;
        }
        // console.log(event['url'], this.multicompanies);
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
    this.modalService.open(modal, {
      centered: true,
      backdropClass: 'z-index-1',
    });
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
    this.modalService.open(this.logoff_prompt, { backdropClass: 'z-index-1' });
  }

  getstores() {
    this.auth.GetStores(this.companyid).subscribe((data) => {
      console.log(data);
      this.stores = data;
      this.auth.isloading.next(false);
    });
  }

  //multi select
  select(i: number) {
    console.log(i);
  }

  toggleDropDown() {
    this.auth.showdropdown.next(true);
  }

  change(bool: boolean = true) {
    // console.log(bool);
    this.selected_companies = this.companies
      .filter((x: any) => x.isselected)
      .map((x: any) => x.AccountName)
      .join(', ');
    console.log(this.selected_companies);
    this.auth.selectedcompanies.next(
      this.companies
        .filter((x: any) => x.isselected)
        .map((x: any) => x.CompanyId)
    );
  }

  toggleAll() {
    this.companies.forEach((element: any) => {
      element.isselected = this.all;
    });
    this.change();
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
    title: 'Maintenance Report',
    url: '/maintenance',
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
    url: '/m1',
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
    title: 'Denominations',
    url: '/m2',
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
    url: '',
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
        url: '/r1',
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
        url: '/r2',
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
        url: '/r3',
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
        url: '/r4',
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
        url: '/r5',
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
        url: '/r6',
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
        url: '/r7',
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
        url: '/r8',
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
        title: 'Cancel Order',
        url: '/r9',
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
        title: 'Product Sales',
        url: '/r10',
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
        title: 'Customer List',
        url: '/r11',
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
        title: 'Versions List',
        url: '/r12',
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
        title: 'Kb2 Ratio',
        url: '/kb2chef',
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
  {
    title: 'Order Forensic',
    url: '',
    icon: 'fa fa-pie-chart',
    svg: '../../assets/svg/file-text.svg',
    icon_res: 'svg',
    hidden: false,
    roles: ['admin', 'cashier'],
    notification_count: 4,
    isCollapsed: true,
    children: [
      {
        title: 'Sus Orders | Pending Orders',
        url: '/m3',
        icon: 'fa fa-pie-chart',
        svg: '../../assets/svg/phone-incoming.svg',
        icon_res: 'svg',
        hidden: false,
        roles: ['admin', 'cashier'],
        notification_count: 4,
        isCollapsed: true,
        children: [],
        active: false,
      },
    ],
    active: false,
  },
];
