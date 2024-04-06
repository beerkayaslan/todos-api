import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserDetailResponseDto } from '../auth/dto/login-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetTodoDto } from './dto/get-todo.dto';
import { Types } from 'mongoose';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createTodoDto: CreateTodoDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB
          new FileTypeValidator({ fileType: 'image' }), // Only image files
        ],
      })
    ) file: Express.Multer.File | undefined,
    @CurrentUser() user: UserDetailResponseDto
  ) {
    return this.todosService.create(createTodoDto, file, user);
  }

  @Get()
  findAll(@Query() getTodoDto: GetTodoDto, @CurrentUser() user: UserDetailResponseDto) {
    return this.todosService.findAll(getTodoDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId, @CurrentUser() user: UserDetailResponseDto) {
    return this.todosService.findOne(id, user);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: Types.ObjectId,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB
          new FileTypeValidator({ fileType: 'image' }), // Only image files
        ],
      })
    ) file: Express.Multer.File | undefined,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: UserDetailResponseDto) {
    return this.todosService.update(id, updateTodoDto, file, user);
  }

  @Delete(':id')
  remove(@Param('id') id: Types.ObjectId, @CurrentUser() user: UserDetailResponseDto) {
    return this.todosService.remove(id, user);
  }
}
