import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductsRoutingModule } from './products-routing.module';
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
import { DividerModule } from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
// search module
import { SharedModule } from 'src/app/shared/shared.module';
import { DigitalImportListingComponent } from './digital/digital-import-listing/digital-import-listing.component';


@NgModule({
  declarations: [DigitalListComponent, DigitalAddComponent, DigitalImportListingComponent ],
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
    InputSwitchModule,
    DividerModule,
    FileUploadModule,
    TooltipModule,
    TableModule
  ],
  exports: [],
  bootstrap: [],
  providers: [
    NgbActiveModal
  ]
})
export class ProductsModule { }
