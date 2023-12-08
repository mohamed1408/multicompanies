import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.css']
})
export class PreloaderComponent implements OnInit, OnDestroy {
  @Output() onUnlock: EventEmitter<any> = new EventEmitter();
  
  keycode: string = 'sorrymaintenanceare';
  keyarr: Array<string> = [];
  
  constructor() { }

  ngOnInit(): void {
    console.log('Custom element initialized');
  }

  ngOnDestroy() {
    console.log('Custom element destroyed');
  }

  unlockpagr(key: string) {
    this.keyarr = [...this.keyarr, key];
    if (this.keyarr.length == 3) {
      if (this.keyarr.join('') == this.keycode) {
        this.onUnlock.emit()
      }
      this.keyarr = []
    }
  }

}
