import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, Message } from 'primeng/api';
import * as csvParser from 'csv-parser';
import { FileUpload } from 'primeng/fileupload';
import { ApiService } from 'src/app/shared/service/api.service';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-digital-import-listing',
  templateUrl: './digital-import-listing.component.html',
  styleUrls: ['./digital-import-listing.component.scss'],
  providers: [MessageService]
})
export class DigitalImportListingComponent implements OnInit {

  productsListing: any[] = [];
  selectedFile: boolean = false;
  lastGeneratedTime: number = 0;

  first = 0;
  rows = 20;

  visible: boolean = false;
  progress: number = 0;
  interval = null;

  errorTypeAmount = 0;
  errorCategoryAmount = 0;
  errorStockAmount = 0;
  errorPriceAmount = 0;
  errorWeightAmount = 0;
  invalidFile: boolean = false;

  messagesErrors: Message[] | undefined;
  messagesInfo: Message[] | undefined;
  messagesSuccess: Message[] | undefined;

  requiredHeaders = ['title', 'description', 'collection', 'category', 'image1', 'image2', 'image3', 'image4', 'stock', 'price', 'weight', 'status'];

  collections: any[];
  categories: any[];


  @ViewChild('uploader') uploader: FileUpload;

  constructor(private messageService: MessageService, private cdr: ChangeDetectorRef, private apiService: ApiService) { }

  async ngOnInit() {
    await this.loadData();

    this.messagesInfo = [{ severity: 'info', summary: 'Info', detail: 'No CSV file containing product listings has been uploaded yet.' }]
  }

  async loadData() {
    try {
      const collections = await this.apiService.getAllCollections();
      this.collections = collections.data

      const categories = await this.apiService.getAllCategories();
      this.categories = categories.data;

    } catch (error) {
      console.error(error);
    }
  }

  pageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
  }

  downloadCSV() {
    const link = document.createElement('a');
    link.href = 'assets/template/Armentas Listing Template.xlsx';  // Ruta al archivo CSV en la carpeta assets
    link.download = 'Armentas_Listing_Template.xlsx';     // Nombre que tendrá el archivo descargado
    link.click();
  }

  onFileSelected(event: UploadEvent) {
    const file = event.files[0];

    if (!file) return;

    this.selectedFile = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCSV(text);
    };
    reader.readAsText(file);

  }

  parseCSV(text: string) {    
    const lines = text.split('\n').map(line => line.trim());
    const headers = lines[0].split(',');
    

    // Validar si el archivo CSV tiene los encabezados requeridos
    const missingHeaders = this.requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      this.invalidFile = true;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `The CSV file does not contain the following required headers: ${missingHeaders.join(', ')}` });
      return;
    }

    let rows = lines.slice(1).map(line => line.split(','));
    console.log(rows);
    // Filtrar los elementos vacíos del array de rows
    rows = rows.filter(row => row.length === this.requiredHeaders.length);

    this.productsListing = rows.map((arr, index) => {
      return {
        no: index + 1,
        title: arr[0],
        description: arr[1],
        collection: arr[2],
        category: arr[3],
        stock: arr[4],
        price: arr[5],
        weight: arr[6],
        status: arr[7],
        images: [this.previewImage(arr[8]), this.previewImage(arr[9]), this.previewImage(arr[10]), this.previewImage(arr[11])]
      };
    });
    

    //Validar si hay datos no admisibles
    this.productsListing.forEach(product => {
      if (!this.validarTCollections(product.collection)) {
        this.errorTypeAmount++;
      };
      if (!this.validarCategories(product.category)) {
        this.errorCategoryAmount++;
      }
      if (!this.validarNumber(product.stock)) {
        this.errorStockAmount++;
      }
      if (!this.validarNumber(product.price)) {
        this.errorPriceAmount++;
      }
      if (!this.validarNumber(product.weight)) {
        this.errorWeightAmount++;
      }
    })

    if (this.errorTypeAmount !== 0 || this.errorCategoryAmount !== 0 || this.errorStockAmount !== 0 || this.errorPriceAmount !== 0 || this.errorWeightAmount !== 0) {
      this.messagesErrors = [{ severity: 'error', summary: 'Error', detail: `${this.errorTypeAmount} invalid entries have been detected in TYPE, ${this.errorCategoryAmount} invalid entries in CATEGORY, ${this.errorStockAmount} invalid entries in STOCK, ${this.errorPriceAmount} invalid entries in PRICE and ${this.errorWeightAmount} invalid entries in WEIGHT.` }]
    } else {
      this.messagesSuccess = [{ severity: 'success', summary: 'Success', detail: `Data upload successful, no errors detected.` }]
    }
  }

  previewImage(url: string): string {
    if (url !== "") {
      return url.replace(/dl=0/g, 'dl=1')
    }
    return "";
  }

  validarTCollections(collection: string): boolean {
    return this.collections.some(item => item.name === collection)
  }

  validarCategories(category: string): boolean {
    return this.categories.some(item => item.name === category)
  }

  validarNumber(value: number): boolean {
    const numero = +value;
    return typeof value === 'number' || !isNaN(numero);
  }

  private async generateSkuWithDelay(collection: string, category: string): Promise<string> {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastGeneratedTime;
    
    if (timeDiff < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - timeDiff));
    }
    
    this.lastGeneratedTime = Date.now();
    return this.skuGenerator(collection, category);
  }

  skuGenerator(collectionName: string, categoryName: string): string {
    const stringId = this.uniqueString();
    return `AR${stringId}${this.getCodeFromName(this.collections, collectionName)}${this.getCodeFromName(this.categories, categoryName)}`;
  }

  uniqueString(): string {
    // Get current date
    const currentDate = new Date();

    // Get minutes and milliseconds
    const minutes = currentDate.getMinutes();
    const milliseconds = currentDate.getMilliseconds();

    // Format minutes and milliseconds as two-digit strings
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
    const formattedMilliseconds = milliseconds < 10 ? '00' + milliseconds : (milliseconds < 100 ? '0' + milliseconds : milliseconds.toString());

    // Concatenate current date with formatted minutes and milliseconds
    return `${currentDate.getFullYear()}${currentDate.getMonth() + 1}${currentDate.getDate()}${currentDate.getHours()}${formattedMinutes}${formattedMilliseconds}`;
  }

  getCodeFromName(object: any, name: string): string {
    const foundCode = object.find(obj => obj.name === name);
    return foundCode?.code;
  }

  async saveData() {
    try {
      if (this.selectedFile){
        if (!this.invalidFile) {
          if (this.errorTypeAmount !== 0 || this.errorCategoryAmount !== 0 || this.errorStockAmount !== 0 || this.errorPriceAmount !== 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `To proceed, please correct the errors identified in the CSV file.` });
          } else {
            this.showConfirm()
            const results = await Promise.all(this.productsListing.map(async (product) => {
              let generalData = {
                collection: this.collections.filter(col => col.name == product.collection)[0].id,
                title: product.title,
                description: product.description,
                sku: await this.generateSkuWithDelay(product.collection, product.category),
                category: product.category,
                price: parseFloat(product.price),
                weight: parseFloat(product.weight),
                stock: parseInt(product.stock),
                sale: parseInt(product.status),
                tags: Array.from(new Set([
                  product.collection,
                  product.category
                ])).join(','),
              }

              // Insertar Producto
              const productResult = await this.apiService.addProduct(generalData);
              const id_product = productResult.data.insertId;

              // Insertar imagen segun el nombre productID obtenido
              const imageResults = await Promise.all(product.images.map(async (image) => {
                if (image !== '') {
                  return await this.apiService.addImageUrl(id_product, { img_url: image });
                }
              }));

              return { productResult, imageResults };
            }));
            this.onReject();
            this.messageService.add({ severity: 'success', summary: 'Product registered.', detail: `${results.length} products were successfully registered.` });
            this.cleanUploader();
          }
        }
      }
    } catch (error) {
      this.onReject();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred.: ${error.message}` });
    }
  }

  showConfirm() {
    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'custom', summary: 'Creating product' });
      this.visible = true;
      this.progress = 0;

      if (this.interval) {
        clearInterval(this.interval);
      }

      this.interval = setInterval(() => {
        if (this.progress <= 100) {
          this.progress = this.progress + 20;
        }

        if (this.progress >= 100) {
          this.progress = 100;
          clearInterval(this.interval);
        }
        this.cdr.detectChanges()
      }, 1000);
    }
  }

  onReject() {
    this.messageService.clear('confirm');
    this.visible = false;
  }

  cleanUploader() {
    this.uploader.clear();
    this.selectedFile = false;
    this.productsListing = [];
    this.invalidFile = false;
    this.errorTypeAmount = 0;
    this.errorCategoryAmount = 0;
    this.errorStockAmount = 0;
    this.errorPriceAmount = 0;
  }
}
