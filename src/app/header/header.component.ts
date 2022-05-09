import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth.service';
import * as jq from 'jquery';
declare var $: any; // ADD THIS
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @ViewChild('logoutmodal', { static: true }) logoutmodal!: ElementRef;
  @ViewChild('lockmodal', { static: true }) lockmodal!: ElementRef;

  menus: Array<any> = [];

  constructor(private auth: AuthService, public modalService: NgbModal) {
    this.menus = getMenuData;
  }

  ngOnInit(): void {}

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
    // this.modalService.dismissAll();
  }

  lock() {
    localStorage.removeItem('utoken');
    this.auth.accLocked.next(true);
    // this.modalService.dismissAll();
  }
}

const getMenuData: any[] = [
  {
    title: 'Daywise Rpt',
    url: '/daywisereport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Orderwise Report',
    url: '/orderwisereport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Productwise Report',
    url: '/productwisereport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Transaction Report',
    url: '/transactionreport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Categorywise Report',
    url: '/categorywisereport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Storewise Report',
    url: '/storewisereport',
    icon: 'fa fa-pie-chart',
    svg: '../../assets/svg/file-text.svg',
    hidden: false,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Products',
    url: '/products',
    icon: 'fa fa-pie-chart',
    svg: '../../assets/svg/tag.svg',
    hidden: false,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Timewise Report',
    url: '/timewisereport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Monthwise Product Sales',
    url: '/monthwiseproduct',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Option Report',
    url: '/optionreport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Ordertype Report',
    url: '/ordertypereport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Saleprodgroupwise Report',
    url: '/saleprodgroupwisereport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
  {
    title: 'Deliveryorder Report',
    url: '/deliveryorderreport',
    icon: 'fa fa-pie-chart',
    hidden: true,
    roles: ['admin'],
    count: 4,
    isCollapsed: true,
    children: [],
  },
];
