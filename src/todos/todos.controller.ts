import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Request, UploadedFile } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/entities/user.schema';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }


  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createTodoDto: CreateTodoDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User
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
