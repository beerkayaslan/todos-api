import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey:false, timestamps: true, })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);