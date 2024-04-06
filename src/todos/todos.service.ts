import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from './entities/todo.schema';
import { Model, Types } from 'mongoose';
import { UserDetailResponseDto } from '../auth/dto/login-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { AwsS3UploadService } from '../aws-s3-upload/aws-s3-upload.service';
import { GetTodoDto } from './dto/get-todo.dto';

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

  async findAll(getTodoDto: GetTodoDto, user: UserDetailResponseDto) {
    try {
      const { page = 1, limit = 10, search, searchKeys, status } = getTodoDto;
      const skip = (Number(page) - 1) * Number(limit);
      let query = {};

      if (search && searchKeys) {
        const searchFields = searchKeys.split(',');
        const searchConditions = searchFields.map((field) => ({
          [field]: { $regex: new RegExp(search, 'i') }, // Case insensitive search
        }));
        query = { $or: searchConditions };
      }

      if (status) {
        query = { ...query, status };
      }

      query = { ...query, userId: user._id };

      const total = await this.todoModel.countDocuments(query);
      const langs = await this.todoModel.find(query)
        .skip(skip)
        .limit(limit)
        .exec();

      const meta = {
        page: Number(page),
        perPage: Number(limit),
        total,
      };

      return { data: langs, meta };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: Types.ObjectId, user: UserDetailResponseDto) {
    try {
      return await this.todoModel.findOne({ _id: id, userId: user._id });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(id: Types.ObjectId, updateTodoDto: UpdateTodoDto, file: Express.Multer.File | undefined | string, user: UserDetailResponseDto) {
    try {

      let imageUrl = undefined;

      const find = await this.todoModel.findOne({ _id: id, userId: user._id });

      if (file === undefined && find.imageUrl !== null && find.imageUrl !== undefined && find.imageUrl !== '' && typeof file === 'string') {
        await this.awsS3UploadService.delete(find.imageUrl);
      }

      if (file !== 'dont-touch' && file !== undefined && file !== null && file !== '' && typeof file !== 'string') {
        if (find.imageUrl) {
          await this.awsS3UploadService.delete(find.imageUrl);
        }

        const id = uuidv4();
        const key = `${id}`;
        imageUrl = await this.awsS3UploadService.upload(file as Express.Multer.File, key);
      }

      const updatedTodo = await this.todoModel.findOneAndUpdate(
        { _id: id, userId: user._id },
        {
          ...updateTodoDto,
          imageUrl: imageUrl ? imageUrl : null,
        },
        { new: true }
      );

      if (!updatedTodo) {
        throw new BadRequestException('Todo not found');
      }

      return updatedTodo;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: Types.ObjectId, user: UserDetailResponseDto) {
    try {

      const deletedTodo = await this.todoModel.findOneAndDelete({ _id: id, userId: user._id });

      if (!deletedTodo) {
        throw new BadRequestException('Todo not found');
      }

      await this.awsS3UploadService.delete(deletedTodo.imageUrl);

      return deletedTodo;

    } catch (e) {
      throw new BadRequestException(e.message);
    }

  }
}
