import { DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
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
  discounts: any[] = [];
  collections: any[] = [];
  categories: any[] = [];
  productData: any = {};

  products!: any[];
  selectedProducts: any[] = [];
  itemSaved: boolean = false;
  onSale: string = "true";

  first = 0;
  rows = 10;

  variantSelected: number;
  productSelected: number;
  imagesProductSelected: string[];
  imagesProductUrl: string[] = [];


  constructor(
    public apiService: ApiService,
    public service: TableService,
    private modalService: NgbModal,
    private messageService: MessageService) {
  }

  async ngOnInit() {
    await this.getAllCollections();
    await this.loadProducts();    

    this.types = [
      { name: 'T-shirt', code: 'TSA', active: true },
      { name: 'Hoddie', code: 'HOA', active: false },
      { name: 'Sweather', code: 'SWA', active: false },
      { name: 'Tank top', code: 'TTA', active: false },
      { name: 'Mug', code: 'MUG', active: false }
    ];

    this.discounts = [
      { name: '0%', code: '1', active: true },
      { name: '25%', code: '2', active: false },
      { name: '50%', code: '3', active: false },
      { name: '75%', code: '4', active: false }
    ];

    this.categories = [
      { name: 'Men', code: 'ME', active: true },
      { name: 'Women', code: 'WO', active: false },
      { name: 'Youht', code: 'SW', active: false },
      { name: 'Unisex', code: 'UN', active: false },
    ];

  }

  async loadProducts() {
    const products = await this.apiService.getAllProductsByVariants();
    products.data.forEach(elem => {
      elem.imagesUrl = elem.imagesUrl.split(',');
      // elem.sale = (elem.sale === 1) ? 'On sale' : 'Disabled';
    })
    this.products = products.data;

  }

  async getAllCollections() {
    try {
      const result = await this.apiService.getAllCollections();
      this.collections = result.data;
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error obteniendo colecciones: ${error.message}` });
    }
  }

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
    this.variantSelected = id;
    console.log(this.variantSelected);

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

  async onConfirmAll(){
    try {

     for (let index = 0; index < this.selectedProducts.length; index++) {
        const result = await await this.apiService.deleteVariant(this.selectedProducts[index].variantId);       
      }

      this.messageService.add({ severity: 'success', summary: 'Productos eliminados', detail: `Se eliminaron los productos correctamente`});
      this.messageService.clear('confirm');
        this.visible = false;

        setTimeout(() => {
          this.reload();
        }, 1000);

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  async onConfirm() {
    try {
      const result = await this.apiService.deleteVariant(this.variantSelected);

      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Coleccion eliminada', detail: `Se elimino la colecion correctamente` });
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

  reload() {
    this.loadProducts();
  }

  pageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
  }

  async open(content, id: number) {
    this.productSelected = id
    this.getImagesFromSelected();

    try {
      const result = await this.apiService.getProduct(this.productSelected);

      console.log(result);

      this.productData.title = result.data[0].title;
      this.productData.description = result.data[0].description;
      this.productData.price = result.data[0].price;
      this.productData.category = result.data[0].category;
      this.productData.type = result.data[0].type;
      this.productData.tags = result.data[0].tags;
      this.productData.discounts_id = result.data[0].discounts_id;
      this.productData.collections_id = result.data[0].collections_id;
      this.productData.updated_date = this.getFormattedCurrentDate();

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

  async openModelImage(changeImage, variantId, productId) {
    this.productSelected = productId
    this.variantSelected = variantId
    this.getImagesFromSelected();
    this.imagesProductUrl = [...this.imagesProductSelected];

    this.modalService.open(changeImage, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.resetValues();

      if (this.itemSaved)
        this.reload();
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
      return prod.productId === this.productSelected
    }).imagesUrl;
  }

  updateImageText(event, index: number) {
    const img_url: string = event.target.value;
    this.imagesProductUrl[index] = img_url.replace(/dl=0/g, 'dl=1');

  }

  async saveImages() {
    try {
      const images = await this.apiService.getImagesByVariantId(this.variantSelected);
      
      for (let index = 0; index < images.data.length; index++) {
        const img = images.data[index].images_id;
        const result = await this.apiService.updateImage(img, {img_url: this.imagesProductUrl[index]});        
      }

      this.messageService.add({ severity: 'success', summary: 'Imagenes editadas', detail: `Se actualizaron las imagenes correctamente`});
      this.itemSaved = true;

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }

  }

  async saveData() {

    this.productData.sale = this.onSale === 'true' ? 1 : 0;
    this.productData.collections_id = parseInt(this.productData.collections_id);
    this.productData.discounts_id = parseInt(this.productData.discounts_id);

    console.log(this.productData);

    try {
      const result = await this.apiService.updateProduct(this.productSelected, this.productData);
      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Producto editado', detail: `Se actualizo el producto con ID: ${this.productSelected}` });
        this.itemSaved = true;
      }
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }
  }

  resetValues() {
    this.productSelected = 0;
    this.productData = {};
  }


}
