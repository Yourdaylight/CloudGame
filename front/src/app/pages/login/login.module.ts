import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: LoginComponent,
      },
    ]),
  ],
  declarations: [LoginComponent],
  exports: [LoginComponent],
})
export class LoginModule {}
