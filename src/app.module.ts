import { Module, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './user/interceptors/user.interceptor';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';


@Module({
  imports: [UserModule, PrismaModule, HomeModule,
    JwtModule.register({
    global: true,
    secret: process.env.SECRET_KEYS,
    signOptions: {
      expiresIn: '3600d'
    }
  }) ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    scope: Scope.REQUEST,
    useClass: UserInterceptor
    },{
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AppModule {}
