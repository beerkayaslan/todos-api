import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.schema';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import config from "../config";
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private jwtService: JwtService
    ) { }

    async login(loginDto: LoginDto) {
        try {

            const { email, password } = loginDto;

            const user = await this.UserModel.findOne({ email });

            if (!user) {
                throw new BadRequestException('Invalid credentials');
            }

            const isMatchPassword = await bcrypt.compare(password, user.password);

            if (!isMatchPassword) {
                throw new BadRequestException('Invalid credentials');
            }

            const { accessToken, refreshToken } = await this.generateToken({ email: user.email, _id: user._id });

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            await this.UserModel.findOneAndUpdate({ email: user.email, _id: user._id }, { refreshToken: hashedRefreshToken }, { new: true });

            const userResponseDto = new UserResponseDto();
            userResponseDto.accessToken = accessToken;
            userResponseDto.refreshToken = refreshToken;
            userResponseDto.user = {
                email: user.email,
                _id: user._id
            };

            return userResponseDto;

        } catch (e) {
            throw new BadRequestException(e.message);
        }

    }

    async register(registerDto: RegisterDto) {

        try {

            const { email, password } = registerDto;

            const user = await this.UserModel.findOne({ email });

            if (user) {
                throw new BadRequestException('User already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new this.UserModel({ email, password: hashedPassword });

            await newUser.save();

            const { accessToken, refreshToken } = await this.generateToken({ email: newUser.email, _id: newUser._id });

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            await this.UserModel.findOneAndUpdate({ email: newUser.email }, { refreshToken: hashedRefreshToken }, { new: true });

            const userResponseDto = new UserResponseDto();
            userResponseDto.accessToken = accessToken;
            userResponseDto.refreshToken = refreshToken;
            userResponseDto.user = {
                email: newUser.email,
                _id: newUser._id
            };

            return userResponseDto;

        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        try {

            const { refreshToken: responseRefreshToken } = refreshTokenDto;

            const payload = await this.jwtService.verifyAsync(responseRefreshToken, {
                secret: config().REFRESH_TOKEN_SECRET,
            });

            if (!payload) {
                throw new BadRequestException('Invalid refresh token');
            }

            const user = await this.UserModel.findOne({ email: payload.email, _id: payload._id });

            if (!user) {
                throw new BadRequestException('Invalid user');
            }

            const isMatchRefreshToken = await bcrypt.compare(responseRefreshToken, user.refreshToken);

            if (!isMatchRefreshToken) {
                throw new BadRequestException('Is not match refresh');
            }

            const { accessToken, refreshToken } = await this.generateToken({ email: user.email, _id: user._id });

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            await this.UserModel.findOneAndUpdate({ email: user.email, _id: user._id }, { refreshToken: hashedRefreshToken }, { new: true });

            const userResponseDto = new UserResponseDto();

            userResponseDto.accessToken = accessToken;
            userResponseDto.refreshToken = refreshToken;
            userResponseDto.user = {
                email: user.email,
                _id: user._id
            };

            return userResponseDto;

        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    async generateToken({ email, _id }: { email: string, _id: Types.ObjectId }) {
        try {

            const accessToken = await this.jwtService.signAsync({
                email,
                _id
            }, {
                secret: config().ACCESS_TOKEN_SECRET,
                expiresIn: config().ACCESS_TOKEN_EXPIRATION,
            });

            const refreshToken = await this.jwtService.signAsync({
                email,
                _id
            }, {
                secret: config().REFRESH_TOKEN_SECRET,
                expiresIn: config().REFRESH_TOKEN_EXPIRATION,
            });

            return { accessToken, refreshToken };

        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }
}
