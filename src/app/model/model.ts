export class Transaction {
    Id: number
    Amount: number
    OrderId: number
    CustomerId?: number
    PaymentTypeId: number
    StorePaymentTypeId: number
    TranstypeId: number
    PaymentStatusId: number
    TransDateTime: string
    TransDate: string
    UserId?: number
    CompanyId: number
    StoreId: number
    Notes: string
    Remaining: number
    InvoiceNo: string
    StorePaymentTypeName: string
    saved: boolean = false
    BillAmount: number
    PaidAmount: number
    total: number = 0
    invalid: boolean

    constructor(comapnyid: number, storeid: number, orderid: number) {
        this.Id = 0
        this.Amount = 0
        this.OrderId = orderid
        this.PaymentTypeId = 6
        this.Notes = ''
        this.InvoiceNo = ''
        this.StorePaymentTypeName = ''
        this.TranstypeId = 1;
        this.PaymentStatusId = 1;
        this.TransDate = ""
        this.TransDateTime = ""
        this.CompanyId = comapnyid
        this.StoreId = storeid
        this.Remaining = 0
        this.BillAmount = 0
        this.PaidAmount = 0
        this.invalid = false
        this.StorePaymentTypeId = 0
        this.validate()
    }

    validate() {
        this.invalid = (this.Amount == 0) || (this.Remaining < 0) || (this.StorePaymentTypeId == 0)
    }

    setamt(amt: number) {
        this.Amount = amt
        this.Remaining = this.total - amt
        this.validate()
    }

    setptype(id: number) {
        if(this.StorePaymentTypeId == id) {
            this.setamt(this.total)
        } else {
            this.StorePaymentTypeId = id
        }
        this.validate()
    }
}
