import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  base_url1 = 'https://localhost:44383/';
  base_url = 'https://biz1pos.azurewebsites.net/';
  base_urlc = 'https://biz1posapi-rv7.conveyor.cloud/';

  hubconnection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.base_url + 'uphub')
    .withAutomaticReconnect([0, 1000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();
  CompanyId: any;
  StoreId: any;
  hubRoom: any;
  isconnected: boolean = false;
  logInfo: any;
  shouldConnect: boolean = true;
  notificationobj = {};
  orders = [];
  autoaccepttime!: number;
  foodpreptime!: number;
  bot: any;

  constructor() {
    this.hubconnection.on(
      'DeliveryOrderUpdate',
      (fromstoreid, tostoreid, invoiceno) => {
        if (invoiceno.includes('WO')) {
          console.log('DeliveryOrderUpdate', fromstoreid, tostoreid, invoiceno);
        }
      }
    );

    this.hubconnection.on('OrderUpdate', (orderid, storeid) => {
      // console.log('OrderUpdate', orderid, storeid)
    });

    this.hubconnection.on('DeliveryOrderUpdate', (orderid, storeid) => {
      // console.log('OrderUpdate', orderid, storeid)
    });

    this.hubconnection.on('NewOrder', (platfor, orderid) => {
      // console.log('NewOrder', platfor, orderid)
    });

    this.hubconnection.onreconnecting((err) => {
      console.log('<😱>', err);
    });

    this.hubconnection.onreconnected((connectionid) => {
      console.log(connectionid);
    });
  }

  connect() {
    this.hubconnection
      .start()
      .then(() => {
        console.log('Connection started! <😎>');
        this.isconnected = true;
      })
      .catch((err) => {
        setTimeout(() => {
          this.connect();
          console.log(err);
        }, 2000);
      });
  }
}
