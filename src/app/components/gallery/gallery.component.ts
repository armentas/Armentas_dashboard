import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { SortEvent } from 'src/app/shared/directives/shorting.directive';
import { NgbdSortableHeader } from "src/app/shared/directives/NgbdSortableHeader";
import { TableService } from 'src/app/shared/service/table.service';
import { Observable } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { ApiService } from 'src/app/shared/service/api.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  providers: [TableService, DecimalPipe, MessageService],
})
export class GalleryComponent {

  public closeResult: string;
  public imagesList: any[] = [];
  public productList: any[] = [];
  visible: boolean = false;
  itemSaved: boolean = false;
  imageSelected: number;

  modelType: string = "add"
  modelTitle: string = "Add & link image";
  imageData: any = {};

  images!: any[];
  products!: any[];
  selectedProduct!: any;
  selectedImages!: any;
  selectedImageDetail!: any;

  constructor(
    public apiService: ApiService,
    private modalService: NgbModal,
    private messageService: MessageService,
  ) { }

  async ngOnInit() {
    await this.loadImages();
    // this.images = this.imagesList;
    await this.loadProducts();
    // this.products = this.productList;
    console.log(this.images);
    console.log(this.products);
  }

  async loadImages() {
    const images = await this.getAllImages();
    this.images = images.data;    
     
  }


  async loadProducts() {
    const products = await this.apiService.getAllProductsByVariants();
  
    // Utilizar un mapa para almacenar objetos únicos por productId
    const uniqueProductsMap = products.data.reduce((map, elem) => {
      const productId = elem.productId;
  
      // Si aún no existe un objeto para este productId, agrégalo al mapa
      if (!map.has(productId)) {
        map.set(productId, { productId, title: elem.title, collection: elem.collection, imagesUrl: elem.imagesUrl.split(',') });
      }
  
      return map;
    }, new Map<string, { productId: string, title: string, collection: string, imagesUrl: string[] }>());
  
    // Extraer los valores del mapa para obtener un arreglo de objetos únicos
    this.products = Array.from(uniqueProductsMap.values());

  }

  async getAllImages() {
    return await this.apiService.getAllImagesGallery();
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  async open(content, id: number) {
    if(id !== 0){
      this.modelType = "update";
      this.modelTitle = "Update image"; 
      this.imageSelected = id
      try {
        const result = await this.apiService.getImageGallery(id);

        this.imageData.img_url = result.data[0].img_url;
        
        
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
      }

    }else{
      this.modelType = "add";
    } 

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.resetValues();

      if (this.itemSaved)
        this.reload();
    });
  }

  async openDetails(details, image) {

    const productLinked = this.products.find(prod => prod.productId == image.products_id);
    this.selectedImageDetail = { ...image, prodTitle: productLinked.title, prodImages: productLinked.imagesUrl};

    console.log(this.selectedImageDetail);
    

    this.modalService.open(details, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.resetValues();
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  async addImage() {
    if(this.selectedProduct){
      this.imageData.collection = this.selectedProduct.collection;
      this.imageData.products_id = this.selectedProduct.productId;
    }

    console.log(this.imageData);
    if (this.modelType === "add") {
      const requiredProperties = ['img_url', 'collection', 'products_id'];
      const missingProperties = requiredProperties.filter(prop => !this.imageData[prop]);

      if (missingProperties.length > 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Por favor, complete los siguientes campos obligatorios: ${missingProperties.join(', ')}` });
        return;
      }

      try {
        const result = await this.apiService.addImageGallery(this.imageData);
        if (result.data.insertId !== 0) {
          this.messageService.add({ severity: 'success', summary: 'Imagen guardada', detail: `Se registro una nueva imagen con ID: ${result.data.insertId}` });
          this.itemSaved = true;
        }
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
      }
    } else {
    //   try {
    //     this.collectionData.img_url = this.collectionData.img_url.replace(/dl=0/g, 'dl=1');
    //     const result = await this.apiService.updateCollection(this.collectionSelected, this.collectionData);        
    //     if (result.data.affectedRows !== 0) {
    //       this.messageService.add({ severity: 'success', summary: 'Colleccion editada', detail: `Se actualizo la Coleccion con ID: ${this.collectionSelected}` });
    //       this.itemSaved = true;
    //     }
    //   } catch (error) {
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    //   }
    }
  }


  updateImageText() {
    this.imageData.img_url = this.imageData.img_url.replace(/dl=0/g, 'dl=1');
  }

  showConfirm(id: number) {
    this.imageSelected = id;
    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'warn', summary: `You are about to delete this image, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  async onConfirm() {
    try {
      const result = await this.apiService.deleteImageGallery(this.imageSelected);
      console.log(result);

      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Imagen eliminada', detail: `Se elimino la imagen correctamente` });
        this.messageService.clear('confirm');
        this.visible = false;

        setTimeout(() => {
          this.reload();
        }, 1000);
      }
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  onReject() {
    this.messageService.clear('confirm');
    this.visible = false;
  }

  resetValues(){
    this.imageSelected = 0;
    this.modelType = "add";
    this.modelTitle = "Add & link image";
    this.imageData = {}; 
    this.selectedImageDetail = {};
  }

  reload() {
    // window.location.reload();
    this.loadImages();
  }

}
