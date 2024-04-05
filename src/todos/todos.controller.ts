import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UserDetailResponseDto } from 'src/auth/dto/login-response.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }


  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createTodoDto: CreateTodoDto,
    @UploadedFile(
      new ParseFilePipe({
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
  findAll() {
    return this.todosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(+id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(+id);
  }
}
