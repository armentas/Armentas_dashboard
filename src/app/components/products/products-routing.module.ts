import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DigitalCollectionComponent } from './digital/digital-collection/digital-collection.component';
import { DigitalListComponent } from './digital/digital-list/digital-list.component';
import { DigitalAddComponent } from './digital/digital-add/digital-add.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'digital/digital-collection',
        component: DigitalCollectionComponent,
        data: {
          title: "Collection",
          breadcrumb: "Collection"
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
