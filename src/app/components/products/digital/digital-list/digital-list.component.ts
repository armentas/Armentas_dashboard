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

  selectedFileName: string = 'No file selected';
  previewImages: any[] = [];
  newImages: File[] = [];
  idImagesToDelete: number[] = [];

  loading: boolean = false;
  initLoading: boolean = false;
  
  public closeResult: string;
  visible: boolean = false;
  public productList: any[] = [];

  collections: any[] = [];
  categories: any[] = [];
  colors: any[] = [];

  productData: any = {};
  tags: string[] | undefined;

  products!: any[];
  specialProducts: any[] = [];
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

  tooltipMessage = {
    specialList: 'To mark or unmark products as SPECIAL, simply include or remove the “special” tag on the product.',
  }

  constructor(
    public apiService: ApiService,
    public service: TableService,
    private modalService: NgbModal,
    private messageService: MessageService) {
  }

  async ngOnInit() {
    this.initLoading = true
    await this.loadProducts();
    this.initLoading = false
  }

  async loadProducts() {
    const products = await this.apiService.getAllFullProduct();
    this.products = products.data;

    this.specialProducts = this.products.filter(pro =>
      pro.tags.some(tag => tag.toLowerCase() === 'special'.toLowerCase())
    );

    const collections = await this.apiService.getAllCollections();
    this.collections = collections.data;

    const categories = await this.apiService.getAllCategories();
    this.categories = categories.data;

    const colors = await this.apiService.getAllColors();
    this.colors = colors.data;
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
        this.messageService.add({ severity: 'success', summary: 'Product removed', detail: `The product was correctly removed` });
        this.messageService.clear('confirm');

        setTimeout(() => {
          this.reload();
        }, 1000);
      }
      this.visible = false;

    } catch (error) {
      if (error.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: ` ${error.error.msg}` });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
    }
  }

  async onConfirmAll() {
    try {
      this.loading = true;
      for (let index = 0; index < this.selectedProducts.length; index++) {
        const result = await this.apiService.deleteProduct(this.selectedProducts[index].id);
      }
      this.selectedProducts = [];

      this.messageService.add({ severity: 'success', summary: 'Products eliminated', detail: `Products were eliminated correctly` });
      this.messageService.clear('confirmAllDelete');

      setTimeout(() => {
        this.reload();
      }, 1000);
      this.loading = false;
      this.visible = false;

    } catch (error) {
      this.loading = false;
      if (error.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: ` ${error.error.msg}` });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
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
    this.selectedFileName = 'No file selected';
    this.getImagesFromSelected();

    try {
      const result = await this.apiService.getProduct(this.productSelected);

      this.productData.title = result.data[0].title;
      this.productData.description = result.data[0].description;
      this.productData.collection = this.getCollectionFromId(result.data[0].collection);
      this.productData.category = result.data[0].category;
      this.productData.price = Number(result.data[0].price).toFixed(2) ;
      this.productData.weight = result.data[0].weight;
      this.productData.stock = result.data[0].stock;
      this.productData.colors = result.data[0].colors;
      this.productData.tags = result.data[0].tags;
      this.productData.sku = result.data[0].sku;
      this.productData.updated_date = this.getFormattedCurrentDate();

      result.data[0].sale === 1 ? this.checked = true : this.checked = false;
      this.tags = this.productData.tags.split(',');

      this.onSale = result.data[0].sale == 1 ? "true" : "false";

      this.getColorsFromSelected(this.productData.colors);

    } catch (error) {
      if(error.error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
      else{
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
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
    if (field === 'collection') {
      const replaceChars = this.collections.filter(col => {
        if (col.name === this.productData.collection) {
          return col.code;
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
    this.imagesProductSelected = this.imagesProductSelected.filter(img => img.id !== id);
    this.idImagesToDelete.push(id);
  }

  // async deleteImage(id: number) {
  //   try {
  //     const result = await this.apiService.deleteImage(id);

  //     if (result.data.affectedRows !== 0) {
  //       this.messageService.add({ severity: 'success', summary: 'Imagen eliminada', detail: `Se elimino la imagen correctamente` });
  //     }
  //     this.imagesProductSelected = this.imagesProductSelected.filter(image => {
  //       return image.id !== id;
  //     })
  //     this.reload();
  //   } catch (error) {
  //     if (error.error) {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: ` ${error.error.msg}` });
  //     } else {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
  //     }
  //   }
  // }

  showFileName(fileInput: HTMLInputElement){
    this.selectedFileName = fileInput.files[0].name;

    if((this.imagesProductSelected.length + this.previewImages.length) < 4){
      this.newImages.push(fileInput.files[0]);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImages.push({ img_url: e.target.result, type: 'file' });
      };
      reader.readAsDataURL(fileInput.files[0]);
      
    }else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You have reached the maximum number of images for a product.' });
    }
    
  }

  deletePreviewImage(index: number){
    this.previewImages.splice(index, 1);
    this.newImages.splice(index, 1);
  }

  // async addImage(id_product: number, fileInput: HTMLInputElement) {
  //   try {
  //     if (this.imagesProductSelected.length < 4) {
  //       const file = fileInput.files[0];
  //       this.selectedFileName = fileInput.files[0].name;
  //       const imageResult = await this.apiService.addImageFile(id_product, file);
  //       if (imageResult.data.affectedRows !== 0) {
  //         const allImages = await this.apiService.getAllImageByProductId(id_product);
  //         this.imagesProductSelected = allImages.data
  //         this.messageService.add({ severity: 'success', summary: 'Imagen insertada', detail: `Se inserto la imagen correctamente` });
  //       }
  //       this.reload();
  //     }

  //   } catch (error) {
  //     if (error.error) {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: ` ${error.error.msg}` });
  //     } else {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
  //     }
  //   }
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

  getColorsFromSelected(value: string) {
    if (value && value !== '') {
      const prodColots = value.split(',');
      this.selectedColors = prodColots.map(color => {
        return this.colors.find(item => item.name == color)
      });
    }
  }

  getCollectionFromId(id: number){
    console.log(id);
    
    const resp = this.collections.filter(col => col.id === id);
    return resp[0]?.name;
  }

  updateImageText(event, index: number) {
    const img_url: string = event.target.value;
    this.imagesProductUrl[index] = img_url.replace(/dl=0/g, 'dl=1');

  }

  async saveData() {
    const collec = this.collections.filter( col => col.name == this.productData.collection)[0];    
    this.productData.collection = collec?.id ? collec.id : '';
    this.productData.sale = this.checked ? 1 : 0;
    this.productData.colors = this.selectedColors.map(color => color.name).join(',');
    this.productData.tags = [...this.tags].join(',');

    const requiredProperties = ['collection', 'title', 'description', 'price', 'tags'];
    const missingProperties = requiredProperties.filter(prop => !this.productData[prop] || this.productData[prop] === '' || this.productData[prop].length === 0);

    if (missingProperties.length > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Please complete the following required fields: ${missingProperties.join(', ')}` });
      return;
    }

    try {
      this.loading = true;
      if(this.newImages.length > 0){
        await Promise.all(this.newImages.map( async(file) => {
          await this.apiService.addImageFile(this.productSelected, file);
        }));
        this.itemSaved = true;
      }

      if(this.idImagesToDelete.length > 0){
        await Promise.all(this.idImagesToDelete.map( async(id) => {
          await this.apiService.deleteImage(id);
        }));
        this.itemSaved = true;
      }

      const result = await this.apiService.updateProduct(this.productSelected, this.productData);
      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Edited product', detail: `The product has been updated with ID: ${this.productSelected}` });
        this.itemSaved = true;
      }
      this.modalService.dismissAll();
      this.loading = false;

    } catch (error) {
      this.loading = false;
      if(error.error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
      else{
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
    }
  }

  exportExcel() {
    const data = this.products.map(prod => {
      let newData = {
        title: prod.title,
        description: prod.description,
        collection: prod.collection,
        category: prod.category,
        stock: prod.stock,
        price: prod.price,
        weight: prod.weight,
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
    this.newImages = [];
    this.previewImages = [];
    this.idImagesToDelete = [];
  }


}
