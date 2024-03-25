import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GalleryComponent } from './gallery.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'image-list',
        component: GalleryComponent,
        data: {
          title: "Gallery",
          breadcrumb: "Gallery"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GalleryRoutingModule { }