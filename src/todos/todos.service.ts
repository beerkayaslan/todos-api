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
        await this.awsS3UploadService.upload(file, key);
        imageUrl = key;
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

  async update(id: Types.ObjectId, updateTodoDto: UpdateTodoDto, file: Express.Multer.File | string | undefined, user: UserDetailResponseDto) {
    try {

      let imageUrl = undefined;

      const find = await this.todoModel.findOne({ _id: id, userId: user._id });

      const imgStatus = updateTodoDto.imgStatus;

      if (imgStatus === 'remove') {
        if (find.imageUrl) {
          await this.awsS3UploadService.delete(find.imageUrl);
        }
      }

      if (imgStatus === 'new' && file !== undefined) {
        if (find.imageUrl) {
          await this.awsS3UploadService.delete(find.imageUrl);
        }

        if (file !== undefined) {
          const id = uuidv4();
          const key = `${id}`;
          await this.awsS3UploadService.upload(file as Express.Multer.File, key);
          imageUrl = key;
        }
      }

      if(imgStatus === 'dont-touch' ) {
        imageUrl = find.imageUrl;
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

  async remove(ids: string , user: UserDetailResponseDto) {
    try {

      const allId = ids.split(',');

      await allId.forEach(async (id) => {
        const deletedTodo = await this.todoModel.findOneAndDelete({ _id: id, userId: user._id });

        if (!deletedTodo) {
          throw new BadRequestException('Todo not found');
        }

        if (deletedTodo.imageUrl) {
          await this.awsS3UploadService.delete(deletedTodo.imageUrl);
        }
       
      });

      return { message: 'Todo deleted successfully' };

    } catch (e) {
      throw new BadRequestException(e.message);
    }

  }
}
