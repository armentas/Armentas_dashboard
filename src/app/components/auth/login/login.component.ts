import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'src/app/shared/service/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

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

  constructor(private formBuilder: UntypedFormBuilder, private authService: AuthService, private messageService: MessageService, private router: Router) {
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
      if(data.email === '' || data.password === '')
        throw new Error('Do not leave empty fields')

      let resp = await this.authService.login(data);
      
      localStorage.setItem('userToken', resp.token);
      localStorage.setItem('userName', resp.user.name+' '+resp.user.lastname);

      this.router.navigate(['/dashboard/default']);

    } catch (error: any) {
      let message;
      (!error.error?.msg) ? message = error.message : message = error.error.msg;
      console.error(error);
      
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Login error: ${message}` });
    }
  }

}
