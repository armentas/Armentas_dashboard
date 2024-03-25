import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


// import { Ng2SmartTableModule } from 'ng2-smart-table';
import { UsersRoutingModule } from './users-routing.module';
import { ListUserComponent } from './list-user/list-user.component';
import { CreateUserComponent } from './create-user/create-user.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChipsModule } from 'primeng/chips';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
// search module
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ListUserComponent, CreateUserComponent],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    UsersRoutingModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    ChipsModule,
    TableModule
  ]
})
export class UsersModule { }
