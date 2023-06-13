export class DenomEntry {
    Id: number
    EntryDateTime: string | null
    UserId: number
    StoreId: number
    CompanyId: number
    EditedForId: number | null
    Entries: Array<Entry>
    TotalAmount: number
    OpeningBalance!: number
    CashIn!: number
    CashOut!: number
    ExpectedBalance!: number
    CashInJson!: string
    CashOutJson!: string
    TransactionJson!: string
    SalesCash: number
    EntryTypeId: number | null
    constructor(loginfo: any, editforid: number | null) {
        this.Id = 0
        this.EntryDateTime = null
        this.UserId = loginfo.Id
        this.StoreId = loginfo.StoreId
        this.CompanyId = loginfo.CompanyId
        this.EditedForId = editforid
        this.TotalAmount = 0
        this.SalesCash = 0
        this.Entries = []
        this.EntryTypeId = null
    }
}

export class Entry {
    Id: number
    DenomName: string
    Count: number | null
    Amount: number | null
    DenomEntryId: number | null
    constructor(denomination: any) {
        this.Id = 0
        this.DenomName = denomination
        this.Count = null
        this.Amount = null
        this.DenomEntryId = null
    }
}
