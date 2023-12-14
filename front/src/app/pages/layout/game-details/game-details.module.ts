import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { GameDetailsComponent } from './game-details.component';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzCardModule } from 'ng-zorro-antd/card';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NzUploadModule,
    NzCardModule,
    RouterModule.forChild([
      {
        path: '',
        component: GameDetailsComponent,
      },
    ]),
  ],
  declarations: [GameDetailsComponent],
  exports: [GameDetailsComponent],
})
export class GameDetailsModule {}
