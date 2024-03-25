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
  selector: 'app-digital-collection',
  templateUrl: './digital-collection.component.html',
  styleUrls: ['./digital-collection.component.scss'],
  providers: [TableService, DecimalPipe, MessageService],
})
export class DigitalCollectionComponent implements OnInit {

  public closeResult: string;
  public collectionsList: any[] = [];
  visible: boolean = false;
  itemSaved: boolean = false;
  collectionSelected: number;

  modelType: string = "add"
  modelTitle: string = "Add Collection";
  collectionData: any = {};

  collections!: any[];
  selectedCollections!: any;

  constructor(
    public apiService: ApiService,
    public service: TableService,
    private modalService: NgbModal,
    private messageService: MessageService,
  ) { }

  async ngOnInit() {
    await this.loadCollections();
  }

  async loadCollections() {
    const collections = await this.getAllCollections();
    this.collections = collections.data;        
  }

  // async loadCollections() {
  //   try {
  //     const collections = await this.getAllCollections();
  //     this.collectionsList = collections.data;
  
  //     // Para cada colección, obtener la cantidad de productos
  //     const promises = this.collectionsList.map(async (collection) => {
  //       try {
  //         const result = await this.apiService.getAllMyProducts(collection.id);
  //         collection.products = result.data[0].count;
  //       } catch (error) {
  //         // Manejar el error de la llamada
  //         console.error(`Error para la colección ${collection.id}: ${error.message}`);
  //       }
  //     });
  
  //     // Esperar a que todas las llamadas se completen antes de continuar
  //     await Promise.all(promises);
  
  //   } catch (error) {
  //     console.error(`Error al cargar colecciones: ${error.message}`);
  //   }
  // }

  async getAllCollections() {
    return await this.apiService.getAllCollections();
  }

  async loadProductsForCollections() {
    const promises = this.collectionsList.map(async (collection) => {
      try {
        const result = await this.apiService.getAllMyProducts(collection.id);
        collection.products = result.data[0].count;
      } catch (error) {
        // Manejar el error de la llamada
        console.error(`Error para la colección ${collection.id}: ${error.message}`);
      }
    });
  
    await Promise.all(promises);
  }

  // async loadProductsForCollections() {
  //   for (const collection of this.collectionsList) {
  //     const result = await this.apiService.getAllMyProducts(collection.id);
      
  //     collection.products = result.data[0].count;
  //   }

  // }

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

  async open(content, id: number) {
    if(id !== 0){
      this.modelType = "update";
      this.modelTitle = "Update Collection"; 
      this.collectionSelected = id
      try {
        const result = await this.apiService.getCollection(id);

        this.collectionData.name = result.data[0].name;
        this.collectionData.description = result.data[0].description;
        this.collectionData.img_url = result.data[0].img_url;
        
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
      }

    }else{
      this.modelType = "add";
    } 

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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

  async saveCollection() {
    if (this.modelType === "add") {
      const requiredProperties = ['name', 'description', 'img_url'];
      const missingProperties = requiredProperties.filter(prop => !this.collectionData[prop]);

      if (missingProperties.length > 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Por favor, complete los siguientes campos obligatorios: ${missingProperties.join(', ')}` });
        return;
      }

      try {
        const result = await this.apiService.addCollection(this.collectionData);
        if (result.data.insertId !== 0) {
          this.messageService.add({ severity: 'success', summary: 'Colleccion guardada', detail: `Se registro una nueva Coleccion con ID: ${result.data.insertId}` });
          this.itemSaved = true;
        }
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
      }
    } else {
      try {
        this.collectionData.img_url = this.collectionData.img_url.replace(/dl=0/g, 'dl=1');
        const result = await this.apiService.updateCollection(this.collectionSelected, this.collectionData);        
        if (result.data.affectedRows !== 0) {
          this.messageService.add({ severity: 'success', summary: 'Colleccion editada', detail: `Se actualizo la Coleccion con ID: ${this.collectionSelected}` });
          this.itemSaved = true;
        }
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
      }
    }
  }

  // async getMyProducts(id) {
  //   const result = await this.apiService.getAllMyProducts(id);
  //   console.log(result);
    
  // }

  showConfirm(id: number) {
    this.collectionSelected = id;
    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'warn', summary: `You are about to delete this collection, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  async onConfirm() {
    try {
      const result = await this.apiService.deleteCollection(this.collectionSelected);
      console.log(result);

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

  resetValues(){
    this.collectionSelected = 0;
    this.modelType = "add";
    this.modelTitle = "Add Collection";
    this.collectionData = {}; 
  }

  reload() {
    this.loadCollections();
  }
//  ------------------------------------------------------------------------------------------------------------------



}
