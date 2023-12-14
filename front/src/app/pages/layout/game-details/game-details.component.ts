import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NavigateService } from 'src/app/services/navigate.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// 引入Azure存储相关的库
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss'],
})
export class GameDetailsComponent implements OnInit {
  gameInfo: any = {};
  editForm!: FormGroup;
  isVisible: boolean = false;
  isAdmin: boolean = false;
  uploading = false;
  fileList: NzUploadFile[] = [];
  username: any;
  images: { url: any, type: any }[] = [];
  // Azure Storage SAS URL
  sasUrl = 'https://medias.blob.core.windows.net/assets?si=asset&sv=2022-11-02&sr=c&sig=OA8DpIpkl1ak4ZG%2BA7BzMtIRbI6carOTxLtzAcHa9pg%3D';
  sasToken = 'si=asset&sv=2022-11-02&sr=c&sig=OA8DpIpkl1ak4ZG%2BA7BzMtIRbI6carOTxLtzAcHa9pg%3D'
  containerName = 'assets'; // Container name
  blobServiceClient: BlobServiceClient;
  containerClient: ContainerClient;
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private $message: NzMessageService,
    private navigateService: NavigateService,
    public router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.blobServiceClient = new BlobServiceClient(this.sasUrl);
    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }

  ngOnInit(): void {
    this.isAdmin = localStorage.getItem('username') === 'admin';
    this.gameInfo = JSON.parse(localStorage.getItem('gameInfo') as any);
    this.username = localStorage.getItem('username') as any;
    this.editForm = this.fb.group({
      Title: [null, [Validators.required]],
      'Original Price': [null, [Validators.required]],
      'Discounted Price': [null, [Validators.required]],
      Developer: [null, [Validators.required]],
      Publisher: [null, [Validators.required]],
      'Release Date': [null, [Validators.required]],
      'Game Description': [null, [Validators.required]],
    });
    this.loadImagesFromAzure();
  }

  // Handle the file before uploading
  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]) => {
    this.fileList = this.fileList.concat(file);
    return false; // Prevent automatic upload
  };

  // Perform the upload
  handleUpload(): void {
    this.uploading = true;
    this.fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const blob = new Blob([e.target.result], { type: file.type });
        this.uploadFileToAzure(file.name, blob);
      };
      reader.readAsArrayBuffer(file as any);
    });
  }

  // Handle file change event for drag-and-drop
  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
      console.log(file, fileList);
    }
    if (status === 'done') {
      this.$message.success(`${file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      this.$message.error(`${file.name} file upload failed.`);
    }
  }

  // Upload files to Azure Blob Storage
  async uploadFileToAzure(fileName: string, blob: Blob) {
    try {
      // Get username and title
      const username = localStorage.getItem('username');
      const title = JSON.parse(localStorage.getItem('gameInfo') as any).Title;
          // Add username and title to the file name
      const newFileName = `${title}_${username}_${fileName}`;
      // Create a new FileReader object
      const blockBlobClient = this.containerClient.getBlockBlobClient(newFileName);
      // Upload the ArrayBuffer to Azure Blob Storage
      await blockBlobClient.uploadData(blob);
      //await blockBlobClient.uploadData(file.originFileObj as Blob);
      this.$message.success(`${fileName} uploaded successfully.`);
    } catch (error) {
      this.$message.error(`Upload failed: ${error}`);
    }
    this.fileList = [];
    this.uploading = false;
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
        console.log(name);
        console.log(title);
        if (!name || name.includes(title)) {
          const blobUrl = `${containerUrl}/${name}${this.extractSasToken()}`;
          // Assuming you want to display images
          this.images.push({ url: blobUrl, type: 'image/jpeg' }); // Modify 'type' as needed
        }
      }
    } catch (error) {
      console.error('Error fetching blobs:', error);
    }
  }
  
  private extractSasToken(): string {
    // Extract the SAS token from your sasUrl
    const sasToken = this.sasUrl.split('?')[1];
    return sasToken ? `?${sasToken}` : '';
  }
  
}
