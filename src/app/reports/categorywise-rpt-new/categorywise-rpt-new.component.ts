import { Component, HostListener, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-categorywise-rpt-new',
  templateUrl: './categorywise-rpt-new.component.html',
  styleUrls: ['./categorywise-rpt-new.component.css'],
})
export class CategorywiseRptNewComponent implements OnInit {
  selected: any;
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
  startdate = moment().format('YYYY-MM-DD');
  enddate = moment().format('YYYY-MM-DD');
  p: string | number | undefined;
  constructor(private Auth: AuthService) {}
  CompanyId: number = 0;
  ngOnInit(): void {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.getCategory();
      this.CatId = 0;
    });
  }

  hidecontent: boolean = true;
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      this.hidecontent = !(this.keyarr.join('') == this.keycode);
      if (!this.hidecontent) {
        // this.initial();
      }
      this.keyarr = [];
    }
  }

  date(
    e:
      | {
          startDate: { format: (arg0: string) => any };
          endDate: { format: (arg0: string) => any };
        }
      | any
  ) {
    if (e && e.startDate && e.endDate) {
      this.startdate = e.startDate.format('YYYY-MM-DD');
      this.enddate = e.endDate.format('YYYY-MM-DD');
    }
  }

  isInvalidDate = (m: moment.Moment) => {
    return m.isBefore(moment('2024-02-22'));
  };

  GetCatValues: any;
  GetCat() {
    this.Auth.Get2CatOnly(this.CompanyId).subscribe((data: any) => {
      // this.GetCatValues = data.filter((x: any) => x.CompanyId != 0);
      this.GetCatValues = data;
      console.log(this.GetCatValues);
      console.log(data);
    });
  }

  CatId: any = 0;
  GetCatwiseAllRptValues: any;
  totalamount: any;
  totaldiscamount: any;
  totalzsamount: any;
  hidebool: any = 1;
  // GetCatwiseAllRpt() {
  //   if (this.CatId == -74489) {
  //     this.hidebool = 1;
  //     this.CatId = this.GetCatValues[0].Id;
  //   } else {
  //     this.hidebool = 0;
  //   }
  //   this.Auth.GetCatwiseAllStr(
  //     this.CatId,
  //     this.CompanyId,
  //     this.startdate,
  //     this.enddate,
  //     this.hidebool
  //   ).subscribe((data: any) => {
  //     console.log(data);
  //     this.GetCatwiseAllRptValues = data['spt'];
  //     let totalPaidAmount = 0;
  //     let totalDiscAmount = 0;
  //     for (const row of this.GetCatwiseAllRptValues) {
  //       totalPaidAmount += row.Amt;
  //       this.totalamount = totalPaidAmount;
  //       totalDiscAmount += row.DisAmt;
  //       this.totaldiscamount = totalDiscAmount;
  //     }
  //   });
  //   if (this.hidebool == 1) {
  //     this.CatId = -74489;
  //   }
  // }

  othercatvalues: any;
  szDatas: any;
  FinalCatValues: any;
  GetCatwiseAllRpt() {
    this.Auth.isloading.next(true);
    // if (this.CatId == -74489) {
    //   this.hidebool = 1;
    //   this.CatId = this.GetCatValues[0]?.Id ?? 0; // Default to 0 if undefined
    // } else {
    //   this.hidebool = 0;
    // }

    this.Auth.GetCatwiseAllStr(
      this.CategoryId,
      this.CompanyId,
      this.startdate,
      this.enddate,
      this.hidebool
    ).subscribe((data: any) => {
      console.log(data);
      if (data['status'] == 200) {
        this.Auth.isloading.next(false);
      }
      this.szDatas = data['zspt'];
      this.othercatvalues = data['spt'];
      this.GetCatwiseAllRptValues = data?.['spt'] ?? [];

      // Create a map to store sums for each StoreName
      const storeSums = new Map<
        string,
        { Amt: number; DisAmt: number; BillAmt: number }
      >();

      // Iterate through the array and update sums
      for (const row of this.GetCatwiseAllRptValues) {
        const storeName = row?.StoreName;

        if (storeName != null) {
          if (!storeSums.has(storeName)) {
            storeSums.set(storeName, {
              Amt: row?.Amt ?? 0,
              DisAmt: row?.DisAmt ?? 0,
              BillAmt: row?.BillAmt ?? 0,
            });
          } else {
            storeSums.get(storeName)!.Amt += row?.Amt ?? 0;
            storeSums.get(storeName)!.DisAmt += row?.DisAmt ?? 0;
            storeSums.get(storeName)!.BillAmt += row?.BillAmt ?? 0;
          }
        }
      }

      // Update the GetCatwiseAllRptValues array with summed values
      this.GetCatwiseAllRptValues = Array.from(storeSums.entries()).map(
        ([storeName, sums]) => ({
          StoreName: storeName,
          Amt: sums?.Amt ?? 0,
          DisAmt: sums?.DisAmt ?? 0,
          BillAmt: sums?.BillAmt ?? 0,
        })
      );

      // Calculate totalPaidAmount and totalDiscAmount
      let totalPaidAmount = 0;
      let totalDiscAmount = 0;
      let totalZzAmount = 0;
      let totalSsAmount = 0;

      const mergedArray = [];
      for (const obj1 of this.GetCatwiseAllRptValues) {
        const obj2 = this.szDatas.find(
          (item: any) => item.StoreName === obj1.StoreName
        );
        if (obj2) {
          const mergedObject = { ...obj1, ...obj2 };
          mergedArray.push(mergedObject);
        }
      }
      console.log('Json Joined HyperTech:', mergedArray);
      this.FinalCatValues = mergedArray;

      for (const row of this.FinalCatValues) {
        totalPaidAmount += row?.Amt ?? 0;
        totalDiscAmount += row?.DisAmt ?? 0;
        totalZzAmount += row?.Zomato ?? 0;
        totalSsAmount += row?.Swiggy ?? 0;
      }

      this.totalamount = totalPaidAmount;
      this.totaldiscamount = totalDiscAmount;
      this.totalzsamount = totalZzAmount + totalSsAmount;
    });

    // if (this.hidebool == 1) {
    //   this.CatId = -74489;
    // }
    this.filterothercats = [];
  }

  filterothercats: any;
  othercats(data: any) {
    this.filterothercats = this.othercatvalues;
    this.filterothercats = this.filterothercats.filter(
      (x: any) => x.StoreName == data
    );
  }

  categ: any;
  getCategory() {
    this.Auth.getcat(this.CompanyId).subscribe((data: any) => {
      this.categ = data['totalSales'];
      console.log(this.categ);
    });
  }
  selectedCategories: string[] = [];
  CategoryId: any = 0;
  showDropdown: boolean = false;
  selectedValues: string = '';
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const dropdownElement = document.querySelector('.dropdown');
    if (!dropdownElement?.contains(clickedElement)) {
      this.showDropdown = false;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleItem(item: any): void {
    item.checked = !item.checked;
    this.updateSelectedValues();
  }

  updateSelectedValues(): void {
    const selectedItems = this.categ.filter((item: any) => item.checked);
    this.selectedValues = selectedItems
      .map((item: any) => item.description)
      .join(', ');
    this.CategoryId = selectedItems.map((item: any) => item.id).join(',');
    console.log(this.CategoryId);
  }
}
