import { SafeUrl } from "@angular/platform-browser"

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

export class Message {
    MessageId: number;
    MsgTransType: number;
    MessageType: number;
    RecieverStatus: number;
    Content: string;
    ImgId: number | null;
    StoreId: number;
    UserId: number | null;
    MessageDate: string;
    MessageDateTime: string;
    ImgUrl: string | null
    imgurl: SafeUrl | undefined
    constructor(private message: any = null) {
        if (message != null) {
            this.MessageId = message.MessageId;
            this.MsgTransType = message.MsgTransType;
            this.MessageType = message.MessageType;
            this.RecieverStatus = message.RecieverStatus;
            this.Content = message.Content;
            this.ImgId = message.ImgId;
            this.StoreId = message.StoreId;
            this.UserId = message.UserId;
            this.MessageDate = message.MessageDate;
            this.MessageDateTime = message.MessageDateTime;
            this.ImgUrl = message.ImgUrl
        } else {
            this.MessageId = 0;
            this.MsgTransType = 1;
            this.MessageType = 1;
            this.RecieverStatus = 0;
            this.Content = "";
            this.ImgId = null;
            this.StoreId = 0;
            this.UserId = null;
            this.MessageDate = '';
            this.MessageDateTime = '';
            this.ImgUrl = null
        }
    }
}