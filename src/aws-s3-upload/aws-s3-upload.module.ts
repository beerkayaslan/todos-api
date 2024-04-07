import { Module } from '@nestjs/common';
import { AwsS3UploadService } from './aws-s3-upload.service';
import { AwsController } from './aws-s3-upload.controller';

@Module({
  providers: [AwsS3UploadService],
  controllers: [AwsController],
  exports: [AwsS3UploadService],
})
export class AwsS3UploadModule {}
