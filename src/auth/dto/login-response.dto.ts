import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class UserDetailResponseDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    _id: Types.ObjectId;
}

export class UserResponseDto {

    @ApiProperty()
    user: UserDetailResponseDto;

    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}

