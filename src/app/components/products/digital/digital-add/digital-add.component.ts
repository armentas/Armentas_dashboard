import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
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

  types: any[] = [];
  categories: any[] = [];
  colors: any[] = [];

  productData: any = {};
  selectedProductType: string = '';
  selectedProductCategory: string = '';
  selectedColors: any[] = [];
  onSale: string = 'true';

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

  


  constructor(private messageService: MessageService, private apiService: ApiService, private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
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
      const file = event.target.files[0];

      if (file) {
        // Agregar en la lista de imagenes
        this.selectedImages.push(file);
        // Obtener la URL de la imagen para mostrar la vista previa
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Agregar el objeto al arreglo de vista previa
          this.previewImages.push({ img_url: e.target.result, type: 'file' });
        };
        reader.readAsDataURL(file);
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
    return `AR${stringId}${this.selectedProductType}${this.selectedProductCategory}`;
  }

  getNameFromCode(object: any, code: string): string {
    const foundName = object.find(type => type.code === code);
    return foundName?.name;
  }

  async onSubmit2() {
    this.productData.type = this.selectedProductType;
    this.productData.category = this.selectedProductCategory;
    this.productData.sku = this.skuGenerator();
    this.productData.onSale = this.onSale;
    this.productData.images = this.selectedImages;
    this.productData.colors = this.selectedColors;
    this.productData.tags = new Set([
      this.tags,
      this.getNameFromCode(this.types, this.productData.type),
      this.getNameFromCode(this.categories, this.productData.category)
    ]);

    const requiredProperties = ['title', 'description', 'type', 'category', 'price', 'stock', 'tags', 'images'];
    const missingProperties = requiredProperties.filter(prop => !this.productData[prop] || this.productData[prop] === '' || this.productData[prop].length === 0);

    if (missingProperties.length > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Por favor, complete los siguientes campos obligatorios: ${missingProperties.join(', ')}` });
      return;
    }

    try {
      this.showConfirm()
      let generalData = {
        type: this.getNameFromCode(this.types, this.productData.type),
        title: this.productData.title,
        description: this.productData.description ?? '',
        sku: this.productData.sku,
        category: this.getNameFromCode(this.categories, this.productData.category),
        colors: this.productData.colors.join(','),
        price: this.productData.price,
        stock: this.productData.stock,
        sale: (this.productData.onSale === "true") ? 1 : 0,
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
    } catch (error) {
      this.onReject();
      if(error.error){
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `${error.error.msg}` });
      }else{
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
}
