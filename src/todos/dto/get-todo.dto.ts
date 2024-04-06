import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Min } from 'class-validator';

export class GetTodoDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @Min(1)
    @ApiProperty()
    page?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @Min(1)
    @ApiProperty()
    limit?: number;

    @IsOptional()
    @IsString()
    @ApiProperty()
    search?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    searchKeys?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    status?: string;
}