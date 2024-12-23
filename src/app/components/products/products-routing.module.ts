import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DigitalImportListingComponent } from './digital/digital-import-listing/digital-import-listing.component';
import { DigitalListComponent } from './digital/digital-list/digital-list.component';
import { DigitalAddComponent } from './digital/digital-add/digital-add.component';
import { CollectionsComponent } from './digital/collections/collections.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'digital/digital-import-listing',
        component: DigitalImportListingComponent,
        data: {
          title: "Import Listing",
          breadcrumb: "Import Listing"
        }
      },
      {
        path: 'digital/digital-product-list',
        component: DigitalListComponent,
        data: {
          title: "Product List",
          breadcrumb: "Product List"
        }
      },
      {
        path: 'digital/digital-add-product',
        component: DigitalAddComponent,
        data: {
          title: "Add Products",
          breadcrumb: "Add Product"
        }
      },
      {
        path: 'digital/collections',
        component: CollectionsComponent,
        data: {
          title: "Settings",
          breadcrumb: "Settings"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
