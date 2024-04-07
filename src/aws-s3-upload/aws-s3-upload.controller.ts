import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AwsS3UploadService } from './aws-s3-upload.service';
import { Public } from 'src/auth/public.decorator';
import { Response } from 'express';

@ApiTags('awss3upload')
@Controller('awss3upload')
export class AwsController {
        constructor(private readonly awsService: AwsS3UploadService) { }

        @Get(':id')
        @Public()
        async findOne(@Param('id') id: string, @Res() res: Response){
            const data = await this.awsService.downloadImg(id);
            res.set('Content-Type', "image/jpeg");
            return res.send(data);
        }
    }

