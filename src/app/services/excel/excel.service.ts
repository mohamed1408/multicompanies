import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root' 
})
export class ExcelService {


  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    worksheet.s = { // styling for all cells
        font: {
            name: "arial"
        },
        alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: '1', // any truthy value here
        },
        border: {
            right: {
                style: "thin",
                color: "000000"
            },
            left: {
                style: "thin",
                color: "000000"
            },
        }
    }
    // worksheet["A1"].s = { fill: { fgColor: { type: 'pattern', pattern: 'solid',rgb: "FFC000" } } }
    // worksheet["A2"].s = { fill: { fgColor: { type: 'pattern', pattern: 'solid',rgb: "70AD47" } } }
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
