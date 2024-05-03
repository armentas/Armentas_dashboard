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

  ordersToShow: any;
  visible: boolean = false;
  visibleInfo: boolean = false;
  position: string = 'center';
  selectedOrder: any;

  status: any[] | undefined;
  selectedStatus: any = { name: 'select' };
  statusChanged: boolean = false;

  rangeDates: Date[] | undefined;

  constructor(public service: TableService, private apiService: ApiService, private messageService: MessageService) {
  }

  async ngOnInit() {
    await this.loadData();

    this.status = [
      { name: 'Awaiting shipment' },
      { name: 'In process' },
      { name: 'Delivered' },
      { name: 'Cancelled' }
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

  async searchByPeriod(){
    if(this.rangeDates && this.rangeDates[1] !== null){
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
            phone: item.phone,

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

  async saveStatusChange() {
    try {
      this.visible = false;

      if (this.statusChanged) {
        const result = await this.apiService.updateOrderStatus(this.selectedOrder.site_order_id, this.selectedStatus);
        
        if (result.data.affectedRows > 0) {
          console.log('Estatus cambiado');
          this.loadData();
        }
      }

    } catch (error) {
      this.messageService.add({ key: 'bc', severity: 'error', summary: 'Error', detail: `${error.error.msg}` });
    }

  }

  sumQuantity(items) {
    if(items)
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
