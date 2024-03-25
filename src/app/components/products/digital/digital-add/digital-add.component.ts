import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/shared/service/api.service';

interface ProductVariant {
  color: string;
  size: string;
  sku: string;
}

@Component({
  selector: 'app-digital-add',
  templateUrl: './digital-add.component.html',
  providers: [MessageService],
  styleUrls: ['./digital-add.component.scss']
})


export class DigitalAddComponent implements OnInit {

  // public Editor = ClassicEditor;
  collections: any[] = [];
  discounts: any[] = [];
  types: any[] = [];
  categories: any[] = [];

  productData: any = {};
  selectedProductType: string = '';
  selectedProductCollection: number = 0;
  selectedProductDiscount: number = 1;
  selectedProductCategory: string = '';
  onSale: string = 'true';

  tags: string[] | undefined;

  sizes: any[] = [];
  selectedSizes: string[] = [];
  selectAllSizes: boolean = false;

  colors: any[] = []
  selectedColor: any;

  tabFile: boolean = false;
  tabURL: boolean = true;
  list: number[] = [1];

  previewImages: { item: number, img_url: string }[] = [];
  files: File[] = [];

  visible: boolean = false;
  progress: number = 0;
  interval = null;


  constructor(private messageService: MessageService, private apiService: ApiService, private cdr:ChangeDetectorRef) { }

  async ngOnInit() {
    this.types = [
      { name: 'T-shirt', code: 'TSA', active: true },
      { name: 'Hoddie', code: 'HOA', active: false },
      { name: 'Sweather', code: 'SWA', active: false },
      { name: 'Tank top', code: 'TTA', active: false },
      { name: 'Mug', code: 'MUG', active: false }
    ];

    this.categories = [
      { name: 'Men', code: 'ME', active: true },
      { name: 'Women', code: 'WO', active: false },
      { name: 'Youht', code: 'SW', active: false },
      { name: 'Unisex', code: 'UN', active: false },
    ];

    this.sizes = [
      { name: 'S', code: '00S' },
      { name: 'M', code: '00M' },
      { name: 'L', code: '00L' },
      { name: 'XL', code: '0XL' },
      { name: '2XL', code: '2XL' },
      { name: '3XL', code: '3XL' }
    ];

    this.colors = [
      { name: 'Black', code: '1B', exa: '#000000', active: true },
      { name: 'White', code: '1W', exa: '#ffffff', active: false },
      { name: 'Red', code: '1R', exa: '#f60404', active: false },
      { name: 'Blue', code: '1C', exa: '#1c04f6', active: false },
      { name: 'Navy', code: '1N', exa: '#dcddc2', active: false },
      { name: 'Green', code: '1G', exa: '#0ca03d', active: false },
    ]

    await this.getCollections();
    await this.getDiscounts();
  }

  async getCollections() {
    try {
      const result = await this.apiService.getAllCollections();
      this.collections = result.data;
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error obteniendo colecciones: ${error.message}` });
    }
  }

  async getDiscounts() {
    try {
      const result = await this.apiService.getAllDiscounts();
      this.discounts = result.data;
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error obteniendo colecciones: ${error.message}` });
    }
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  toggleSizeSelection(size: string): void {
    if (this.selectedSizes.includes(size)) {
      this.selectedSizes = this.selectedSizes.filter((s) => s !== size);
    } else {
      this.selectedSizes.push(size);
    }

    this.updateIndividualSizes();
  }

  toggleAllSizes(): void {
    if (this.selectAllSizes) {
      this.selectedSizes = [];
    } else {
      this.selectedSizes = this.sizes.map(size => size.name);
    }
    this.updateIndividualSizes();

  }

  updateIndividualSizes(): void {
    this.selectAllSizes = this.selectedSizes.length === this.sizes.length;
  }

  selectColor(color: any): void {
    if (color.active) {
      this.selectedColor = color;
    }
  }

  AddItem() {
    this.list.push(this.list[this.list.length - 1] + 1);
  }

  RestItem(index: number): void {
    const deletedItem = this.list.splice(index, 1)[0];

    // Limpiar la vista previa correspondiente
    delete this.previewImages[deletedItem - 1];
  }

  switchTab(tab: string): void {
    this.tabFile = false;
    this.tabURL = false;
    this.list = [1];
    this.previewImages = [];


    if (tab === 'tabFile') {
      this.tabFile = true;
    } else if (tab === 'tabURL') {
      this.tabURL = true;
    }
  }

  // onFileChange(event: any, item: number): void {
  //   const file = event.target.files[0];

  //   if (file) {
  //     // Obtener la URL de la imagen para mostrar la vista previa
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.previewImage[item] = e.target.result;
  //     };
  //     reader.readAsDataURL(file);
  //   } else {
  //     // Limpiar la vista previa si no se selecciona un archivo
  //     this.previewImage[item] = '';
  //   }

  // }

  // onTextChange(event: any, item: number): void {
  //   const url = event.target.value;

  //   if (url) {
  //     // Asignar la URL de la imagen para mostrar la vista previa
  //     this.previewImage[item] = url;
  //   } else {
  //     // Limpiar la vista previa si la URL está vacía
  //     this.previewImage[item] = '';
  //   }
  // }

  onFileChange(event: any, item: number): void {
    const file = event.target.files[0];

    if (file) {
      // Obtener la URL de la imagen para mostrar la vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Agregar el objeto al arreglo de vista previa
        this.previewImages[item - 1] = { item, img_url: e.target.result };
      };
      reader.readAsDataURL(file);
    } else {
      // Limpiar la vista previa si no se selecciona un archivo
      this.previewImages[item - 1] = { item, img_url: '' };
    }
  }

  onTextChange(event: any, item: number): void {
    const img_url: string = event.target.value;

    if (img_url) {
      // Agregar el objeto al arreglo de vista previa
      const imgDownloable = img_url.replace(/dl=0/g, 'dl=1');
      this.previewImages[item - 1] = { item, img_url: imgDownloable };
    } else {
      // Limpiar la vista previa si la URL está vacía
      this.previewImages[item - 1] = { item, img_url: '' };
    }
  }

  padNumberWithZeros(number: number): string {
    const numberString = number.toString();
    const zerosToAdd = 8 - numberString.length;
  
    if (zerosToAdd <= 0) {
      return numberString; // No need to add zeros
    }
  
    const zeros = '0'.repeat(zerosToAdd);
    return zeros + numberString;
  }

  generateProductVariants(color: any, sizesSelected: string[], productsId: number): ProductVariant[] {
    const variants: ProductVariant[] = [];

    // Validar si sizesSelected tiene valores
    if (!sizesSelected || sizesSelected.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, seleccione al menos una talla.' });
      return variants;
    }

    // Validar si color está definido
    if (!color) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, seleccione un color.' });
      return variants;
    }

    sizesSelected.forEach((s) => {
      const stringId = this.padNumberWithZeros(productsId);
      const size = this.sizes.find(item => item.name === s);
      const sku = `FP${stringId}${this.selectedProductCategory}${this.selectedProductType}${color.code}${size.code}`;
      const variant: ProductVariant = {
        color: color.name,
        size: s,
        sku
      };
      variants.push(variant);
    });

    return variants;
  }

  getNameFromCode(code: string): string {
    const foundType = this.types.find(type => type.code === code);
    return foundType.name;
  }

  async onSubmit() {
    this.productData.type = this.selectedProductType;
    this.productData.category = this.selectedProductCategory;
    this.productData.collection = this.selectedProductCollection;
    this.productData.discount = this.selectedProductDiscount;
    this.productData.onSale = this.onSale;
    this.productData.images = this.previewImages;
    this.productData.variants = [{}];
    this.productData.tags = new Set([
      this.tags,
      this.selectedColor?.name,
      this.selectedSizes
    ]);
    

    const requiredProperties = ['title', 'description', 'type', 'category', 'collection', 'price', 'tags', 'variants', 'images'];
    const missingProperties = requiredProperties.filter(prop => !this.productData[prop] || this.productData[prop] === '' || this.productData[prop].length === 0);

    if (missingProperties.length > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Por favor, complete los siguientes campos obligatorios: ${missingProperties.join(', ')}` });
      return;
    }

    try {
      this.showConfirm()
      let generalData = {
        title: this.productData.title,
        description: this.productData.description ?? '',
        type: this.getNameFromCode(this.productData.type),
        price: this.productData.price,
        category: this.productData.category,
        sale: (this.productData.onSale === "true") ? 1 : 0,
        tags: Array.from(this.productData.tags).join(','),
        collections_id: this.productData.collection,
        discounts_id: this.productData.discount,
      }

      const productResult = await this.apiService.addProduct(generalData);
      const products_id = productResult.data.insertId;

      this.productData.variants = this.generateProductVariants(this.selectedColor, this.selectedSizes, products_id);

      const variantsIds = [];
      const imagesIds = [];

      for (const variant of this.productData.variants) {
        variant.products_id = products_id
        const variantResult = await this.apiService.addVariant(variant);
        variantsIds.push(variantResult.data.insertId);
      }

      if (this.productData.images.length > 0) {
        for (const image of this.productData.images) {
          if (image !== undefined) {
            const imageResult = await this.apiService.addImage(image);
            imagesIds.push(imageResult.data.insertId);
          }
        }


        for (const variants_id of variantsIds) {
          for (const images_id of imagesIds) {
            await this.apiService.addRelationshipVariantImage({ variants_id, images_id });
          }
        }
      }
      this.onReject();
      this.messageService.add({ severity: 'success', summary: 'Producto registrado', detail: `Se registro el producto ${this.productData.title} con ${this.productData.variants.length} variantes` });
    } catch (error) {
      this.onReject();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error obteniendo colecciones: ${error.message}` });
    }

  }

  showConfirm() {
    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'custom', summary: 'Creating variations.' });
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
