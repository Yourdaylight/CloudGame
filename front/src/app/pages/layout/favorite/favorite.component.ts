import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NavigateService } from 'src/app/services/navigate.service';
import { ApiService } from 'src/app/services/api.service';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss'],
})
export class FavoriteComponent implements OnInit {
  favoriteList: any = [];
  loading: boolean = true;
  username: any;
  images: { url: any, type: any, uploadTime:any, blobUrl:any }[] = [];
  // Azure Storage SAS URL
  sasUrl = 'https://medias.blob.core.windows.net/assets?si=asset&sv=2022-11-02&sr=c&sig=OA8DpIpkl1ak4ZG%2BA7BzMtIRbI6carOTxLtzAcHa9pg%3D';
  sasToken = 'si=asset&sv=2022-11-02&sr=c&sig=OA8DpIpkl1ak4ZG%2BA7BzMtIRbI6carOTxLtzAcHa9pg%3D'
  constructor(
    private apiService: ApiService,
    private $message: NzMessageService,
    private navigateService: NavigateService,
    private http: HttpClient

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

  previewImage(url: string) {
    window.open(url,'_blank');
  }
  
  downloadImage(url: string) {
    window.location.href = url;
  }

  async deleteImage(index: number) {
    const image = this.images[index];
    // TODO: Delete the image from Azure
    // After the image is successfully deleted from Azure, remove it from the images array
    this.images.splice(index, 1);
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
        console.log("###########")
        const name = blob.getElementsByTagName('Name')[0].textContent || '';
        const title = JSON.parse(localStorage.getItem('gameInfo') as any).Title;
        const lastModified = blob.getElementsByTagName('Last-Modified')[0].textContent || '';

        console.log(name);
        console.log(title);
        if (!name || name.includes(this.username)) {
          // const blobUrl = `${containerUrl}/${name}${this.extractSasToken()}}`;
        const url = blob.getElementsByTagName('Url')[0].textContent || '';
        const blobUrl = `${containerUrl}/${name}${this.extractSasToken()}`;
          // Assuming you want to display images
          this.images.push({ 
            url: url, 
            type: 'image/jpeg',
            uploadTime: lastModified ,
            blobUrl: blobUrl
          }); // Modify 'type' as needed
        }
      }
    } catch (error) {
      console.error('Error fetching blobs:', error);
    }
  }
  
}
