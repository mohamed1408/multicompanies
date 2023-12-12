import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'remark'
})
export class DenomPipe implements PipeTransform {

  transform(value: number): SafeHtml {
    let _class = (value > 0) ? 'text-warning' : (value < 0) ? 'text-danger' : 'text-success'
    let html = `<span class="${_class}">${(value > 0) ? 'EXCESS' : (value < 0) ? 'SHORT' : 'TALLIED'}</span>`
    return html;
  }

}
