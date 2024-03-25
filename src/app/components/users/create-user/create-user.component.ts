import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/shared/service/auth.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  providers: [MessageService],
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  public accountForm: UntypedFormGroup;
  public permissionForm: UntypedFormGroup;
  public active = 1;

  constructor(private formBuilder: UntypedFormBuilder, private messageService: MessageService, private authService: AuthService) {
    this.createAccountForm();
  }

  createAccountForm() {
    this.accountForm = this.formBuilder.group({
      name: [''],
      lastname: [''],
      email: [''],
      password: [''],
      confirmPwd: [''],
      permissionAdd: ['deny'],
      permissionUpdate: ['deny'],
      permissionDelete: ['deny'],
    });
  }

  ngOnInit() {
  }

  async saveUser(accountForm: any) {
    const isEmptyField = Object.values(accountForm.value).some(value => value === '' || value === null || value === undefined);

    if (isEmptyField) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error: Hay campos vacíos en el formulario.` });
      return;
    }

    if (accountForm.value.password !== accountForm.value.confirmPwd) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Las contraseñas no coinciden.` });
      return;
    }

    const data: any = { ...accountForm.value };  // Copia los datos del formulario

    // Elimina los campos de permisos del clon
    delete data.confirmPwd;
    delete data.permissionAdd;
    delete data.permissionUpdate;
    delete data.permissionDelete;

    // Crear un nuevo objeto con los datos y el string concatenado de permisos
    const userObject = {
      ...data,
      permission: this.getPermissionsString(accountForm),
    };

    try {
      const result = await this.authService.register(userObject);
      
      this.messageService.add({ severity: 'success', summary: 'Usuario Registrado', detail: `${result.msg}` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
    }
  }

  getPermissionsString(accountForm: any): string {
    let permissionList: string[] = [];

    if (accountForm.get('permissionAdd').value === 'allow')
      permissionList.push('add');
    if (accountForm.get('permissionUpdate').value === 'allow')
      permissionList.push('update');
    if (accountForm.get('permissionDelete').value === 'allow')
      permissionList.push('delete');

    return permissionList.join(',');
  }
}
