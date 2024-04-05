import { Injectable } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
    PutObjectCommandOutput,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import config from '../config';

@Injectable()
export class AwsS3UploadService {
    private readonly s3Client: S3Client;
    constructor() {
        this.s3Client = new S3Client({
            region: config().AWS_S3_REGION,
            credentials: {
                accessKeyId: config().AWS_S3_ACCESS_KEY_ID,
                secretAccessKey: config().AWS_S3_SECRET_ACCESS_KEY
            }
        });
    }

    async upload(file: Express.Multer.File, key: string) {

        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/jpg') {
            const buffer = await sharp(file.buffer)
                .resize(250)
                .toBuffer();
            file.buffer = buffer;
        }

        const input: PutObjectCommandInput = {
            Bucket: config().AWS_S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        try {
            const reponse: PutObjectCommandOutput = await this.s3Client.send(new PutObjectCommand(input));

            if (reponse.$metadata.httpStatusCode === 200) {
                return `https://${config().AWS_S3_BUCKET_NAME}.s3.${config().AWS_S3_REGION}.amazonaws.com/${key}`;
            }

            throw new Error('Failed to upload file to S3');

        } catch (err) {
            console.log(err);
        }

    }

    async delete(key: string) {
        const input = {
            Bucket: config().AWS_S3_BUCKET_NAME,
            Key: key
        };

        try {
            return await this.s3Client.send(new DeleteObjectCommand(input));
        } catch (err) {
            console.log(err);
        }

    }
}
