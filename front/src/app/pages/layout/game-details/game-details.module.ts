import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { GameDetailsComponent } from './game-details.component';
import { NzUploadModule } from 'ng-zorro-antd/upload';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NzUploadModule,
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
