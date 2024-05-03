import { Component, OnInit } from '@angular/core';
import * as chartData from '../../shared/data/chart';
import { ApiService } from 'src/app/shared/service/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  ordersTable;
  totalSalesData: number[] = [];
  totalSales: number;
  totalOrdersData: number[] = [];
  totalOrders: number;
  soldProductsData: number[] = [];
  soldProducts: number;
  cancellationsData: number[] = [];
  cancellations: number;
  differences: any;

  monthSales: number[] = [];
  annualSales: number[] = [];

  doughnutChartData: { name: string, value: number, color: string }[] = [];
  pieChartData: { name: string, value: number, color: string }[] = [];

  constructor(private apiService: ApiService) { }

  // smalllineChart1 (Total Sales)
  public smallLineChartData?: any;
  public smallLineChartLabels?: any;
  public smallLineChartOptions = chartData.smallLineChartOptions;
  public smallLineChartLegend = chartData.smallLineChartLegend;
  public smallLineChartType = chartData.smallLineChartType;

  // smalllineChart2 (Total orders)
  public smallLine2ChartData?: any;
  public smallLine2ChartLabels?: any;
  public smallLine2ChartOptions = chartData.smallLine2ChartOptions;
  public smallLine2ChartLegend = chartData.smallLine2ChartLegend;
  public smallLine2ChartType = chartData.smallLine2ChartType;

  // smalllineChart3 (New Products)
  public smallLine3ChartData?: any;
  public smallLine3ChartLabels?: any;
  public smallLine3ChartOptions = chartData.smallLine3ChartOptions;
  public smallLine3ChartLegend = chartData.smallLine3ChartLegend;
  public smallLine3ChartType = chartData.smallLine3ChartType;

  // smalllineChart4 (Cancellations)
  public smallLine4ChartData?: any;
  public smallLine4ChartLabels?: any;
  public smallLine4ChartOptions = chartData.smallLine4ChartOptions;
  public smallLine4ChartColors = chartData.smallLine4ChartColors;
  public smallLine4ChartLegend = chartData.smallLine4ChartLegend;
  public smallLine4ChartType = chartData.smallLine4ChartType;

  // lineChart (Month Sales)
  public chart5?: any;

  // doughnut chart
  public view = chartData.view;
  public doughnutData?: any;
  public doughnutChartColorScheme: any;
  public doughnutChartShowLegend: boolean = false;
  public doughnutChartLegendPosition: string = 'below';
  public doughnutChartShowLabels = chartData.doughnutChartShowLabels;
  public doughnutChartGradient = chartData.doughnutChartGradient;
  public doughnutChartTooltip = chartData.doughnutChartTooltip;

  // pie chart
  public pieData?: any;
  public pieChartColorScheme: any;

  // Bar chart (Annual Sales)
  public chart3?: any;

  monthDays: number[] = Array.from({ length: new Date().getDate() }, (_, index) => index + 1);

  // events
  public chartClicked(e: any): void {
  }
  public chartHovered(e: any): void {
  }

  async ngOnInit() {
    await this.loadData();

    this.smallLineChartData = [{ data: this.totalSalesData }];
    this.smallLine2ChartData = [{ data: this.totalOrdersData }];
    this.smallLine3ChartData = [{ data: this.soldProductsData }];
    this.smallLine4ChartData = [{ data: this.cancellationsData }];
    this.smallLineChartLabels = new Array(new Date().getDate()).fill(0);
    this.smallLine2ChartLabels = new Array(new Date().getDate()).fill(0);
    this.smallLine3ChartLabels = new Array(new Date().getDate()).fill(0);
    this.smallLine4ChartLabels = new Array(new Date().getDate()).fill(0);

    this.chart5 = {
      type: 'Line',
      data: {
        series: [this.totalSalesData],
        labels: this.monthDays
      },
      options: {
        height: 335,
        showArea: true,
        seriesBarDistance: 12,
        axisX: {
          showGrid: false,
          labelInterpolationFnc: function (value) {
            return value;
          }
        }
      },
    };

    this.chart3 = {
      type: 'Bar',
      data: {
        series: [this.annualSales],
        labels: ['Jan', 'Feb ', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Sep', 'Oct', 'Nov', 'Dic'],
      },
      options: {
        // height: 400,
        seriesBarDistance: 12,
        axisX: {
          showGrid: false,
          labelInterpolationFnc: function (value) {
            return value;
          }
        }
      },
    };

    this.doughnutData = this.doughnutChartData;
    this.doughnutChartColorScheme = {
      domain: this.doughnutChartData.map(elem => elem.color),
    }

    this.pieData = this.pieChartData;
    this.pieChartColorScheme = {
      domain: this.pieChartData.map(elem => elem.color),
    }


  }

  async loadData() {
    const previousMonthOrders = await this.apiService.getAllOrdersPreviousMonth();  
    let previousOrders = this.builOrders(previousMonthOrders.data);

    const monthOrders = await this.apiService.getAllOrdersMonth();
    let orders = this.builOrders(monthOrders.data);
    this.ordersTable = orders.slice(0, 5);

    this.differences = this.calculateDiff(previousOrders, orders);

    this.getBestSellingProducts(monthOrders.data);
    this.getTotalSalesDataArray(orders);
    this.getTotalOrdersDataArray(orders);
    this.getSoldProductsDataArray(orders);
    this.getCancellationsDataArray(orders);
    this.getShippingStatesCount(orders);

    const yearOrders = await this.apiService.getAllOrdersYear();
    // const filteredYearOrders = yearOrders.data.filter(elem => {
    //   return elem.shipping_status.toLowerCase() !== 'cancelled'
    // });

    let allOrders = this.builOrders(yearOrders.data);
    this.getTotalOrdersYearDataArray(allOrders);

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
          id_order: item.id,
          price: item.price,
          quantity: item.quantity,
          proportional: item.proportional,

        })
      });
    }
    return orders
  }

  getTotalSalesDataArray(orders: any) {
    const currentDay = new Date().getDate();
    const salesData = new Array(currentDay).fill(0);

    orders.forEach(order => {     
      if (order.shipping_status.toLowerCase() !== 'cancelled') {
        const orderDate = new Date(order.order_date);
        const dayOfMonth = orderDate.getDate();
        const index = dayOfMonth - 1; // Índice basado en cero
        salesData[index] += order.order_total;
      }
    });    

    this.totalSalesData = salesData;
    this.totalSales = salesData.reduce((total, item) => {
      return total + item;
    }, 0);
  }

  getTotalOrdersDataArray(orders: any) {
    const currentDay = new Date().getDate();
    const ordersData = new Array(currentDay).fill(0);

    orders.forEach(order => {
      if (order.shipping_status.toLowerCase() !== 'cancelled') {
        const orderDate = new Date(order.order_date);
        const dayOfMonth = orderDate.getDate();
        const index = dayOfMonth - 1; // Índice basado en cero
        ordersData[index]++;
      }
    });

    this.totalOrdersData = ordersData;
    this.totalOrders = orders.length;
  }

  getSoldProductsDataArray(orders: any) {
    const currentDay = new Date().getDate();
    const soldProductsData = new Array(currentDay).fill(0);

    orders.forEach(order => {
      if (order.shipping_status.toLowerCase() !== 'cancelled') {
        order.items.forEach(item => {
          const orderDate = new Date(order.order_date);
          const dayOfMonth = orderDate.getDate();
          const index = dayOfMonth - 1;
          soldProductsData[index] += item.quantity;
        });
      }
    });

    this.soldProductsData = soldProductsData;
    this.soldProducts = soldProductsData.reduce((total, item) => {
      return total + item;
    }, 0);
  }

  getCancellationsDataArray(orders: any) {
    const currentDay = new Date().getDate();
    const cancelledOrdersData = new Array(currentDay).fill(0);

    orders.forEach(order => {
      if (order.shipping_status.toLowerCase() === "cancelled") {
        const orderDate = new Date(order.order_date);
        const dayOfMonth = orderDate.getDate();
        const index = dayOfMonth - 1; // Índice basado en cero
        cancelledOrdersData[index]++;
      }
    });

    this.cancellationsData = cancelledOrdersData;
    this.cancellations = cancelledOrdersData.reduce((total, item) => {
      return total + item;
    }, 0);
  }

  getTotalOrdersYearDataArray(orders: any) {
    const currentMonth = new Date().getMonth() + 1;
    const ordersData = new Array(currentMonth).fill(0);

    orders.forEach(order => {
      if (order.shipping_status.toLowerCase() !== 'cancelled') {
        const orderDate = new Date(order.order_date);
        const monthOfYear = orderDate.getMonth() + 1; // Agregamos 1 para hacerlo base 1
        ordersData[monthOfYear - 1]++; // Restamos 1 para hacerlo base 0
      }
    });

    this.annualSales = ordersData;
  }

  getShippingStatesCount(orders: any[]) {
    const statesCount = {};

    orders.forEach(order => {
      if (order.shipping_status.toLowerCase() !== 'cancelled') {
        const state = order.shipping_state_province;
        if (statesCount[state]) {
          statesCount[state]++;
        } else {
          statesCount[state] = 1;
        }
      }
    });

    const statesList = Object.keys(statesCount).map(state => ({
      name: state,
      value: statesCount[state],
      color: '#' + ('00000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
    }));

    statesList.sort((a, b) => b.value - a.value);
    this.doughnutChartData = statesList.slice(0, 5);
  }

  getBestSellingProducts(orders: any[]) {
    const productsCount = {};

    orders.forEach(order => {
      if (order.shipping_status.toLowerCase() !== 'cancelled') {
        const sku = order.sku;
        if (productsCount[sku]) {
          productsCount[sku]++;
        } else {
          productsCount[sku] = 1;
        }
      }
    });

    const topSellingProducts = Object.keys(productsCount).map(sku => ({
      name: orders.find(order => order.sku === sku).title,
      value: productsCount[sku],
      color: '#' + ('00000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
    }));

    // Ordenar la lista por valor descendente (cantidad de ventas)
    topSellingProducts.sort((a, b) => b.value - a.value);
    this.pieChartData = topSellingProducts.slice(0, 5);
  }

  calculateDiff(prevOrders: any[], currOrders: any[]): any {
    const prevSales = prevOrders.reduce((total, item) => {
      return item.shipping_status.toLowerCase() !== 'cancelled' ? total + item.order_total : total;
    }, 0);
    const currSales = currOrders.reduce((total, item) => {
      return item.shipping_status.toLowerCase() !== 'cancelled' ? total + item.order_total : total;
    }, 0);

    const prevProductsAmount = prevOrders.reduce((total, item) => {
      return item.shipping_status.toLowerCase() !== 'cancelled' ? total + this.sumQuantity(item.items) : total;
    }, 0);
    const currProductsAmount = currOrders.reduce((total, item) => {
      return item.shipping_status.toLowerCase() !== 'cancelled' ? total + this.sumQuantity(item.items) : total;
    }, 0);

    const prevCancelledOrder = prevOrders.reduce((total, item) => {
      return item.shipping_status.toLowerCase() === 'cancelled' ? total + 1 : total;
    }, 0);
    const currCancelledOrders = currOrders.reduce((total, item) => {
      return item.shipping_status.toLowerCase() === 'cancelled' ? total + 1 : total;
    }, 0);

    return {
      salesDiff: parseFloat((currSales - prevSales).toFixed(2)),
      ordersDiff: currOrders.length - prevOrders.length,
      productsDiff: currProductsAmount - prevProductsAmount,
      cancellationsDiff: currCancelledOrders - prevCancelledOrder,
    }
  }

  sumQuantity(items) {
    return items.reduce((subtotal, item) => subtotal + item.quantity, 0);
  }

  isZerosList(list: number[]): boolean{
    if(list){
      const result = list.reduce((total, valor) => total + valor, 0);
      if(result === 0)
        return true;
    }
    return false;
  }

}
