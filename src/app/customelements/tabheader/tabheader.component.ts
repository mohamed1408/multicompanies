import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'bz-tab-header',
  templateUrl: './tabheader.component.html',
  styleUrls: ['./tabheader.component.css']
})
export class TabheaderComponent implements OnInit, AfterViewInit {

  @Input() tablist: string[] = [];
  @Input() selectedI: number = 0;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  selector!: HTMLElement
  constructor() { }

  ngOnInit(): void {

  }
  ngAfterViewInit(){
    let ftab = (document.getElementsByClassName('tab-header')[this.selectedI] as HTMLElement)
    this.selector = (document.getElementById('bz-selector') as HTMLElement)
    this.selector.style.width = ftab.offsetWidth + 'px'
    this.selector.style.height = ftab.offsetHeight + 'px'
  }
  selecttab(index: number) {
    let left = 0
    this.tablist.slice(0, index + 1).forEach((th, i) => {
      let tab = document.getElementsByClassName('tab-header').item(i) as HTMLElement
      if (i == index) {
        this.selectedI = index
        this.selector.style.transform = `translate3d(${left}px, 0px, 0px)`
        this.selector.style.width = tab.offsetWidth + 'px'
        this.onChange.emit([this.selectedI])
      }
      left += tab.offsetWidth
    })
  }
}
