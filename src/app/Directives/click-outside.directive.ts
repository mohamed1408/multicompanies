import {
  Directive,
  ElementRef,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[clickedOutside]',
})
export class ClickOutsideDirective {
  // @Output()
  // outsideClick: EventEmitter<MouseEvent> = new EventEmitter();

  // @HostListener('document:mousedown', ['$event'])
  // onClick(event: MouseEvent): void {
  //   console.log(event)
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     this.outsideClick.emit(event);
  //   }
  // }

  // constructor(private elementRef: ElementRef) { }
  constructor(private _elementRef: ElementRef) {}

  @Output()
  public clickedOutside = new EventEmitter<MouseEvent>();

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }
    console.log(targetElement, event.target, this._elementRef.nativeElement.children)
    const clickedInside =
      this._elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      console.log("clicked outside from directive")
      this.clickedOutside.emit(event);
    }
  }
}