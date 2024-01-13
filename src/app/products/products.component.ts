import {
  Component,
  HostListener,
  OnInit,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import * as moment from 'moment';
import { dangertoast } from 'src/assets/dist/js/toast-data';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  user: any;
  companies: any = [];
  companyid: number = 0;
  showdropdown: Observable<boolean>;
  selected_companies: string = '';
  all: boolean = false;
  CompanyId: number = 0;
  ProductsValues: any;
  filterText: string = '';
  storeId: any = 0;
  searchTerm: string = '';
  stores: any;
  status!: number;
  errorMsg: string = '';

  constructor(private Auth: AuthService, private modalService: NgbModal) {
    this.showdropdown = Auth.showdropdown;
  }

  ngOnInit(): void {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.Auth.isloading.next(true);
      this.GetStore();
      this.getCategory();
      this.TGValues();
    });

    setHeightWidth();
    this.Auth.companies.subscribe((comps) => {
      this.companies = comps;
    });
  }

  // getusercompany() {
  //   this.Auth.getusercompanies(this.user.userid).subscribe((data: any) => {
  //     this.companies = data['userCompanies'];
  //     // this.companyid = this.companies[0].CompanyId;
  //   });
  // }

  getcompanyproducts() {
    // this.Auth.getCompanyProducts(this.companyid).subscribe((data: any) => {
    //   console.log(data);
    // });
  }

  getcompanyspg() {
    // this.Auth.getCompanyProducts(this.companyid).subscribe((data: any) => {
    //   console.log(data);
    // });
  }

  select(i: number) {
    console.log(i);
  }

  toggleDropDown() {
    this.Auth.showdropdown.next(true);
  }

  change(bool: boolean = true) {
    // console.log(bool);
    this.selected_companies = this.companies
      .filter((x: any) => x.isselected)
      .map((x: any) => x.AccountName)
      .join(', ');
    console.log(this.selected_companies);
  }

  toggleAll() {
    this.companies.forEach((element: any) => {
      element.isselected = this.all;
    });
    this.change();
  }

  selecteds(e: any) {
    this.storeId = e.Id;
  }
  formatter = (result: any) => result.Name;
  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      distinctUntilChanged(),
      map((term) =>
        term.length < 1
          ? []
          : this.stores
            .filter(
              (v: any) =>
                v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 10)
      )
    );

  selectEvent(e: { Id: any }) {
    this.storeId = e.Id;
  }

  GetStore() {
    this.Auth.GetStores(this.CompanyId).subscribe((data: any) => {
      this.stores = data;
      console.log(this.stores);
      // var obj = {
      //   Id: 0,
      //   Name: 'All',
      //   ParentStoreId: null,
      //   ParentStore: null,
      //   IsMainStore: false,
      // };
      // this.stores.push(obj);
      var response: any = data;
      //this.All();

      if (response.status == 0) {
        this.status = 0;
        this.errorMsg = response.msg;
        console.log(dangertoast(this.errorMsg));
      }
      this.Auth.isloading.next(false);
    });
  }

  filtervalues: any;
  getproducts() {
    this.Auth.isloading.next(true);
    this.Auth.GetStoreProducts(this.CompanyId, this.storeId).subscribe(
      (data: any) => {
        console.log(data);
        this.ProductsValues = data['streprd'];
        this.filtervalues = this.ProductsValues;
        this.Auth.isloading.next(false);
      }
    );
  }

  editProduct(index: number) {
    console.log('Edit product at index:', index);
    console.log('Edited Price:', this.filtervalues[index].Price);
    console.log(
      'Edited Takeaway Price:',
      this.filtervalues[index].TakeawayPrice
    );
    console.log(
      'Edited Delivery Price:',
      this.filtervalues[index].DeliveryPrice
    );
    console.log('Edited Sort Order:', this.filtervalues[index].SortOrder);
  }

  selectedRowIndex: number = -1;
  toggleEditMode(index: number) {
    this.selectedRowIndex = this.selectedRowIndex === index ? -1 : index;
  }

  editMode: boolean = false;

  startEditMode(index: number) {
    if (this.editMode == false) {
      this.selectedRowIndex = index;
      this.editMode = true;
    }
  }

  // saveChanges(index: number) {
  //   if (this.editMode) {
  //     console.log('Saved changes for index:', index);
  //     console.log('Updated Price:', this.ProductsValues[index]);
  //     var postdata = { data: JSON.stringify([this.ProductsValues[index]]) };
  //     // this.Auth.Updatepricebook(postdata).subscribe((data) => {
  //     //   this.selectedRowIndex = -1;
  //     //   this.editMode = false;
  //     // });

  //     // this.selectedRowIndex = -1;
  //     // this.editMode = false;
  //   }
  // }

  saveChanges(index: number) {
    if (this.editMode) {
      console.log('Saved changes for index:', index);
      console.log('Updated Price:', this.filtervalues[index]);

      this.filtervalues[index].TakeawayPrice = this.filtervalues[index].Price;
      this.filtervalues[index].DeliveryPrice = this.filtervalues[index].Price;

      var postdata = { data: JSON.stringify([this.filtervalues[index]]) };
      console.log(postdata);

      this.Auth.Updatepricebook(postdata).subscribe((data) => {
        this.selectedRowIndex = -1;
        this.editMode = false;
      });
    }
  }

  cancelEdit() {
    if (this.editMode) {
      this.selectedRowIndex = -1;
      this.editMode = false;
    }
  }

  selectedRows: any[] = [];
  @ViewChild('TABLE', { static: false })
  TABLE!: ElementRef;

  ExportTOExcel() {
    if (!this.filtervalues.some((x: any) => x.isSelected == true)) {
      alert('select atleast one product');
      return;
    }
    const today: string = moment().format('YYYY-MM-DD');
    const storename = this.stores.filter((str: any) => str.Id == this.storeId);
    this.selectedRows = this.filtervalues.filter(
      (prd: { isSelected: any }) => prd.isSelected
    );

    const mappedData = this.selectedRows.map(
      ({
        TakeawayPrice,
        DeliveryPrice,
        TaxGroupId,
        CategoryId,
        StoreId,
        CompanyId,
        ProductId,
        Id,
        Recommended,
        isSelected,
        ...rest
      }) => rest
    );

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mappedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${today} ${storename[0].Name} products.xlsx`);
  }

  selectAllRows(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.filtervalues.forEach(
      (prd: { isSelected: boolean }) => (prd.isSelected = isChecked)
    );
  }

  openDetailpopup(contentdetail: any) {
    const modalRef = this.modalService.open(contentdetail, {
      centered: true,
      size: 'lg',
      backdropClass: 'z-index-1',
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.readExcelFile(file);
    }
  }

  importedData: any;
  readExcelFile(file: File) {
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const data: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });
      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      this.importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    };

    reader.readAsBinaryString(file);
  }

  importFromExcel() {
    if (this.importedData && this.importedData.length > 1) {
      const headers = this.importedData[0];
      const importedObjects = this.importedData
        .slice(1)
        .map((row: { [x: string]: any }) => {
          const obj: any = {};
          headers.forEach((header: string | number, index: string | number) => {
            obj[header] = row[index];
          });

          obj.TakeawayPrice = obj.Price;
          obj.DeliveryPrice = obj.Price;

          return obj;
        });

      console.log('Imported Data :', importedObjects);

      const postdata = { data: JSON.stringify(importedObjects) };

      this.Auth.Updatepricebook(postdata).subscribe((data) => {
        console.log('Data sent to the server:', data);
        this.getproducts();
        this.CategoryId = 0;
        this.TaxGroupId = 0;
      });
    }
  }

  cancelimport() {
    this.importedData = [];
  }

  categ: any;
  getCategory() {
    this.Auth.getcat(this.CompanyId).subscribe((data) => {
      this.categ = data;
      console.log(this.categ);
    });
  }

  CategoryId: any = 0;
  TaxGroupId: any = 0;
  taxgroupvalues: any;
  TGValues() {
    this.Auth.GetTaxes(this.CompanyId).subscribe((data) => {
      this.taxgroupvalues = data;
      console.log(this.taxgroupvalues);
    });
  }

  // Submit() {
  //   this.Auth.GetStoreProducts(this.CompanyId, this.storeId).subscribe(
  //     (data: any) => {
  //       console.log(data);
  //       const filter = data['streprd'].filter(
  //         (prd: any) => prd.CategoryId == this.CategoryId
  //       );
  //       console.log(filter);
  //       this.ProductsValues = filter;
  //     }
  //   );
  // }

  // slectcat() {
  //   console.log(this.CategoryId);
  //   if (this.CategoryId != 'All') {
  //     const dum = this.ProductsValues;
  //     const filter = dum.filter(
  //       (prd: any) => prd.CategoryId == this.CategoryId
  //     );
  //     this.filtervalues = filter;
  //   } else {
  //     this.filtervalues = this.ProductsValues;
  //   }
  // }

  // slectTG() {
  //   console.log(this.TaxGroupId);
  //   if (this.TaxGroupId != 'All') {
  //     const dum = this.ProductsValues;
  //     const filter = dum.filter(
  //       (prd: any) => prd.TaxGroupId == this.TaxGroupId
  //     );
  //     this.filtervalues = filter;
  //   } else {
  //     this.filtervalues = this.ProductsValues;
  //   }
  // }

  filterProducts() {
    if (this.CategoryId !== 'All' || this.CategoryId !== 'All') {
      const dum = this.ProductsValues;
      const filter = dum.filter(
        (prd: any) =>
          (prd.CategoryId == this.CategoryId || this.CategoryId == 0) &&
          (prd.TaxGroupId == this.TaxGroupId || this.TaxGroupId == 0)
      );
      this.filtervalues = filter;
    } else {
      this.filtervalues = this.ProductsValues;
    }
  }

  slectcat() {
    this.filterProducts(); //'CategoryId', this.CategoryId);
  }

  slectTG() {
    this.filterProducts(); //'TaxGroupId', this.TaxGroupId);
  }
}
