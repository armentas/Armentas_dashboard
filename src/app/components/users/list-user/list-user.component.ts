import { DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbdSortableHeader, SortEvent } from 'src/app/shared/directives/NgbdSortableHeader';
import { AuthService } from 'src/app/shared/service/auth.service';
import { TableService } from 'src/app/shared/service/table.service';
import { UserListDB, USERLISTDB } from 'src/app/shared/tables/list-users';
import { MessageService } from 'primeng/api';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.scss'],
  providers: [TableService, DecimalPipe, MessageService]
})
export class ListUserComponent implements OnInit {
  public user_list = []
  visible: boolean = false;

  userSelected: number;

  public usersList: any[] = [];
  public searchText;

  users!: any[];
  selectedUsers!: any;
  userData: any = {};

  public closeResult: string;
  itemSaved: boolean = false;

  constructor(
    public service: TableService,
    private authService: AuthService,
    private messageService: MessageService,
    private modalService: NgbModal) {
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    const users = await this.getAllUsers();
    this.users = users.data;
  }

  async getAllUsers() {
    return await this.authService.getUsers();
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

  async open(content, id: number) {

    this.userSelected = id
    try {
      const result = await this.authService.getUser(id);
      
      this.userData.name = result.data[0].name;
      this.userData.lastname = result.data[0].lastname;
      this.userData.email = result.data[0].email;
      this.userData.permission = result.data[0].permission;
      this.userData.newpassword = '';

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
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

  async saveData(){
    try {
      const result = await this.authService.updateUser(this.userSelected, this.userData);        
      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Usuario editado', detail: `Se actualizo el usuario con ID: ${this.userSelected}` });
        this.itemSaved = true;
      }
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Se produjo un error: ${error.message}` });
    }    
  }

  resetValues(){
    this.userSelected = 0;
    this.userData = {}; 
  }

  delete(id) {
    console.log(id);
  }

  showConfirm(id: number) {
    this.userSelected = id;
    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'warn', summary: `You are about to delete this user, are you sure ?`, detail: 'Confirm to proceed' });
      this.visible = true;
    }
  }

  async onConfirm() {
    try {
      const result = await this.authService.deleteUser(this.userSelected);
      console.log(result);

      if (result.data.affectedRows !== 0) {
        this.messageService.add({ severity: 'success', summary: 'Coleccion eliminada', detail: `Se elimino el usuario correctamente` });
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
    this.loadUsers();
  }


}

