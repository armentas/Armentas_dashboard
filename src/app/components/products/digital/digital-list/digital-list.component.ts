import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SortEvent } from 'src/app/shared/directives/shorting.directive';
import { NgbdSortableHeader } from "src/app/shared/directives/NgbdSortableHeader";
import { TableService } from 'src/app/shared/service/table.service';
import { ApiService } from 'src/app/shared/service/api.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-digital-list',
  templateUrl: './digital-list.component.html',
  styleUrls: ['./digital-list.component.scss'],
  providers: [TableService, DecimalPipe, MessageService],
})
export class DigitalListComponent implements OnInit {

  public closeResult: string;
  visible: boolean = false;
  public productList: any[] = [];
  types: any[] = [];
  categories: any[] = [];
  productData: any = {};
  tags: string[] | undefined;

  products!: any[];
  selectedProducts: any[] = [];
  itemSaved: boolean = false;
  onSale: string = "true";
  checked: boolean = false;

  first = 0;
  rows = 10;

  variantSelected: number;
  productSelected: number;
  imagesProductSelected: any[];
  imagesProductUrl: string[] = [];


  constructor(
    public apiService: ApiService,
    public service: TableService,
    private modalService: NgbModal,
    private messageService: MessageService) {
  }

  async ngOnInit() {
    await this.loadProducts();

    this.types = [
      { name: 'Piñata', code: 'PI', active: true },
      { name: 'Piggy bank', code: 'PB', active: true }
    ];

    this.categories = [
      { name: 'Girls', code: 'GR', active: true },
      { name: 'Boys', code: 'BO', active: true },
      { name: 'Adults', code: 'AD', active: true },
      { name: 'Unisex', code: 'UN', active: true }
    ];

  }

  async loadProducts() {
    const products = await this.apiService.getAllFullProduct();
    this.products = products.data;
    console.log(this.products);
    
  }

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  showConfirm(id: number) {
    this.productSelected = id;

    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'warn', summary: `You are about to delete this product, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  showConfirmAllDelete(selectedProducts: any) {
    const amount = selectedProducts.length;

    if (!this.visible) {
      this.messageService.add({ key: 'confirmAllDelete', sticky: true, severity: 'warn', summary: `You are about to delete ${amount} products, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  async onConfirm() {
    try {
      const result = await this.apiService.deleteProduct(this.productSelected);

      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Producto eliminado', detail: `Se elimino el producto correctamente` });
        this.messageService.clear('confirm');

        setTimeout(() => {
          this.reload();
        }, 1000);
      }
      this.visible = false;

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  async onConfirmAll() {
    try {
      for (let index = 0; index < this.selectedProducts.length; index++) {
        const result = await this.apiService.deleteProduct(this.selectedProducts[index].id);
      }
      this.selectedProducts = [];

      this.messageService.add({ severity: 'success', summary: 'Productos eliminados', detail: `Se eliminaron los productos correctamente` });
      this.messageService.clear('confirmAllDelete');

      setTimeout(() => {
        this.reload();
      }, 1000);
      this.visible = false;

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  onReject() {
    this.messageService.clear('confirm');
    this.messageService.clear('confirmAllDelete');
    this.visible = false;
  }

  reload() {
    this.loadProducts();
  }

  pageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
  }

  async open(content: any, id: number) {
    this.productSelected = id
    this.getImagesFromSelected();

    try {
      const result = await this.apiService.getProduct(this.productSelected);

      this.productData.title = result.data[0].title;
      this.productData.description = result.data[0].description;
      this.productData.price = result.data[0].price;
      this.productData.category = result.data[0].category;
      this.productData.type = result.data[0].type;
      this.productData.stock = result.data[0].stock;
      this.productData.tags = result.data[0].tags;
      this.productData.sku = result.data[0].sku;
      this.productData.updated_date = this.getFormattedCurrentDate();

      console.log(result.data[0]);
      

      result.data[0].sale === 1 ? this.checked = true : this.checked = false;
      this.tags = this.productData.tags.split(',');      

      this.onSale = result.data[0].sale == 1 ? "true" : "false";

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.resetValues();

      if (this.itemSaved)
        this.reload();
    });
  }

  updateSKU(field: string){
    if(field === 'type'){
      const replaceChars = this.types.filter(type => {
        if(type.name === this.productData.type){
          return type.code;
        }
      });
      this.productData.sku = this.productData.sku.slice(0, -4) + replaceChars[0].code + this.productData.sku.slice(-2);
    }else{
      const replaceChars = this.categories.filter(category => {
        if(category.name === this.productData.category){
          return category.code;
        }
      });
      this.productData.sku = this.productData.sku.slice(0, -2) + replaceChars[0].code;
    }
  }

  async deleteImage(id: number) {
    try {
      const result = await this.apiService.deleteImage(id);

      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Imagen eliminada', detail: `Se elimino la imagen correctamente` });
      }
      this.imagesProductSelected = this.imagesProductSelected.filter( image => {
        return image.id !== id;
      })
      this.reload();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  async addImage(id_product: number, fileInput: HTMLInputElement) {
    try {
      if (this.imagesProductSelected.length < 4) {
        const file = fileInput.files[0];
        const imageResult = await this.apiService.addImageFile(id_product, file);
        if (imageResult.data.affectedRows !== 0) {
          const allImages = await this.apiService.getAllImageByProductId(id_product);
          this.imagesProductSelected = allImages.data
          this.messageService.add({ severity: 'success', summary: 'Imagen insertada', detail: `Se inserto la imagen correctamente` });
        }
        this.reload();        
      }

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  // async openModelImage(changeImage, productId) {
  //   this.productSelected = productId
  //   this.getImagesFromSelected();
  //   this.imagesProductUrl = [...this.imagesProductSelected];
  //   console.log(this.imagesProductUrl);


  //   this.modalService.open(changeImage, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;

  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //     this.resetValues();

  //     if (this.itemSaved)
  //       this.reload();
  //   });
  // }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getFormattedCurrentDate() {
    const currentDate = new Date();

    // Obtén los componentes de la fecha y la hora
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Agrega un cero adelante si es necesario
    const day = ('0' + currentDate.getDate()).slice(-2); // Agrega un cero adelante si es necesario
    const hours = ('0' + currentDate.getHours()).slice(-2); // Agrega un cero adelante si es necesario
    const minutes = ('0' + currentDate.getMinutes()).slice(-2); // Agrega un cero adelante si es necesario
    const seconds = ('0' + currentDate.getSeconds()).slice(-2); // Agrega un cero adelante si es necesario

    // Formatea la fecha y la hora según tu estructura
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }

  getImagesFromSelected() {
    this.imagesProductSelected = this.products.find(prod => {
      return prod.id === this.productSelected
    }).images.map(image => {
      return {
        id: image.id,
        img_url: image.img_url
      }
    });
  }

  updateImageText(event, index: number) {
    const img_url: string = event.target.value;
    this.imagesProductUrl[index] = img_url.replace(/dl=0/g, 'dl=1');

  }

  // async saveImages() {
  //   try {
  //     // const images = await this.apiService.getImagesByVariantId(this.variantSelected);

  //     // for (let index = 0; index < images.data.length; index++) {
  //     //   const img = images.data[index].images_id;
  //     //   const result = await this.apiService.updateImage(img, {img_url: this.imagesProductUrl[index]});        
  //     // }

  //     // this.messageService.add({ severity: 'success', summary: 'Imagenes editadas', detail: `Se actualizaron las imagenes correctamente`});
  //     // this.itemSaved = true;

  //   } catch (error) {
  //     this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
  //   }

  // }

  async saveData() {
    this.productData.sale = this.checked ? 1 : 0;
    this.productData.tags = this.tags.join(',');
    
    const requiredProperties = ['title', 'description','price','tags'];
    const missingProperties = requiredProperties.filter(prop => !this.productData[prop] || this.productData[prop] === '' || this.productData[prop].length === 0);

    if (missingProperties.length > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Por favor, complete los siguientes campos obligatorios: ${missingProperties.join(', ')}` });
      return;
    }

    console.log(this.productData);
    
    try {
      const result = await this.apiService.updateProduct(this.productSelected, this.productData);
      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Producto editado', detail: `Se actualizo el producto con ID: ${this.productSelected}` });
        this.itemSaved = true;
      }
      this.modalService.dismissAll();

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  resetValues() {
    this.productSelected = 0;
    this.productData = {};
  }


}