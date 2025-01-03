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
      permissionRead: ['allow'],
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
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error: There are empty fields in the form.` });
      return;
    }

    if (accountForm.value.password !== accountForm.value.confirmPwd) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Passwords do not match.` });
      return;
    }

    const data: any = { ...accountForm.value };  // Copia los datos del formulario

    // Elimina los campos de permisos del clon
    delete data.confirmPwd;
    delete data.permissionRead;
    delete data.permissionAdd;
    delete data.permissionUpdate;
    delete data.permissionDelete;

    // Crear un nuevo objeto con los datos y el string concatenado de permisos
    const userObject = {
      ...data,
      permissions: this.getPermissionsString(accountForm),
    };

    try {
      const result = await this.authService.register(userObject);
      
      this.messageService.add({ severity: 'success', summary: 'Registered User', detail: `${result.msg}` });
      this.resetForm();

    } catch (error) {
      this.resetForm();
      
      if(error.error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.msg });
      else{
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      }
    }
  }

  getPermissionsString(accountForm: any): string {
    let permissionList: string[] = [];

    if (accountForm.get('permissionRead').value === 'allow')
      permissionList.push('Read');
    if (accountForm.get('permissionAdd').value === 'allow')
      permissionList.push('Create');
    if (accountForm.get('permissionUpdate').value === 'allow')
      permissionList.push('Update');
    if (accountForm.get('permissionDelete').value === 'allow')
      permissionList.push('Delete');

    return permissionList.join(',');
  }

  resetForm(){
    this.accountForm.reset({
      name: '',
      lastname: '',
      email: '',
      password: '',
      confirmPwd: '',
      permissionRead: 'allow',
      permissionAdd: 'deny',
      permissionUpdate: 'deny',
      permissionDelete: 'deny',
    });
  }
}


