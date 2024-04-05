import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { AwsS3UploadModule } from 'src/aws-s3-upload/aws-s3-upload.module';

@Module({
  imports: [AwsS3UploadModule],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule { }
