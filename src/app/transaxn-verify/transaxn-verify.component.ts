import { Component, OnInit } from '@angular/core';
import { dtrangepicker } from '../../assets/dist/js/datePickerHelper';
import { ExcelService } from '../services/excel/excel.service';
import { AuthService } from '../auth.service';
import * as moment from 'moment';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-transaxn-verify',
  templateUrl: './transaxn-verify.component.html',
  styleUrls: ['./transaxn-verify.component.css']
})
export class TransaxnVerifyComponent implements OnInit {
  mode: string = ""

  phonepe: bzarray = new bzarray([])
  phonepestores: any = []
  posphonepe: bzarray = new bzarray([])
  posphonepestores: any = []

  card: bzarray = new bzarray([])
  cardstores: any = []
  poscard: bzarray = new bzarray([])
  poscardstores: any = []

  searchTerm: string = ""
  stores: any[] = []
  storeid: number = 0
  companyid: number = 0;
  fromdate: string = ""
  todate: string = ""
  ptypes: any[] = []
  tablist: string[] = ["Phone Pe", "Card"]
  tabid: number = 0
  pos_report: { summary: any[], transactions: any[], showtransaxns: any[] } = { summary: [], transactions: [], showtransaxns: [] }
  portalTerm: string = ""
  dbTerm: string = ""
  rTabs: string[] = ["Raw", "Scanned"]
  rTabId: number = 0
  constructor(private xlsx: ExcelService, private auth: AuthService) { }

  ngOnInit(): void {
    setHeightWidth()
    this.initial()
  }

  initial() {
    this.auth.companyid.subscribe((companyid) => {
      console.log(companyid)
      this.companyid = companyid;
    });
    this.setDateRange();
  }

  setDateRange() {
    dtrangepicker('myrangepicker', (start: any, end: any) => {
      this.fromdate = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.todate = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      // (document.getElementById("typeahead-template") as HTMLElement).focus()
      console.log(this.fromdate, this.todate);
    })(moment(), moment());
  }

  getTransactionList() {
    this.auth.getstorepaymentsbytype(this.storeid, this.companyid, this.fromdate, this.todate).subscribe((data: any) => {
      this.pos_report = { summary: data["pos_summary"], transactions: data["pos_transactions"], showtransaxns: data["pos_transactions"].filter((x: any) => x.StorePaymentTypeId == data["pos_summary"][0].StorePaymentTypeId) }
      this.tablist[0] = "Phone Pe : " + this.pos_report.summary.filter(x => x.MachineId == "phonepe").map(x => x.Amount).reduce((a, c) => a + c, 0)
      this.tablist[1] = "Card : " + this.pos_report.summary.filter(x => x.MachineId == "card").map(x => x.Amount).reduce((a, c) => a + c, 0)
      this.posphonepe = new bzarray(this.pos_report.transactions.filter(x => x.MachineId == "phonepe"))
      this.posphonepestores = this.pos_report.summary.map(x => {
        return { Store: x.PhonePeName, StoreId: x.StoreId }
      }).filter((x, i) => i == this.pos_report.summary.findIndex(y => y.StoreId == x.StoreId))
      this.posphonepestores.unshift({ Store: "All", StoreId: 0 })
      this.posphonepestores["selected"] = 0
      this.posphonepe.filter("StoreId", this.posphonepestores["selected"], 0)

      this.poscard = new bzarray(this.pos_report.transactions.filter(x => x.MachineId == "card"))
      this.poscardstores = this.pos_report.summary.map(x => {
        return { Store: x.PhonePeName, StoreId: x.StoreId }
      }).filter((x, i) => i == this.pos_report.summary.findIndex(y => y.StoreId == x.StoreId))
      this.poscardstores.unshift({ Store: "All", StoreId: 0 })
      this.poscardstores["selected"] = 0
      this.poscard.filter("StoreId", this.poscardstores["selected"], 0)
    })
  }

  selectfile(files: FileList | null) {
    if (files && files.length > 0) {
      console.log(files)
      this.xlsx.toJSON(files[0], (arr: any[]) => {
        this.phonepe = new bzarray(arr)
        console.log(this.phonepe)
        this.phonepestores = this.phonepe.data.map((x: any) => x.Store).filter((x: any, i: number) => i == this.phonepe.data.findIndex(y => y.Store == x))
        this.phonepestores.unshift("All")
        console.log(this.phonepestores)
        this.phonepestores["selected"] = this.phonepestores[0]
        this.phonepe.filter("Store", this.phonepestores["selected"], "All")
      })
    }
  }
  scanned: any = { portal: { mapped: [], unmapped: [] }, db: { mapped: [], unmapped: [] } }
  drop(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer?.files.length > 0) {
      this.selectfile(e.dataTransfer.files)
    }
  }

  allowDrop(e: DragEvent) {
    e.preventDefault()
  }
  mapped: any[] = []
  unmapped: { portal: any[], db: any[] } = { portal: [], db: [] }
  scan() {
    this.mapped = []
    this.unmapped = { portal: [], db: [] }
    this.phonepe.sort((a, b) => a["TransactionStamp"] - b["TransactionStamp"])
    this.posphonepe.sort((a, b) => new Date(a["TransDateTime"]).getTime() - new Date(b["TransDateTime"]).getTime())
    console.log(this.posphonepe, this.phonepe)
    let relations: any[] = []
    let amounts: number[] = [...this.phonepe.filtered.map(x => x.Amount), ...this.posphonepe.filtered.map(x => x.Amount)]
    amounts = amounts.filter((x, i) => i == amounts.findIndex(y => y == x))

    this.phonepe.filtered.forEach((x, i) => {
      this.posphonepe.filtered.forEach((y, j) => {
        if (x.Amount == y.Amount) console.log("|" + x.Store + "|", "|" + y.PhonePeName + "|", x.Store == y.PhonePeName)
        if (x.Amount == y.Amount && x.Store.toLowerCase().trim() == y.PhonePeName.toLowerCase().trim()) {
          console.log(x.Store, y.PhonePeName)
          relations.push([x, y, x.Amount, +Math.abs(new Date(x.TransactionStamp).getTime() / 1000 - new Date(y.TransDateTime).getTime() / 1000).toFixed(0)])
        }
      })
    })
    console.log(relations)
    // relations.forEach(r => {
    //   console.log(r[2], r[0].TransactionId, r[1].ino, r[3])
    //   //   console.log(r[0].TransactionId, r[1].ino)
    //   //   console.log(r[0].Amount, r[0].Amount - r[1].Amount, Math.abs(new Date(r[0].TransactionStamp).getTime() / 1000 - new Date(r[1].TransDateTime).getTime() / 1000))
    // })

    amounts.forEach(a => {
      let a_rels = relations.filter(r => r[2] == a).sort((a, b) => a[3] - b[3])
      a_rels.forEach(ar => {
        if (!this.mapped.some(x => x[1].TransactionId === ar[1].TransactionId) && !this.mapped.some(x => x[0].TransactionId === ar[0].TransactionId)) {
          console.log(ar[0].TransactionId, ar[1].TransactionId)
          this.mapped.push(ar)
        }
      })
    })
    // console.log(this.mapped)
    // this.mapped.forEach(m => {
    //   console.log(m[2], m[0].TransactionId, m[1].ino, m[3])
    // })
    this.unmapped.portal = this.phonepe.filtered.filter(x => !this.mapped.some(y => y[0].TransactionId === x.TransactionId))
    this.unmapped.db = this.posphonepe.filtered.filter(x => !this.mapped.some(y => y[1].TransactionId === x.TransactionId))
    this.rTabId = 1
    // console.log(this.mapped)
    // console.log(this.unmapped)
    // this.phonepe.data.forEach(r => {
    //   let best_mach = relations.filter(x => x[0].TransactionId == r.TransactionId).sort((a,b) => a[2] - b[2])[0]
    //   console.log(r)
    //   console.log(best_mach)
    // })
    // this.phonepe.filtered.forEach(x => {
    //   let postransaxns = this.posphonepe.filtered.filter(y => y.Amount == x.Amount)
    //   console.log(x.TransactionId, x.Amount, x.TransactionDate)
    //   console.log(postransaxns)
    //   postransaxns.forEach((post, i) => {
    //     let timediff = new Date(x.TransactionStamp).getTime() - new Date(post.TransDateTime).getTime()
    //     console.log(i, timediff)
    //   })
    // })
  }
  selectfilecd(files: FileList | null) {
    if (files && files.length > 0) {
      console.log(files)
      this.xlsx.toJSON(files[0], (_arr: any[]) => {
        console.log(Object.keys(_arr[0]))
        let arr = _arr.map(x => {
          return { Transaction_ID: x["Transaction_ID"].replaceAll("'", ""), TransactionId: x["Order_ID"].replaceAll("'", ""), Store: "", TransactionDate: x["Transaction_Date"].replaceAll("'", ""), TransactionStamp: new Date(x["Transaction_Date"].replaceAll("'", "")).getTime(), Amount: x["Amount"] }
        })
        this.card = new bzarray(arr)
        console.log(this.card)
        this.cardstores = this.card.data.map((x: any) => x.Store).filter((x: any, i: number) => i == this.card.data.findIndex(y => y.Store == x))
        this.cardstores.unshift("All")
        console.log(this.cardstores)
        this.cardstores["selected"] = this.cardstores[0]
        this.card.filter("Store", this.cardstores["selected"], "All")
      })
    }
  }
  dropcd(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer?.files.length > 0) {
      this.selectfilecd(e.dataTransfer.files)
    }
  }

  allowDropcd(e: DragEvent) {
    e.preventDefault()
  }
  mappedcd: any[] = []
  unmappedcd: { portal: any[], db: any[] } = { portal: [], db: [] }
  scancd() {
    this.mappedcd = []
    this.unmappedcd = { portal: [], db: [] }
    this.card.sort((a, b) => a["TransactionStamp"] - b["TransactionStamp"])
    this.poscard.sort((a, b) => new Date(a["TransDateTime"]).getTime() - new Date(b["TransDateTime"]).getTime())
    console.log(this.poscard, this.card)
    let relations: any[] = []
    let amounts: number[] = [...this.card.filtered.map(x => x.Amount), ...this.poscard.filtered.map(x => x.Amount)]
    amounts = amounts.filter((x, i) => i == amounts.findIndex(y => y == x))

    this.card.filtered.forEach((x, i) => {
      this.poscard.filtered.forEach((y, j) => {
        if (x.Amount == y.Amount) console.log("|" + x.Store + "|", "|" + y.CardName + "|", x.Store == y.CardName)
        if (x.Amount == y.Amount && x.Store.toLowerCase().trim() == y.CardName.toLowerCase().trim()) {
          console.log(x.Store, y.CardName)
          relations.push([x, y, x.Amount, +Math.abs(new Date(x.TransactionStamp).getTime() / 1000 - new Date(y.TransDateTime).getTime() / 1000).toFixed(0)])
        }
      })
    })
    console.log(relations)
    // relations.forEach(r => {
    //   console.log(r[2], r[0].TransactionId, r[1].ino, r[3])
    //   //   console.log(r[0].TransactionId, r[1].ino)
    //   //   console.log(r[0].Amount, r[0].Amount - r[1].Amount, Math.abs(new Date(r[0].TransactionStamp).getTime() / 1000 - new Date(r[1].TransDateTime).getTime() / 1000))
    // })

    amounts.forEach(a => {
      let a_rels = relations.filter(r => r[2] == a).sort((a, b) => a[3] - b[3])
      a_rels.forEach(ar => {
        if (!this.mappedcd.some(x => x[1].TransactionId === ar[1].TransactionId) && !this.mappedcd.some(x => x[0].TransactionId === ar[0].TransactionId)) {
          console.log(ar[0].TransactionId, ar[1].TransactionId)
          this.mappedcd.push(ar)
        }
      })
    })
    // console.log(this.mappedcd)
    // this.mappedcd.forEach(m => {
    //   console.log(m[2], m[0].TransactionId, m[1].ino, m[3])
    // })
    this.unmappedcd.portal = this.card.filtered.filter(x => !this.mappedcd.some(y => y[0].TransactionId === x.TransactionId))
    this.unmappedcd.db = this.poscard.filtered.filter(x => !this.mappedcd.some(y => y[1].TransactionId === x.TransactionId))
    this.rTabId = 1
    // console.log(this.mappedcd)
    // console.log(this.unmappedcd)
    // this.card.data.forEach(r => {
    //   let best_mach = relations.filter(x => x[0].TransactionId == r.TransactionId).sort((a,b) => a[2] - b[2])[0]
    //   console.log(r)
    //   console.log(best_mach)
    // })
    // this.card.filtered.forEach(x => {
    //   let postransaxns = this.poscard.filtered.filter(y => y.Amount == x.Amount)
    //   console.log(x.TransactionId, x.Amount, x.TransactionDate)
    //   console.log(postransaxns)
    //   postransaxns.forEach((post, i) => {
    //     let timediff = new Date(x.TransactionStamp).getTime() - new Date(post.TransDateTime).getTime()
    //     console.log(i, timediff)
    //   })
    // })
  }
  clear(mode: string) {
    if (mode == "PHONEPE") {
      this.phonepe = new bzarray([])
    } else if (mode == "CARD") {
      this.card = new bzarray([])
    }
  }
}

class bzarray {
  data: any[] = []
  filtered: any[] = []
  constructor(data: any[]) {
    this.data = data
  }
  filter(field: string, value: any, allvalue: any) {
    this.filtered = this.data.filter(x => x[field] == value || value == allvalue)
  }
  sort(compareFn: (a: any, b: any) => number) {
    this.filtered = this.filtered.sort(compareFn)
  }
}