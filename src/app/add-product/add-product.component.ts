import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { dangertoast } from 'src/assets/dist/js/toast-data';
import * as moment from 'moment';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  CategoryId: any = 0;
  CompanyId: number = 0;
  TaxGroupId: any = 0;
  PrdName: any = '';
  PrdDesc: any = '';
  PrdCode: any = '';
  PrdPrice: any;
  PrdUpPrice: any;
  PrdSortOrd: number = -1;
  PrdActive: boolean = true;
  PrdRecomd: boolean = false;
  PrdOnline: boolean = false;
  Prdtype: number = 0;
  formSubmitted: boolean = false;
  storeId: any = 0;
  ProductsValues: any;
  filtervalues: any[] = [];
  searchTerm: string = '';
  stores: any;
  mainscreen: boolean = true;
  status!: number;
  errorMsg: string = '';
  updateprdvalues = [];
  filterText: string = '';
  p: any;

  constructor(private Auth: AuthService, private renderer2: Renderer2) {}

  ngOnInit(): void {
    this.Auth.companyid.subscribe((companyid) => {
      this.CompanyId = companyid;
      this.Auth.isloading.next(true);
      if (companyid > 0) {
        this.GetStore();
        this.getproducts();
        this.getCategory();
        this.TGValues();
      }
    });

    // localStorage.setItem('SavedCompaniesId', this.CompanyId.toString());
  }

  categ: any;
  getCategory() {
    this.Auth.getcat(this.CompanyId).subscribe((data) => {
      this.categ = data;
      console.log(this.categ);
    });
  }

  taxgroupvalues: any;
  TGValues() {
    this.Auth.GetTaxes(this.CompanyId).subscribe((data) => {
      this.taxgroupvalues = data;
      console.log(this.taxgroupvalues);
    });
  }

  errorMessages = {
    PrdName: '',
    Prdtype: '',
    CategoryId: '',
    TaxGroupId: '',
    PrdPrice: '',
    PrdUpPrice: '',
  };
  Submit() {
    this.formSubmitted = true;

    if (
      !this.PrdName ||
      !this.Prdtype ||
      !this.CategoryId ||
      !this.TaxGroupId ||
      !this.PrdPrice ||
      !this.PrdUpPrice
    ) {
      if (!this.PrdName) {
        this.errorMessages.PrdName = 'Product Name is required.';
      }

      if (!this.Prdtype) {
        this.errorMessages.Prdtype = 'Product Type is required.';
      }

      if (!this.CategoryId) {
        this.errorMessages.CategoryId = 'Category is required.';
      }

      if (!this.TaxGroupId) {
        this.errorMessages.TaxGroupId = 'Tax Group is required.';
      }

      if (!this.PrdPrice) {
        this.errorMessages.PrdPrice = 'Price is required.';
      }

      if (!this.PrdUpPrice) {
        this.errorMessages.PrdPrice = 'UPPrice is required.';
      }

      return;
    }

    this.errorMessages = {
      PrdName: '',
      Prdtype: '',
      CategoryId: '',
      TaxGroupId: '',
      PrdPrice: '',
      PrdUpPrice: '',
    };

    const productArray = [];

    let obj = {
      ProductId: 0,
      Id: 0,
      Name: this.PrdName,
      Description: this.PrdDesc,
      UnitId: 1,
      CategoryId: this.CategoryId,
      Price: this.PrdPrice,
      TakeawayPrice: this.PrdPrice,
      DeliveryPrice: this.PrdPrice,
      UPPrice: this.PrdUpPrice,
      MakingCost: 0,
      ImgUrl: null,
      ProductCode: this.PrdCode,
      PrepTime: '00:00:00',
      BarCode: null,
      isactive: this.PrdActive,
      isonline: this.PrdOnline,
      SortOrder: this.PrdSortOrd,
      GroupSortOrder: -1,
      Recomended: this.PrdRecomd,
      minquantity: 0,
      minblock: 0,
      TaxGroupId: this.TaxGroupId,
      KOTGroupId: null,
      Image: null,
      ProductTypeId: this.Prdtype,
      CreatedDate: moment().format('YYYY-MM-DD'),
      ModifiedDate: moment().format('YYYY-MM-DD'),
      ProductName: '',
      CompanyId: this.CompanyId,
      IsSaleProdGroup: false,
      IsQtyPredefined: false,
      groupid: 0,
    };
    this.Auth.addProduct(obj, this.image).subscribe((data) => {
      console.log(data);
      this.backprod();
      alert('Product Added Successfully');
    });
    // productArray.push(obj);
    // console.log(productArray);

    // alert('Product Added Successfully...');
  }

  Clear() {
    this.formSubmitted = false;
    (this.PrdName = ''),
      (this.PrdDesc = ''),
      (this.PrdCode = ''),
      (this.Prdtype = 0),
      (this.CategoryId = 0),
      (this.TaxGroupId = 0),
      (this.PrdPrice = ''),
      (this.PrdUpPrice = ''),
      (this.PrdUpPrice = ''),
      (this.PrdSortOrd = -1),
      (this.PrdActive = true),
      (this.PrdRecomd = false);
    this.PrdOnline = false;
    this.savedimageedit = '';
  }

  getproducts() {
    this.Auth.isloading.next(true);
    this.Auth.GetProducts(this.CompanyId).subscribe((data: any) => {
      console.log(data);
      this.ProductsValues = data;
      this.filtervalues = this.ProductsValues;
      this.Auth.isloading.next(false);
    });

    // this.filtervalues = [
    //   {
    //     Name: 'Kadai Chicken**',
    //     UPPrice: 313,
    //     TaxGroupId: 49,
    //     CategoryId: 2635,
    //     Price: 313,
    //     TakeawayPrice: 313,
    //     DeliveryPrice: 313,
    //     StoreId: 306,
    //     CompanyId: 48,
    //     ProductId: 12866,
    //     Id: 54178,
    //     SortOrder: -1,
    //     Recommended: true,
    //   },
    //   {
    //     Name: 'Hyd Chicken Masala**',
    //     UPPrice: 313,
    //     TaxGroupId: 49,
    //     CategoryId: 2635,
    //     Price: 313,
    //     TakeawayPrice: 313,
    //     DeliveryPrice: 313,
    //     StoreId: 306,
    //     CompanyId: 48,
    //     ProductId: 12868,
    //     Id: 54192,
    //     SortOrder: -1,
    //     Recommended: true,
    //   },
    // ];

    console.log(this.filtervalues);

    this.Auth.isloading.next(false);
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

  selecteds(e: any) {
    this.storeId = e.Id;
  }

  addprod() {
    this.mainscreen = false;
    this.savedimageedit = null;
  }

  backprod() {
    this.Clear();
    this.mainscreen = true;
    this.uptmainscreen = false;
    this.getproducts();
  }

  GetStore() {
    this.Auth.GetStores(this.CompanyId).subscribe((data: any) => {
      this.stores = data;
      // console.log(this.stores);
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

  uptmainscreen = false;
  savedimageedit: any = '';
  updatescr(data: any) {
    this.savedupdprd = data;
    this.savedimageedit = this.savedupdprd.ImgUrl;
    console.log(this.savedupdprd.ImgUrl);
    this.mainscreen = false;
    this.uptmainscreen = true;
    this.CompanyId = data.CompanyId;
    this.PrdName = data.Name;
    this.PrdDesc = data.Name;
    this.PrdCode = '';
    this.Prdtype = 0;
    this.CategoryId = data.CategoryId;
    this.TaxGroupId = data.TaxGroupId;
    this.PrdPrice = data.Price;
    this.PrdUpPrice = data.UPPrice;
    this.PrdSortOrd = data.SortOrder;
    this.PrdActive = true;
    this.PrdRecomd = data.Recommended;
    this.PrdOnline = data.isonline;
  }

  savedupdprd: any;
  updateprd() {
    this.formSubmitted = true;

    if (
      !this.PrdName ||
      !this.Prdtype ||
      !this.CategoryId ||
      !this.TaxGroupId ||
      !this.PrdPrice ||
      !this.PrdUpPrice
    ) {
      if (!this.PrdName) {
        this.errorMessages.PrdName = 'Product Name is required.';
      }

      if (!this.Prdtype) {
        this.errorMessages.Prdtype = 'Product Type is required.';
      }

      if (!this.CategoryId) {
        this.errorMessages.CategoryId = 'Category is required.';
      }

      if (!this.TaxGroupId) {
        this.errorMessages.TaxGroupId = 'Tax Group is required.';
      }

      if (!this.PrdPrice) {
        this.errorMessages.PrdPrice = 'Price is required.';
      }

      if (!this.PrdUpPrice) {
        this.errorMessages.PrdPrice = 'UPPrice is required.';
      }

      return;
    }

    this.errorMessages = {
      PrdName: '',
      Prdtype: '',
      CategoryId: '',
      TaxGroupId: '',
      PrdPrice: '',
      PrdUpPrice: '',
    };

    const productArray = [];

    let obj = {
      ProductId: this.savedupdprd.ProductId,
      Id: this.savedupdprd.Id,
      Name: this.PrdName,
      Description: this.PrdDesc,
      UnitId: this.savedupdprd.UnitId,
      CategoryId: this.CategoryId,
      Price: this.PrdPrice,
      TakeawayPrice: this.PrdPrice,
      DeliveryPrice: this.PrdPrice,
      UPPrice: this.PrdUpPrice,
      MakingCost: this.savedupdprd.MakingCost,
      ImgUrl: this.savedupdprd.ImgUrl,
      ProductCode: this.PrdCode,
      PrepTime: this.savedupdprd.PrepTime,
      BarCode: this.savedupdprd.BarCode,
      isactive: this.PrdActive,
      isonline: this.PrdOnline,
      SortOrder: this.PrdSortOrd,
      GroupSortOrder: this.savedupdprd.GroupSortOrder,
      Recomended: this.PrdRecomd,
      minquantity: this.savedupdprd.minquantity,
      minblock: this.savedupdprd.minblock,
      TaxGroupId: this.TaxGroupId,
      KOTGroupId: this.savedupdprd.KOTGroupId,
      Image: this.savedupdprd.Image,
      ProductTypeId: this.Prdtype,
      CreatedDate: this.savedupdprd.CreatedDate,
      ModifiedDate: moment().format('YYYY-MM-DD'),
      ProductName: this.savedupdprd.ProductName,
      CompanyId: this.CompanyId,
      IsSaleProdGroup: this.savedupdprd.IsSaleProdGroup,
      IsQtyPredefined: this.savedupdprd.IsQtyPredefined,
      groupid: this.savedupdprd.groupid,
    };
    this.Auth.updateProduct(obj, this.image).subscribe((data) => {
      console.log(data);
      this.backprod();
      alert('Product Updated Successfully');
    });

    // productArray.push(obj);
    // console.log(productArray);
  }
  image: File | null = null;
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      this.image = file;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.updateImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  updateImageSrc(src: string): void {
    const imgElement = document.getElementById(
      'productImage'
    ) as HTMLImageElement;

    if (imgElement) {
      imgElement.src = src;
    }
  }

  @ViewChild('fileInput') fileInput: ElementRef | any;

  onProductImageClick() {
    this.renderer2.selectRootElement(this.fileInput.nativeElement).click();
  }

  filterProducts() {
    console.log(this.CategoryId, this.CategoryId);
    if (this.CategoryId !== 'All' || this.CategoryId !== 'All') {
      console.log(this.CategoryId, this.CategoryId);
      // const dum = this.ProductsValues;
      const filter = this.ProductsValues.filter(
        (prd: any) =>
          (prd.CategoryId == this.CategoryId || this.CategoryId == 0) &&
          (prd.TaxGroupId == this.TaxGroupId || this.TaxGroupId == 0)
      );
      this.filtervalues = filter;
    } else {
      this.filtervalues = this.ProductsValues;
    }
  }
}
