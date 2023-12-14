import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NavigateService } from 'src/app/services/navigate.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// 引入Azure存储相关的库
import { BlobServiceClient, ContainerClient }from '@azure/storage-blob';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';

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

  // Azure Storage SAS URL
  sasUrl = 'https://medias.blob.core.windows.net/assets?si=asset&sv=2022-11-02&sr=c&sig=OA8DpIpkl1ak4ZG%2BA7BzMtIRbI6carOTxLtzAcHa9pg%3D';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private $message: NzMessageService,
    private navigateService: NavigateService,
    public router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.isAdmin = localStorage.getItem('username') === 'admin';
    this.gameInfo = JSON.parse(localStorage.getItem('gameInfo') as any);
    this.editForm = this.fb.group({
      Title: [null, [Validators.required]],
      'Original Price': [null, [Validators.required]],
      'Discounted Price': [null, [Validators.required]],
      Developer: [null, [Validators.required]],
      Publisher: [null, [Validators.required]],
      'Release Date': [null, [Validators.required]],
      'Game Description': [null, [Validators.required]],
    });
  }

  // Handle the file before uploading
  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]) => {
    this.fileList = this.fileList.concat(file);
    return false; // Prevent automatic upload
  };

  // Perform the upload
  handleUpload(): void {
    this.uploadFilesToAzure(this.fileList);
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
  async uploadFilesToAzure(files: NzUploadFile[]) {
    const blobServiceClient = new BlobServiceClient(this.sasUrl);
    const containerName = 'assets'; // Container name
    const containerClient = blobServiceClient.getContainerClient(containerName);

    try {
      for (const file of files) {
        const blockBlobClient = containerClient.getBlockBlobClient(file.name!);
        await blockBlobClient.uploadData(file.originFileObj as Blob);
        this.$message.success(`${file.name} uploaded successfully.`);
      }
    } catch (error) {
      this.$message.error(`Upload failed: ${error}`);
    }
  }
}
