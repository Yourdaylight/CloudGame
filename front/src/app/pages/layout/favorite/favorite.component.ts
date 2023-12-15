import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NavigateService } from 'src/app/services/navigate.service';
import { ApiService } from 'src/app/services/api.service';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss'],
})
export class FavoriteComponent implements OnInit {
  favoriteList: any = [];
  loading: boolean = true;
  username: any;
  images: { 
    url: any,
     type: any, 
     uploadTime:any, 
     blobUrl:any ,
     picTitle:any
    }[] = [];
  // Azure Storage SAS URL
  sasUrl = 'https://medias.blob.core.windows.net/assets?si=asset&sv=2022-11-02&sr=c&sig=OA8DpIpkl1ak4ZG%2BA7BzMtIRbI6carOTxLtzAcHa9pg%3D';
  sasToken = 'si=asset&sv=2022-11-02&sr=c&sig=OA8DpIpkl1ak4ZG%2BA7BzMtIRbI6carOTxLtzAcHa9pg%3D'
  constructor(
    private apiService: ApiService,
    private $message: NzMessageService,
    private navigateService: NavigateService,
    private http: HttpClient,
    private  modalService: NzModalService

  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') as any;
    this.loadImagesFromAzure();

  }
  
  private extractSasToken(): string {
    // Extract the SAS token from your sasUrl
    const sasToken = this.sasUrl.split('?')[1];
    return sasToken ? `?${sasToken}` : '';
  }

  previewImage(image: { url: string, type: string }) {
    let content = '';
    if (image.type.startsWith('image')) {
      content = `<img src="${image.url}" alt="Image" style="width: 100%; max-height: 600px;">`;
    } else if (image.type.startsWith('video')) {
      content = `<video src="${image.url}" controls style="width: 100%; max-height: 600px;"></video>`;
    }else if (image.type.startsWith('audio')) {
      content = `<audio src="${image.url}" controls style="width: 100%; max-height: 600px;"></video>`;
    } 
    else {
      // Handle other types as needed
    }
    this.modalService.create({
      nzTitle: 'Preview',
      nzContent: content,
      nzFooter: null
    });
  }
  
  downloadImage(url: string) {
    window.location.href = url;
  }

  async deleteImage(index: number) {
    const image = this.images[index];
    const blobUrl = image.blobUrl; // Assuming this is the URL of the blob
  
    const headers = new HttpHeaders({
      'x-ms-date': new Date().toUTCString(),
      'x-ms-version': '2022-11-02' // Use the version of Azure Storage Service you are using
    });
  
    try {
      await this.http.delete(blobUrl, { headers }).toPromise();
      // After the image is successfully deleted from Azure, remove it from the images array
      this.images.splice(index, 1);
    } catch (error) {
      console.error('Failed to delete blob:', error);
    }
  }
  async loadImagesFromAzure() {
    const containerUrl = 'https://medias.blob.core.windows.net/assets';
    const query = '?restype=container&comp=list'; // SAS token
    const fullUrl = `${containerUrl}${query}`;
  
    try {
      const response = await lastValueFrom(this.http.get(fullUrl, { responseType: 'text' }));
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, 'text/xml');
      const blobs = xmlDoc.getElementsByTagName('Blob');
  
      this.images = [];
      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const name = blob.getElementsByTagName('Name')[0].textContent || '';
        const title = JSON.parse(localStorage.getItem('gameInfo') as any).Title;
        const lastModified = blob.getElementsByTagName('Last-Modified')[0].textContent || '';
        if (!name || name.includes(this.username)) {
          // const blobUrl = `${containerUrl}/${name}${this.extractSasToken()}}`;
        const url = blob.getElementsByTagName('Url')[0].textContent || '';
        const blobUrl = `${containerUrl}/${name}${this.extractSasToken()}`;
        const picTitle = name.split('_')[0].replace('assets/', '');
          // Assuming you want to display images
          this.images.push({ 
            url: url, 
            type: 'image/jpeg',
            uploadTime: lastModified ,
            blobUrl: blobUrl,
            picTitle: picTitle
          }); // Modify 'type' as needed
        }
      }
    } catch (error) {
      console.error('Error fetching blobs:', error);
    }
  }
  
}
