import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SortEvent } from 'src/app/shared/directives/shorting.directive';
import { NgbdSortableHeader } from "src/app/shared/directives/NgbdSortableHeader";
import { TableService } from 'src/app/shared/service/table.service';
import { ApiService } from 'src/app/shared/service/api.service';
import { MessageService } from 'primeng/api';
import * as FileSaver from 'file-saver';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

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
  colors: any[] = [];

  productData: any = {};
  tags: string[] | undefined;

  products!: any[];
  selectedProducts: any[] = [];
  selectedColors: any[] = [];

  itemSaved: boolean = false;
  onSale: string = "true";
  checked: boolean = false;

  first = 0;
  rows = 10;

  selectedFile: boolean = false;
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

    this.colors = [
      { name: 'Red', key: 'RD', hexCode: '#FF0000' },
      { name: 'Green', key: 'GR', hexCode: '#06a93f' },
      { name: 'Blue', key: 'BL', hexCode: '#0000FF' },
      { name: 'Yellow', key: 'YL', hexCode: '#FFFF00' },
      { name: 'Orange', key: 'OR', hexCode: '#FFA500' },
      { name: 'Purple', key: 'PR', hexCode: '#800080' },
      { name: 'Pink', key: 'PK', hexCode: '#FFC0CB' },
      { name: 'Cyan', key: 'CY', hexCode: '#00FFFF' },
      { name: 'Magenta', key: 'MG', hexCode: '#FF00FF' },
      { name: 'Brown', key: 'BR', hexCode: '#A52A2A' },
      { name: 'Black', key: 'BK', hexCode: '#000000' },
      { name: 'White', key: 'WH', hexCode: '#FFFFFF' },
      { name: 'Gray', key: 'GY', hexCode: '#808080' },
      { name: 'Lime', key: 'LM', hexCode: '#00FF00' },
      { name: 'Teal', key: 'TL', hexCode: '#008080' },
      { name: 'Maroon', key: 'MR', hexCode: '#800000' },
      { name: 'Navy', key: 'NV', hexCode: '#000080' },
      { name: 'Silver', key: 'SV', hexCode: '#C0C0C0' },
      { name: 'Gold', key: 'GD', hexCode: '#FFD700' },
      { name: 'Turquoise', key: 'TQ', hexCode: '#40E0D0' },
      { name: 'Violet', key: 'VT', hexCode: '#8A2BE2' },
      { name: 'Indigo', key: 'IG', hexCode: '#4B0082' },
      { name: 'Aquamarine', key: 'AQ', hexCode: '#7FFFD4' },
      { name: 'Coral', key: 'CR', hexCode: '#FF7F50' },
      { name: 'Crimson', key: 'CM', hexCode: '#DC143C' },
      { name: 'Salmon', key: 'SM', hexCode: '#FA8072' },
      { name: 'Olive', key: 'OV', hexCode: '#808000' },
      { name: 'Sky Blue', key: 'SB', hexCode: '#87CEEB' },
      { name: 'Slate Gray', key: 'SL', hexCode: '#708090' },
      { name: 'Peru', key: 'PE', hexCode: '#CD853F' },
      { name: 'Orchid', key: 'OC', hexCode: '#DA70D6' },
      { name: 'Chartreuse', key: 'CH', hexCode: '#7FFF00' },
      { name: 'Sienna', key: 'SI', hexCode: '#A0522D' },
      { name: 'Deep Pink', key: 'DP', hexCode: '#FF1493' },
      { name: 'Midnight Blue', key: 'MN', hexCode: '#191970' },
      { name: 'Dark Olive Green', key: 'DO', hexCode: '#556B2F' },
      { name: 'Hot Pink', key: 'HP', hexCode: '#FF69B4' },
      { name: 'Dark Slate Gray', key: 'DG', hexCode: '#2F4F4F' },
      { name: 'Pale Violet Red', key: 'PV', hexCode: '#DB7093' },
      { name: 'Deep Sky Blue', key: 'DS', hexCode: '#00BFFF' }
    ];

  }

  async loadProducts() {
    const products = await this.apiService.getAllFullProduct();
    this.products = products.data;
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
      this.productData.colors = result.data[0].colors;
      this.productData.type = result.data[0].type;
      this.productData.stock = result.data[0].stock;
      this.productData.tags = result.data[0].tags;
      this.productData.sku = result.data[0].sku;
      this.productData.updated_date = this.getFormattedCurrentDate();

      result.data[0].sale === 1 ? this.checked = true : this.checked = false;
      this.tags = this.productData.tags.split(',');

      this.onSale = result.data[0].sale == 1 ? "true" : "false";

      this.getColorsFromSelected(this.productData.colors);      

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.resetValues();

      if (this.itemSaved)
        this.reload();
    });
  }

  updateSKU(field: string) {
    if (field === 'type') {
      const replaceChars = this.types.filter(type => {
        if (type.name === this.productData.type) {
          return type.code;
        }
      });
      this.productData.sku = this.productData.sku.slice(0, -4) + replaceChars[0].code + this.productData.sku.slice(-2);
    } else {
      const replaceChars = this.categories.filter(category => {
        if (category.name === this.productData.category) {
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
      this.imagesProductSelected = this.imagesProductSelected.filter(image => {
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

  getColorsFromSelected(value: string) {
    if(value && value !== ''){
      const prodColots = value.split(',');
      this.selectedColors = prodColots.map( color => {
        return this.colors.find( item => item.name == color)
      });
    }
  }

  updateImageText(event, index: number) {
    const img_url: string = event.target.value;
    this.imagesProductUrl[index] = img_url.replace(/dl=0/g, 'dl=1');

  }

  async onFileSelected(event: UploadEvent) {
    try {
      this.selectedFile = true
      const file = event.files[0];

    } catch (error) {
      this.messageService.add({ key: 'tc', severity: 'error', summary: 'Error', detail: error.message });
    }
  }

  async saveData() {
    this.productData.sale = this.checked ? 1 : 0;
    this.productData.colors = this.selectedColors.map( color => color.name ).join(',');
    this.productData.tags = [...this.tags, ...this.selectedColors.map( color => color.name )].join(',');

    const requiredProperties = ['title', 'description', 'price', 'tags'];
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

  exportExcel() {
    const data = this.products.map(prod => {
      let newData = {
        title: prod.title,
        description: prod.description,
        type: prod.type,
        category: prod.category,
        stock: prod.stock,
        price: prod.price,
        status: prod.sale ? 1 : 0,
        sku: prod.sku,
        tags: prod.tags.join(),
        created_date: prod.created_date,
        updated_date: prod.updated_date
      };
      prod.images.forEach((image, index) => {
        newData[`image${index + 1}`] = image.img_url;
      });

      return newData;
    })

    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  resetValues() {
    this.productSelected = 0;
    this.productData = {};
    this.selectedColors = [];
  }


}
