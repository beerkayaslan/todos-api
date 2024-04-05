import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import config from './config';
import { AuthGuard } from './auth/auth.guard';

import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(config().DB_HOST, {
      dbName: config().DB_NAME,
    }),
    JwtModule.register({}),

    AuthModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class AppModule { }
