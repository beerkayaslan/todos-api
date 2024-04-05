import { Module } from '@nestjs/common';
import { AwsS3UploadService } from './aws-s3-upload.service';

@Module({
  providers: [AwsS3UploadService],
  exports: [AwsS3UploadService],
})
export class AwsS3UploadModule {}
