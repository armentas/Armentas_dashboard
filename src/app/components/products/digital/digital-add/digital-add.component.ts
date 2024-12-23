import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/shared/service/api.service';

interface Image {
  img_url: string;
  type: string;
  alt?: string;
}

interface Product {
  title: string;
  description: string;
  sku: string;
  type: string;
  category: string;
  price: number;
  sale: boolean;
  tags: string[];
  images: Image[];
}

@Component({
  selector: 'app-digital-add',
  templateUrl: './digital-add.component.html',
  providers: [MessageService],
  styleUrls: ['./digital-add.component.scss']
})


export class DigitalAddComponent implements OnInit {

  selectedFileName: string = 'No file selected';

  collections: any[] = [];
  categories: any[] = [];
  colors: any[] = [];

  newColorData: any = {};
  colorKeyList: string[] = [];
  colorNameList: string[] = [];

  newCategoryData: any = {};
  categoryNameList: string[] = [];
  categoryCodeList: string[] = [];

  newCollectionData: any = {};
  collectionNameList: string[] = [];
  collectionCodeList: string[] = [];

  productData: any = {};
  selectedProductCollection: string = '';
  selectedProductCategory: string = '';
  selectedColors: any[] = [];
  onSale: boolean = true;

  tags: string[] | undefined;
  urlImage: string = '';

  tabFile: boolean = true;
  tabURL: boolean = false;
  list: number[] = [1];

  previewImages: Image[] = [];
  selectedImages: (File | string)[] = [];

  visible: boolean = false;
  progress: number = 0;
  interval = null;

  public closeResult: string;

  errors = {
    name: '',
    code: '',
    color_key: '',
    hexCode: '',
    description: ''
  };

  constructor(
    private messageService: MessageService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal) { }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      const collections = await this.apiService.getAllCollections();
      this.collections = collections.data

      const categories = await this.apiService.getAllCategories();
      this.categories = categories.data;

      const colors = await this.apiService.getAllColors();
      this.colors = colors.data;


      this.collectionNameList = this.collections.map(col => col.name.toLowerCase());
      this.collectionCodeList = this.collections.map(col => col.code.toLowerCase());

      this.categoryNameList = this.categories.map(cat => cat.name.toLowerCase());
      this.categoryCodeList = this.categories.map(cat => cat.code.toLowerCase());

      this.colorKeyList = this.colors.map(col => col.color_key.toLowerCase());
      this.colorNameList = this.colors.map(col => col.name.toLowerCase());

    } catch (error) {
      console.error(error);
    }
  }

  open(content: any) {
    Object.keys(this.errors).forEach(key => this.errors[key] = '');

    this.newCategoryData = {
      name: '',
      code: ''
    }

    this.newColorData = {
      name: '',
      color_key: '',
      hexCode: ''
    }

    this.newCollectionData = {
      name: '',
      code: '',
      description: ''
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'sm', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  validateCode(list: string[], code: string) {
    if (list.includes(code.toLowerCase())) {
      this.errors.code = 'This code already exists.';
    } else {
      this.errors.code = '';
    }
  }

  validateName(list: string[], name: string) {
    if (list.includes(name.toLowerCase())) {
      this.errors.name = 'This name already exists.';
    } else {
      this.errors.name = '';
    }
  }

  validateKey() {
    if (this.colorKeyList.includes(this.newColorData.color_key.toLowerCase())) {
      this.errors.color_key = 'This color key already exists.';
    } else {
      this.errors.color_key = '';
    }
  }

  validateInput(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Solo permite letras A-Z y a-z
    if (!/[a-zA-Z]/.test(event.key)) {
      event.preventDefault();
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

  isSelected(color: any): boolean {
    return this.selectedColors.includes(color);
  }

  toggleSelection(value: any): void {
    const index = this.selectedColors.indexOf(value);
    if (index === -1) {
      this.selectedColors.push(value);
    } else {
      this.selectedColors.splice(index, 1);
    }
  }

  switchTab(tab: string): void {
    this.tabFile = false;
    this.tabURL = false;
    this.list = [1];
    // this.previewImages = [];


    if (tab === 'tabFile') {
      this.tabFile = true;
    } else if (tab === 'tabURL') {
      this.tabURL = true;
    }
  }

  onFileChange(event: any, item: number): void {
     if (this.previewImages.length < 4) {
      const input = event.target as HTMLInputElement;

      if (input?.files?.length) {
        this.selectedFileName = input.files[0].name;
        const file = input.files[0];
        this.selectedImages.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push({ img_url: e.target.result, type: 'file' });
        };
        reader.readAsDataURL(file);
      } else {
        this.selectedFileName = 'No file selected';
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ha llegado al número máximo de imágenes para un producto' });
    }
  }

  previewImage(): void {
    if (this.previewImages.length < 4) {
      const img_url = this.urlImage;

      if (img_url !== '') {
        const imgDownloable = img_url.replace(/dl=0/g, 'dl=1');
        // Agregar en la lista de imagenes
        this.selectedImages.push(imgDownloable);
        // Agregar el objeto al arreglo de vista previa
        this.previewImages.push({ img_url: imgDownloable, type: 'url' });
        this.urlImage = "";
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ha llegado al número máximo de imágenes para un producto' });
    }
  }

  deleteThumbnails(position: number) {
    this.previewImages.splice(position, 1);
    this.selectedImages.splice(position, 1);
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

  skuGenerator(): string {
    const stringId = this.uniqueString();
    return `AR${stringId}${this.selectedProductCollection}${this.selectedProductCategory}`;
  }

  getNameFromCode(object: any, code: string): string {
    const foundName = object.find(obj => obj.code === code);
    return foundName?.name;
  }

  updateHexCode() {
    this.newColorData.hexCode = this.newColorData.hexCode;
  }

  async saveCollectionData() {
    // Limpiar errores previos
    Object.keys(this.errors).forEach(key => this.errors[key] = '');
    try {
      const requiredFields = [
        { field: 'name', message: 'Field required.' },
        { field: 'code', message: 'Field required.' },
        { field: 'description', message: 'Field required.' }
      ];

      // Verificar si hay campos vacíos y asignar mensajes de error
      let hasError = false;
      requiredFields.forEach(({ field, message }) => {
        if (!this.newCollectionData[field] || this.newCollectionData[field].trim() === '') {
          this.errors[field] = message;
          hasError = true;
        }
      });

      // Si hay errores, no continuar
      if (hasError) {
        console.warn('No se pudo guardar porque hay campos obligatorios vacíos.');
        return;
      }

      this.validateName(this.collectionNameList,this.newCollectionData.name);
      this.validateCode(this.collectionCodeList, this.newCollectionData.code);
      
      if (this.errors.name == '' && this.errors.code == '') {
        console.log('Creando nueva coleccion:', this.newCollectionData);
        
        this.newCollectionData.code = this.newCollectionData.code.toUpperCase();
        this.newCollectionData.title = 'Empty';
        this.newCollectionData.image = 'https://placehold.co/1370x400/png';
        this.newCollectionData.active = 1;
        const resp = await this.apiService.addCollection(this.newCollectionData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The collection ${this.newCollectionData.name} has been successfully added` });
      } else {
        return;
      }

      this.loadData();
      this.selectedProductCollection = this.newCollectionData.code;

      this.modalService.dismissAll();
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
    }
  }

  async saveCategoryData() {
    // Limpiar errores previos
    Object.keys(this.errors).forEach(key => this.errors[key] = '');
    try {
      const requiredFields = [
        { field: 'name', message: 'Field required.' },
        { field: 'code', message: 'Field required.' }
      ];

      // Verificar si hay campos vacíos y asignar mensajes de error
      let hasError = false;
      requiredFields.forEach(({ field, message }) => {
        if (!this.newCategoryData[field] || this.newCategoryData[field].trim() === '') {
          this.errors[field] = message;
          hasError = true;
        }
      });

      // Si hay errores, no continuar
      if (hasError) {
        console.warn('No se pudo guardar porque hay campos obligatorios vacíos.');
        return;
      }

      this.validateName(this.categoryNameList,this.newCategoryData.name);
      this.validateCode(this.categoryCodeList,this.newCategoryData.code);

      this.newCategoryData.code = this.newCategoryData.code.toUpperCase();

      if (this.errors.code == '' && this.errors.name == '') {
        console.log('Creando nueva categoria:', this.newCategoryData);
        const resp = await this.apiService.addCategory(this.newCategoryData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The category ${this.newCategoryData.name} has been successfully added` });
      } else {
        return;
      }

      this.loadData();
      this.selectedProductCategory = this.newCategoryData.code;

      this.modalService.dismissAll();
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
    }
  }

  async saveColorData() {
    // Limpiar errores previos
    Object.keys(this.errors).forEach(key => this.errors[key] = '');
    try {
      const requiredFields = [
        { field: 'name', message: 'Field required.' },
        { field: 'color_key', message: 'Field required.' },
        { field: 'hexCode', message: 'Field required.' }
      ];

      // Verificar si hay campos vacíos y asignar mensajes de error
      let hasError = false;
      requiredFields.forEach(({ field, message }) => {
        if (!this.newColorData[field] || this.newColorData[field].trim() === '') {
          this.errors[field] = message;
          hasError = true;
        }
      });

      // Si hay errores, no continuar
      if (hasError) {
        console.warn('No se pudo guardar porque hay campos obligatorios vacíos.');
        return;
      }

      this.validateName(this.colorNameList, this.newColorData.name)
      this.validateKey()

      this.newColorData.color_key = this.newColorData.color_key.toUpperCase();

      if (this.errors.color_key == '' && this.errors.name == '') {
        console.log('Creando nuevo color:', this.newColorData);
        const resp = await this.apiService.addColor(this.newColorData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The color ${this.newColorData.name} has been successfully added` });
      } else {
        return;
      }

      this.loadData();

      this.modalService.dismissAll();
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
    }
  }

  async onSubmit2() {  
    const collec = this.collections.filter( col => col.code == this.selectedProductCollection)[0];
    this.productData.collection = collec?.id ? collec.id : '';
    this.productData.category = this.selectedProductCategory;
    this.productData.sku = this.skuGenerator();
    this.productData.onSale = this.onSale;
    this.productData.images = this.selectedImages;
    this.productData.colors = this.selectedColors;
    this.productData.tags = new Set([
      this.tags,
      this.getNameFromCode(this.collections, collec?.code),
      this.getNameFromCode(this.categories, this.productData.category)
    ].filter(Boolean));

    const requiredProperties = ['title', 'description', 'collection', 'category', 'price', 'stock', 'weight', 'tags', 'images'];
    const missingProperties = requiredProperties.filter(prop => !this.productData[prop] || this.productData[prop] === '' || this.productData[prop].length === 0);

    if (missingProperties.length > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Por favor, complete los siguientes campos obligatorios: ${missingProperties.join(', ')}` });
      return;
    }

    try {
      this.showConfirm()
      let generalData = {
        collection: this.productData.collection,
        title: this.productData.title,
        description: this.productData.description ?? '',
        sku: this.productData.sku,
        category: this.getNameFromCode(this.categories, this.productData.category),
        colors: this.productData.colors.join(','),
        price: this.productData.price,
        stock: this.productData.stock,
        weight: this.productData.weight,
        sale: this.productData.onSale ? 1 : 0,
        tags: Array.from(this.productData.tags).join(','),
      }

      // Insert product
      const productResult = await this.apiService.addProduct(generalData);
      const id_product = productResult.data.insertId;

      // Insert image
      if (this.productData.images.length > 0) {
        for (const image of this.productData.images) {
          if (image instanceof File) {
            const imageResult = await this.apiService.addImageFile(id_product, image);
          } else {
            const imageResult = await this.apiService.addImageUrl(id_product, { img_url: image });
          }
        }
      }

      this.onReject();
      this.messageService.add({ severity: 'success', summary: 'Producto registrado', detail: `Se registro el producto ${this.productData.title}` });
      this.cleanAll();

    } catch (error) {
      this.onReject();
      if (error.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `${error.error.msg}` });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error al intentar crear el producto: ${error.message}` });
      }
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

  onConfirm() {
    this.messageService.clear('confirm');
    this.visible = false;
  }

  onReject() {
    this.messageService.clear('confirm');
    this.visible = false;
  }

  cleanAll(){
    this.onSale = true;
    this.productData.title = '';
    this.productData.description = '';
    this.selectedProductCollection = '';
    this.selectedProductCategory = '';
    this.productData.price = '';
    this.productData.stock = '';
    this.productData.weight = '';
    this.tags = [];
    this.selectedFileName = 'No file selected';
    this.selectedImages = [];
    this.previewImages = [];
    this.productData.colors = [];
    this.selectedColors = [];
  }
}
