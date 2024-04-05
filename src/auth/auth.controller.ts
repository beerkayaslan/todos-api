import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('refresh')
    async refresh(@Body() refreshToken: RefreshTokenDto) {
        return this.authService.refreshToken(refreshToken);
    }
    
    @Get('me')
    async me(@Request() req) {
        return req.user;
    }

}
