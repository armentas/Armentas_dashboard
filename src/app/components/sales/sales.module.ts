import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesRoutingModule } from './sales-routing.module';
import { OrdersComponent } from './orders/orders.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';

@NgModule({

  declarations: [OrdersComponent],
  imports: [
    CommonModule,
    SalesRoutingModule,
    NgbModule,
    FormsModule,
    SharedModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    CalendarModule
    
  ]
})
export class SalesModule { }
