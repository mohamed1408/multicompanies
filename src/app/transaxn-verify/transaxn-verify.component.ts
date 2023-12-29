import { Component, OnInit } from '@angular/core';
import { ExcelService } from '../services/excel/excel.service';

declare function setHeightWidth(): any;

@Component({
  selector: 'app-transaxn-verify',
  templateUrl: './transaxn-verify.component.html',
  styleUrls: ['./transaxn-verify.component.css']
})
export class TransaxnVerifyComponent implements OnInit {

  constructor(private xlsx: ExcelService) { }

  ngOnInit(): void {
    setHeightWidth()
  }

  selectfile(files: FileList | null) {
    if (files && files.length > 0) {
      console.log(files)
      console.log(this.xlsx.toJSON(files[0]))
    }
  }

  drop(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer?.files.length > 0) {
      this.selectfile(e.dataTransfer.files)
    }
  }

  allowDrop(e: DragEvent) {
    e.preventDefault()
  }
}
