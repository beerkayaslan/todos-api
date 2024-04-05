import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, })
export class Todo {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    status: string;

    @Prop({ required: true })
    userId: Types.ObjectId;

    @Prop({ default: null })
    imageUrl?: string | null;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);