import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/shared/service/api.service';

interface Image {
  img_url: string;
  type: string;
  alt?: string;
}

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  providers: [MessageService],
})
export class CollectionsComponent implements OnInit {

  previewImages: Image;
  selectedImageFile: File;
  selectedFileName: string = 'No file selected';
  imageError: string | null = null;

  initLoading: boolean = false;
  loading: boolean = false;
  visible: boolean = false;

  collectionData: any = {};
  collectionNameList: string[] = [];
  collectionCodeList: string[] = [];

  categoryData: any = {};
  currentCategory: any = {};
  categoryNameList: string[] = [];
  categoryCodeList: string[] = [];

  colorData: any = {};
  currentColor: any = {};
  colorKeyList: string[] = [];
  colorNameList: string[] = [];

  checked: boolean = false;
  closeResult: string;
  itemSaved: boolean = false;

  editModal: boolean = true;
  editModalCategory: boolean = true;
  editModalColor: boolean = true;

  collections!: any[];
  categories: any[] = [];
  colors: any[] = [];

  selectedCollections: any[] = [];

  collectionSelected: any;
  categorySelected: any;
  colorSelected: any;

  first = 0;
  rows = 10;

  errors = {
    name: '',
    code: '',
    title: '',
    description: '',
    image: '',
    color_key: '',
    hexCode: ''
  };

  tooltipMessage = {
    collectionName: 'Name of the collection that will appear in the store.',
    collectionTitle: 'Title of the collection which will be visible in the sales section of the collection.',
    collectionCode: 'Element used to create part of the SKU of the product, this will only have 2 alphabetic characters and will be unique.',
    collectionDescription: 'Description of the collection, this will be in the sales section of the collection.',
    collectionImage: 'This image will be the one that will be visible as a banner in the sales section of this collection, the dimensions must be 1370x400',
    categoryName: 'Name of the category, must be unique.',
    categoryCode: 'Element used to create part of the SKU of the product, this will only have 2 alphabetic characters and will be unique.',
    colorName: 'Name of the color, must be unique.',
    colorKey: 'This element will only have 2 alphabetic characters and will be unique.',
  }

  constructor(private apiService: ApiService, private messageService: MessageService, private modalService: NgbModal) { }

  async ngOnInit() {
    this.initLoading = true;
    await this.loadCollections();
    this.initLoading = false;
  }

  async loadCollections() {
    try {
      const products = await this.apiService.getAllFullProduct();
      const collections = await this.apiService.getAllCollections();
      const categories = await this.apiService.getAllCategories();
      const colors = await this.apiService.getAllColors();

      this.collections = collections.data.map(col => {
        const amountProduct = products.data.filter(pro => {
          const productCode = pro.sku.slice(-4, -2);
          return productCode === col.code;
        });
        return { ...col, products: amountProduct.length }
      });
      this.categories = categories.data.map(cat => {
        const amountProduct = products.data.filter(pro => {
          const productCode = pro.sku.slice(-2);
          return productCode === cat.code;
        });
        return { ...cat, products: amountProduct.length }
      });
      this.colors = colors.data;

      this.collectionNameList = this.collections.map(col => col.name.toLowerCase());
      this.collectionCodeList = this.collections.map(col => col.code.toLowerCase());

      this.categoryNameList = this.categories.map(cat => cat.name.toLowerCase());
      this.categoryCodeList = this.categories.map(cat => cat.code.toLowerCase());

      this.colorKeyList = this.colors.map(col => col.color_key.toLowerCase());
      this.colorNameList = this.colors.map(col => col.name.toLowerCase());

    } catch (error) {
      if(error.error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
      else{
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      }
    }
  }

  validateName(list: string[], name: string) {
    if (list.includes(name.toLowerCase())) {
      this.errors.name = 'This name already exists.';
    } else {
      this.errors.name = '';
    }
  }

  validateCode(list: string[], code: string) {
    if (list.includes(code.toLowerCase())) {
      this.errors.code = 'This code already exists.';
    } else {
      this.errors.code = '';
    }
  }

  validateKey() {
    if (this.colorKeyList.includes(this.colorData.color_key.toLowerCase())) {
      this.errors.color_key = 'This color key already exists.';
    } else {
      this.errors.color_key = '';
    }
  }

  updateHexCode() {
    this.colorData.hexCode = this.colorData.hexCode;
  }

  pageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
  }

  showConfirmCategory(category: any) {
    this.categorySelected = category;

    if (!this.visible) {
      this.messageService.add({ key: 'confirmCategory', sticky: true, severity: 'warn', summary: `You are about to delete this category, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  showConfirmColor(color: any) {
    this.colorSelected = color;

    if (!this.visible) {
      this.messageService.add({ key: 'confirmColor', sticky: true, severity: 'warn', summary: `You are about to delete this color, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  showConfirm(collection: any) {
    this.collectionSelected = collection;

    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'warn', summary: `You are about to delete this collection, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  showConfirmAllDelete(selectedCollections: any) {
    this.selectedCollections = selectedCollections.filter(col => col.code !== 'GG');
    const amount = selectedCollections.length;    
    console.log(this.selectedCollections);
    
    if (!this.visible) {
      this.messageService.add({ key: 'confirmAllDelete', sticky: true, severity: 'warn', summary: `You are about to delete ${amount} collections, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  async onConfirmCategory() {
    try {
      if (this.categorySelected.products > 0) {
        this.messageService.add({ severity: 'error', summary: 'Error when trying to remove category', detail: `The category you want to remove has related products, you must first remove the products` });
        this.messageService.clear('confirmCategory');
      } else {
        const result = await this.apiService.deleteCategory(this.categorySelected.id);

        if (result.data.affectedRows !== 0) {
          this.messageService.add({ severity: 'success', summary: 'Category removed', detail: `The category was correctly removed` });
          this.messageService.clear('confirmCategory');

          this.reload();
        }
      }
      this.visible = false;

    } catch (error) {
      this.messageService.clear('confirmCategory');
      if (error.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: ` ${error.error.msg}` });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
    }
  }

  async onConfirmColor() {
    try {
      const result = await this.apiService.deleteColor(this.colorSelected.id);

      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Color removed', detail: `The color was correctly removed` });
        this.messageService.clear('confirmColor');

        this.reload();
      }

      this.visible = false;

    } catch (error) {
      this.messageService.clear('confirmColor');
      if (error.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: ` ${error.error.msg}` });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
    }
  }

  async onConfirm() {
    try {
      if (this.collectionSelected.products > 0) {
        this.messageService.add({ severity: 'error', summary: 'Error when trying to remove collection', detail: `The collection you want to remove has related products, you must first remove the products` });
        this.messageService.clear('confirm');
      } else {
        const result = await this.apiService.deleteCollection(this.collectionSelected.id);

        if (result.data.affectedRows !== 0) {
          this.messageService.add({ severity: 'success', summary: 'Collection removed', detail: `The collection was correctly removed` });
          this.messageService.clear('confirm');

          this.reload();
        }
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
      let noRemoved = 0;
      for (let index = 0; index < this.selectedCollections.length; index++) {
        if (this.selectedCollections[index].products > 0) {
          noRemoved++;
          continue;
        }
        const result = await this.apiService.deleteCollection(this.selectedCollections[index].id);
      }
      this.selectedCollections = [];
      if (noRemoved > 0) {
        this.messageService.add({ severity: 'warn', summary: 'Removed collections', detail: `Some collections could not be removed because they have related products` });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Removed collections', detail: `Collections were correctly removed` });
      }
      this.messageService.clear('confirmAllDelete');

      this.reload();
      this.visible = false;

    } catch (error) {
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
    this.messageService.clear('confirmCategory');
    this.messageService.clear('confirmColor');
    this.visible = false;
  }

  reload() {
    this.loadCollections();
  }

  async open(content: any, id?: number) {
    Object.keys(this.errors).forEach(key => this.errors[key] = '');
    this.selectedFileName = 'No file selected';

    if (id) {
      this.editModal = true;

      try {
        const result = await this.apiService.getCollection(id);

        this.collectionData.id = result.data[0].id;
        this.collectionData.name = result.data[0].name;
        this.collectionData.code = result.data[0].code;
        this.collectionData.title = result.data[0].title;
        this.collectionData.description = result.data[0].description;
        this.collectionData.image = result.data[0].image;
        this.collectionData.active = result.data[0].active === 1 ? this.checked = true : this.checked = false;
        this.collectionData.products = this.collections.filter(prod => prod.id == id)[0].products;


      } catch (error) {
        if(error.error)
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
        else{
          console.error(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
        }
      }
    } else {
      this.editModal = false;

      this.collectionData = {
        name: '',
        code: '',
        title: '',
        description: '',
        image: '',
        active: true
      };

    }


    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl', centered: true, scrollable: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.resetValues();

      if (this.itemSaved)
        this.reload();
    });
  }

  async openModalCategory(content: any, id?: number) {
    Object.keys(this.errors).forEach(key => this.errors[key] = '');

    if (id) {
      this.editModalCategory = true;

      try {
        const [selectedCategory] = this.categories.filter(cat => cat.id == id);

        this.categoryData.id = selectedCategory.id;
        this.categoryData.name = selectedCategory.name;
        this.categoryData.code = selectedCategory.code;
        this.categoryData.products = selectedCategory.products;
        this.categoryData.active = selectedCategory.active === 1 ? true : false;

        this.currentCategory = { ...this.categoryData };

      } catch (error) {
        if(error.error)
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
        else{
          console.error(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
        }
      }
    } else {
      this.editModalCategory = false;

      this.categoryData = {
        name: '',
        code: '',
        active: true
      };
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, scrollable: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.resetValues();

      if (this.itemSaved)
        this.reload();
    });
  }

  async openModalColor(content: any, id?: number) {
    Object.keys(this.errors).forEach(key => this.errors[key] = '');

    if (id) {
      this.editModalColor = true;

      try {
        const [selectedColor] = this.colors.filter(col => col.id == id);

        this.colorData.id = selectedColor.id;
        this.colorData.name = selectedColor.name;
        this.colorData.color_key = selectedColor.color_key;
        this.colorData.hexCode = selectedColor.hexCode;

        this.currentColor = { ...this.colorData };

      } catch (error) {
        if(error.error)
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
        else{
          console.error(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
        }
      }
    } else {
      this.editModalColor = false;

      this.colorData = {
        name: '',
        color_key: '',
        hexCode: ''
      };
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, scrollable: true }).result.then((result) => {
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

  resetValues() {
    this.collectionSelected = {};
    this.collectionData = {};
    this.categoryData = {};
    this.colorData = {};
  }

  validateInput(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Solo permite letras A-Z y a-z
    if (!/[a-zA-Z]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      const file = input.files[0];

      if (file) {
        const img = new Image();
        const fileReader = new FileReader();
        this.selectedFileName = file.name;
        this.selectedImageFile = file;

        fileReader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            img.src = e.target.result as string;

            img.onload = () => {
              const width = img.width;
              const height = img.height;

              // Validar dimensiones de la imagen
              if (width === 1370 && height === 400) {
                this.imageError = null;
                console.log('Image dimensions are valid.');
                this.collectionData.image = e.target.result
              } else {
                this.imageError = `Invalid dimensions: ${width}x${height}. Required: 1370x400.`;
              }
            };

            img.onerror = () => {
              this.imageError = 'Invalid image file.';
            };
          }
        };

        fileReader.readAsDataURL(file);
      }
    }
  }

  async saveData() {
    this.loading = true;
    // Limpiar errores previos
    Object.keys(this.errors).forEach(key => this.errors[key] = '');
    try {
      const requiredFields = [
        { field: 'name', message: 'Field required.' },
        { field: 'code', message: 'Field required.' },
        { field: 'title', message: 'Field required.' },
        { field: 'description', message: 'Field required.' },
        { field: 'image', message: 'Field required.' }
      ];

      // Verificar si hay campos vacíos y asignar mensajes de error
      let hasError = false;
      requiredFields.forEach(({ field, message }) => {
        if (!this.collectionData[field] || this.collectionData[field].trim() === '') {
          this.errors[field] = message;
          hasError = true;
        }
      });

      // Si hay errores, no continuar
      if (hasError) {
        console.warn('No se pudo guardar porque hay campos obligatorios vacíos.');
        this.loading = false;
        return;
      }

      delete this.collectionData.products;

      if (!this.collectionData.image.includes('https://')) {
        const response = await this.apiService.addImageFileCollection(this.selectedImageFile);
        this.collectionData.image = response.data;
      }

      this.collectionData.code = this.collectionData.code.toUpperCase();

      if (this.editModal) {
        console.log('Editando colección:', this.collectionData);
        const resp = await this.apiService.updateCollection(this.collectionData.id, this.collectionData);
        console.log(resp.data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The collection ${this.collectionData.name} has been successfully updated` });
      } else {
        console.log('Creando nueva colección:', this.collectionData);
        const resp = await this.apiService.addCollection(this.collectionData);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The collection ${this.collectionData.name} has been successfully added` });
        console.log(resp.data);
      }
      this.itemSaved = true;
      this.loading = false;
      this.modalService.dismissAll();
    } catch (error) {
      if(error.error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
      else{
        console.error('Error al guardar los datos:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
      this.loading = false;
    }
  }

  async saveCategoryData() {
    this.loading = true;
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
        if (!this.categoryData[field] || this.categoryData[field].trim() === '') {
          this.errors[field] = message;
          hasError = true;
        } else {
          if (field === 'name' && this.currentCategory.name !== this.categoryData.name) {
            this.validateName(this.categoryNameList, this.categoryData.name);
          }
          if (field === 'code' && !this.editModalCategory) {
            this.validateCode(this.categoryCodeList, this.categoryData.code);
          }
          if (this.errors[field] !== '') {
            hasError = true;
          }
        }
      });

      // Si hay errores, no continuar
      if (hasError) {
        console.warn('No se pudo guardar porque hay campos obligatorios vacíos.');
        this.loading = false;
        return;
      }

      const data = {
        name: this.categoryData.name,
        code: this.categoryData.code.toUpperCase(),
        active: this.categoryData.active ? 1 : 0
      }

      if (this.editModalCategory) {
        console.log('Editando categoria:', this.categoryData);
        const resp = await this.apiService.updateCategory(this.categoryData.id, data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The category ${this.categoryData.name} has been successfully updated` });
      } else {
        console.log('Creando nueva categoria:', this.categoryData);
        const resp = await this.apiService.addCategory(data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The category ${this.categoryData.name} has been successfully added` });
      }

      this.itemSaved = true;
      this.loading = false;
      this.modalService.dismissAll();
    } catch (error) {
      this.loading = false;
      if(error.error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
      else{
        console.error('Error al guardar los datos:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
    }
  }

  async saveColorData() {
    this.loading = true;
    // Limpiar errores previos
    Object.keys(this.errors).forEach(key => this.errors[key] = '');
    try {
      const requiredFields = [
        { field: 'name', message: 'Field required.' },
        { field: 'color_key', message: 'Field required.' },
        { field: 'hexCode', message: 'Field required.' },
      ];

      // Verificar si hay campos vacíos y asignar mensajes de error
      let hasError = false;
      requiredFields.forEach(({ field, message }) => {
        if (!this.colorData[field] || this.colorData[field].trim() === '') {
          this.errors[field] = message;
          hasError = true;
        } else {
          if (field === 'name' && this.currentColor.name !== this.colorData.name) {
            this.validateName(this.colorNameList, this.colorData.name);
          }
          if (field === 'color_key' && this.currentColor.color_key !== this.colorData.color_key) {
            this.validateKey();
          }
          if (this.errors[field] !== '') {
            hasError = true;
          }
        }
      });

      // Si hay errores, no continuar
      if (hasError) {
        console.warn('No se pudo guardar porque hay campos obligatorios vacíos.');
        this.loading = false;
        return;
      }

      const data = {
        name: this.colorData.name,
        color_key: this.colorData.color_key.toUpperCase(),
        hexCode: this.colorData.hexCode
      }

      if (this.editModalColor) {
        console.log('Editando color:', this.colorData);
        const resp = await this.apiService.updateColor(this.colorData.id, data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The category ${this.categoryData.name} has been successfully updated` });
      } else {
        console.log('Creando nuevo color:', this.colorData);
        const resp = await this.apiService.addColor(data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `The category ${this.categoryData.name} has been successfully added` });
      }

      this.itemSaved = true;
      this.loading = false;
      this.modalService.dismissAll();
    } catch (error) {
      this.loading = false;
      if(error.error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
      else{
        console.error('Error al guardar los datos:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `An error occurred: ${error.message}` });
      }
    }
  }
}
