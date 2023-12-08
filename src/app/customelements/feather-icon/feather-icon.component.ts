import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var feather: any;

@Component({
  selector: 'feather-icon',
  templateUrl: './feather-icon.component.html',
  styleUrls: ['./feather-icon.component.css']
})
export class FeatherIconComponent implements OnInit, AfterViewInit {
  @Input() name: string = "";

  icon: SafeHtml = ""

  constructor(private sanitizer: DomSanitizer) {
    console.log(this.name)
    this.icon = sanitizer.bypassSecurityTrustHtml(`<i data-feather="copy"></i>`)
  }

  ngAfterViewInit(): void {
    feather.replace()
  }

  ngOnInit(): void {
  }

}
