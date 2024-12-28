import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'src/app/shared/service/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { log } from 'console';
import { ApiService } from 'src/app/shared/service/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  providers: [MessageService],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: UntypedFormGroup;
  public registerForm: UntypedFormGroup;
  public active = 1;

  public closeResult: string;
  public emailConfirm: string;

  public errors = {
    email: '',
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private messageService: MessageService,
    private router: Router,
    private modalService: NgbModal) {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: [''],
      password: [''],
    })
  }


  ngOnInit() {
  }

  async loginProcess(loginForm: any) {
    const data: any = loginForm.value;

    try {
      if (data.email === '' || data.password === '')
        throw new Error('Do not leave empty fields')

      let resp = await this.authService.login(data);

      localStorage.setItem('userToken', resp.token);
      localStorage.setItem('userName', resp.user.name + ' ' + resp.user.lastname);

      this.router.navigate(['/dashboard/default']);

    } catch (error: any) {
      let message;
      (!error.error?.msg) ? message = error.message : message = error.error.msg;
      console.error(error);

      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Login error: ${message}` });
    }
  }

  open(content: any) {
    Object.keys(this.errors).forEach(key => this.errors[key] = '');
    this.emailConfirm = '';

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'sm', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  async validateEmail() {
    try {
      if(this.emailConfirm !== ''){
        const { data } = await this.authService.getEmail(this.emailConfirm); // Asegúrate de usar el valor del input

        if (data && data.length > 0) {
          console.log("Procede");
          this.errors.email = "";
        } else {
          this.errors.email = "This email is not registered in the system";
          console.warn("This email is not registered in the system");
        }
      }else{
        this.errors.email = "Field required";
      }
      
    } catch (error) {
      console.error("Error validating email:", error);
    }
  }

  async reset(){
    try {      
      if(this.errors.email == '' && this.emailConfirm !== ''){
        const response = await this.apiService.sendMailToResetPass({email: this.emailConfirm});
        console.log(response);
        
        if(response.msg.includes('successfully')){
          this.modalService.dismissAll();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Your password has been successfully reestablished.` });
        }
      }
    } catch (error) {
      console.error("A problem occurred while trying to reset the password, try again later.", error);
    }
  }
}
