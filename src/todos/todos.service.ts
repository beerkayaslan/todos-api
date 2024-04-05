import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from './entities/todo.schema';
import { Model } from 'mongoose';
import { UserDetailResponseDto } from '../auth/dto/login-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { AwsS3UploadService } from '../aws-s3-upload/aws-s3-upload.service';

@ApiTags('todos')
@Injectable()
export class TodosService {

  constructor(
    private readonly awsS3UploadService: AwsS3UploadService,
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
  ) { }

  async create(createTodoDto: CreateTodoDto, file: Express.Multer.File | undefined, user: UserDetailResponseDto) {
    try {

      let imageUrl = undefined;

      if (file) {
        const id = uuidv4();
        const key = `${id}`;
        imageUrl = await this.awsS3UploadService.upload(file, key);
      }

      const createdTodo = new this.todoModel({
        ...createTodoDto,
        imageUrl: imageUrl ? imageUrl : null,
        userId: user._id,
      });

      return await createdTodo.save();

    } catch (e) {
      throw new BadRequestException(e.message);
    }

  }

  findAll() {
    return `This action returns all todos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} todo`;
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return `This action updates a #${id} todo`;
  }

  remove(id: number) {
    return `This action removes a #${id} todo`;
  }
}
