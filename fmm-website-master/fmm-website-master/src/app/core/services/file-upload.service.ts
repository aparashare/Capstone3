import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(public http: HttpClient) {
      console.log("")
   }

   fileUpload(file) : Observable<any>{
    const contentType = file.type;
    const bucket = new S3(
          {
              accessKeyId: 'AKIAXP5HM3F5PSWXPK64',
              secretAccessKey: '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',
              region: 'ap-south-1',
            
          }
      );
      const params = {
          Bucket: 'fmmimages',
          Key:  file.name,
          Body: file,
          ACL: 'public-read',
          ContentType: contentType
      };
      return Observable.create(observer => {
        bucket.upload(params, function (err, data) {
          if (err) {
            console.log('EROOR: ',JSON.stringify( err));
            observer.error(err);
          }
          console.log('File Uploaded.', data);
          observer.next(data);
          observer.complete();
        });
      });
    }
  
}

