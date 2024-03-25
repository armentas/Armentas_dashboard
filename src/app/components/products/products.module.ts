import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductsRoutingModule } from './products-routing.module';
import { DigitalCollectionComponent } from './digital/digital-collection/digital-collection.component';
import { DigitalListComponent } from './digital/digital-list/digital-list.component';
import { DigitalAddComponent } from './digital/digital-add/digital-add.component';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import 'hammerjs';
import 'mousetrap';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ChipsModule } from 'primeng/chips';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
// search module
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [DigitalCollectionComponent, DigitalListComponent, DigitalAddComponent ],
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductsRoutingModule,
    NgbModule,
    GalleryModule,
    CKEditorModule,
    NgxDropzoneModule,
    ChipsModule,
    SharedModule,
    ToastModule,
    ProgressBarModule,
    ButtonModule,
    TableModule
  ],
  exports: [],
  bootstrap: [],
  providers: [
    NgbActiveModal
  ]
})
export class ProductsModule { }
