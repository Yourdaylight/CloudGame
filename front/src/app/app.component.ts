import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `<div>{{message}}</div>`,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  message = '';
  isCollapsed = false;
  constructor(private http: HttpClient) {
    this.http.get('/api/message')
      .subscribe((resp: any) => this.message = resp.text);
  }
}