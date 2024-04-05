import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './entities/todo.schema';
import { AwsS3UploadModule } from '../aws-s3-upload/aws-s3-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Todo.name,
        schema: TodoSchema,
      },
    ]),
    AwsS3UploadModule
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule { }
