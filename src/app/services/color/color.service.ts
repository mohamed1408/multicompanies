import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  statusColors = (id: number) => {
    switch (id) {
      case 1:
        return '#ffc107'
      case 2:
        return '#ffc107'
      case 3:
        return '#ffc107'
      case 4:
        return '#ffc107'
      case 5:
        return '#28a745'
      case -1:
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }
}
