import { Component, OnInit } from '@angular/core';
import { TableService } from 'src/app/shared/service/table.service';
import { DecimalPipe } from '@angular/common';
import { ApiService } from 'src/app/shared/service/api.service';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  providers: [TableService, DecimalPipe, MessageService],
})

export class OrdersComponent implements OnInit {
  // public closeResult: string;
  // public tableItem$: Observable<OrderDB[]>;
  // public searchText;
  // total$: Observable<number>;

  initLoading: boolean = false;
  ordersToShow: any;
  visible: boolean = false;
  visibleInfo: boolean = false;
  position: string = 'center';
  selectedOrder: any;

  trackingInfo: any = {
    trackingNumber: '',
    carrier: '',
  }

  status: any[] | undefined;
  carriers: any[] = [];
  selectedStatus: any = { name: 'select' };
  selectedCarrier: any = {};
  statusChanged: boolean = false;

  rangeDates: Date[] | undefined;

  constructor(public service: TableService, private apiService: ApiService, private messageService: MessageService) {
  }

  async ngOnInit() {
    this.initLoading = true;
    await this.loadData();
    this.initLoading = false;

    this.status = [
      { name: 'Awaiting shipment' },
      { name: 'In process' },
      { name: 'Shipped' },
      { name: 'Cancelled' }
    ];

    this.carriers = [
      {
        name: "United States Postal Service",
        abbreviation: "USPS",
        trackingUrl: "https://tools.usps.com/go/TrackConfirmAction?tLabels="
      },
      {
        name: "United Parcel Service",
        abbreviation: "UPS",
        trackingUrl: "https://www.ups.com/track?loc=en_US&tracknum="
      },
      {
        name: "Federal Express",
        abbreviation: "FedEx",
        trackingUrl: "https://www.fedex.com/fedextrack/?trknbr="
      },
      {
        name: "DHL Express",
        abbreviation: "DHL",
        trackingUrl: "https://www.dhl.com/en/express/tracking.html?AWB="
      },
      {
        name: "OnTrac",
        abbreviation: "OnTrac",
        trackingUrl: "https://www.ontrac.com/tracking.asp?tracking="
      },
      {
        name: "Amazon Logistics",
        abbreviation: "AMZL",
        trackingUrl: "https://track.amazon.com/tracking/"
      },
      {
        name: "LaserShip",
        abbreviation: "LS",
        trackingUrl: "https://www.lasership.com/track/"
      },
      {
        name: "GLS US",
        abbreviation: "GLS",
        trackingUrl: "https://gls-us.com/track?track="
      }
    ];

  }

  async loadData() {
    const result = await this.apiService.getAllOrdersMonth();
    const withProductImage = await Promise.all(result.data.map(async (order) => {
      const response = await this.apiService.getImageUrlFromSku(order.sku);
      order.product_img = response.data[0].img_url;
      return order;
    }));

    this.ordersToShow = this.builOrders(withProductImage);
  }

  async searchByPeriod() {
    if (this.rangeDates && this.rangeDates[1] !== null) {
      const startDate = this.rangeDates[0].toISOString().split('T')[0];
      const endDate = this.rangeDates[1].toISOString().split('T')[0];

      const result = await this.apiService.getAllOrdersByDate(startDate, endDate);
      const withProductImage = await Promise.all(result.data.map(async (order) => {
        const response = await this.apiService.getImageUrlFromSku(order.sku);
        order.product_img = response.data[0].img_url;
        return order;
      }));

      this.ordersToShow = this.builOrders(withProductImage);
    }
  }

  builOrders(unprocessedOrders: any[]): any[] {
    let orders = [];
    let i = -1;
    let order: any;

    if (unprocessedOrders.length > 0) {
      unprocessedOrders.forEach((item) => {
        if (item.site_order_id !== order?.site_order_id) {
          i += 1;
          order = {
            site_order_id: item.site_order_id,
            site_name: item.site_name,
            order_date: item.order_date,
            order_total: item.order_total,

            payment_id: item.payment_id,
            payment_type: item.payment_type,
            payment_date: item.payment_date,

            buyer: item.buyer,
            contact: item.contact,

            shipping_target_name: item.shipping_target_name,
            shipping_target_phone: item.shipping_target_phone,
            street_1: item.street_1,
            shipping_city: item.shipping_city,
            shipping_postal_code: item.shipping_postal_code,
            shipping_state_province: item.shipping_state_province,
            shipping_status: item.shipping_status,
            shipping_country: item.shipping_country,

            carrier: item.carrier,
            service_code: item.service_code,
            tracking_number: item.tracking_number,

            promotional_code: item.promotional_code,
            items: []
          }
          orders.push(order);
        }
        orders[i].items?.push({
          title: item.title,
          sku: item.sku,
          product_img: item.product_img,
          id_order: item.id,
          price: item.price,
          quantity: item.quantity,
          proportional: item.proportional,

        })
      });
    }
    return orders
  }

  showDialog(order: any, position: string) {
    this.selectedOrder = order;
    this.selectedStatus = this.selectedOrder.shipping_status;
    this.position = position;
    this.statusChanged = false;
    this.visible = true;
  }

  showDialogInfo(order: any) {
    this.selectedOrder = order;
    this.visibleInfo = true;

  }

  clear(table: Table) {
    table.clear();
    this.rangeDates = undefined;
    this.loadData();
  }

  // async saveStatusChange() {
  //   try {
  //     this.visible = false;
  //     let result;
  //     if (this.statusChanged) {
  //       if(this.selectedStatus == 'Shipped'){

  //       }else{
  //         result = await this.apiService.updateOrderStatus(this.selectedOrder.site_order_id, this.selectedStatus);
  //       }

  //       if (result.data.affectedRows > 0) {
  //         console.log('Estatus cambiado');
  //         this.loadData();
  //       }
  //     }

  //   } catch (error) {
  //     this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error', detail: `${error.error.msg}` });
  //   }

  // }

  async saveStatusChange() {
    try {
      if (!this.statusChanged) {
        return;
      }

      if (this.selectedStatus === 'Shipped') {
        // Validar campos requeridos para envío
        if (!this.trackingInfo.trackingNumber || !this.selectedCarrier) {
          this.messageService.add({
            key: 'bc',
            severity: 'warn',
            summary: 'Warning',
            detail: 'Tracking number and carrier are required for shipped status'
          });
          return;
        }

        // Si los campos están completos, actualizar status y tracking
        const result = await this.apiService.updateOrderStatus(
          this.selectedOrder.site_order_id,
          {
            shipping_status: this.selectedStatus,
            tracking_number: this.trackingInfo.trackingNumber,
            carrier: this.selectedCarrier
          }
        );

        if (result.data.affectedRows > 0) {
          console.log('Status and tracking info updated');
          this.visible = false;
          this.loadData();

          const trackingUrl = this.carriers.filter(car => car.abbreviation == this.selectedCarrier)[0].trackingUrl;
          const email = this.selectedOrder.contact;

          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
          if (emailRegex.test(email)) {
            const data = {
              email,
              orderId: this.selectedOrder.site_order_id,
              carrier: this.selectedCarrier,
              trackingNumber: this.trackingInfo.trackingNumber,
              url: trackingUrl + this.trackingInfo.trackingNumber
            };
            await this.apiService.sendShippingInformaction(data);
          }
          
        }
      } else {
        // Para otros estados, solo actualizar el status
        const result = await this.apiService.updateOrderStatus(
          this.selectedOrder.site_order_id,
          { shipping_status: this.selectedStatus }
        );

        if (result.data.affectedRows > 0) {
          console.log('Status updated');
          this.visible = false;
          this.loadData();
        }
      }
    } catch (error) {
      this.messageService.add({
        key: 'bc',
        severity: 'error',
        summary: 'Error',
        detail: `${error.error.msg}`
      });
    }
  }

  sumQuantity(items) {
    if (items)
      return items.reduce((subtotal, item) => subtotal + item.quantity, 0);
    return 0;
  }

  imgPayment(type: string): string {
    switch (type) {
      case 'link':
        return 'assets/images/stripe-link2.png';
      case 'card':
        return 'assets/images/stripe-cards2.png';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    let resultDate: string = '';
    if (date && date !== '') {
      const datePart1 = date.split('T')[0];
      const datePart2 = date.split('T')[1].split('.')[0];

      resultDate = datePart1 + ' ' + datePart2;
    }
    return resultDate;
  }

}
