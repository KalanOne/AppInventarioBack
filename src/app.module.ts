import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsInterceptor, ClsModule, ClsService } from 'nestjs-cls';
import { MyCustomLogger } from './typeorm/logTypeOrmConfiguration';
import { EntitiesModule } from './entities/entities.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './auth/guards/role.guard';
import { ArticlesModule } from './articles/articles.module';
import { SearchsModule } from './searchs/searchs.module';
import { UserInformationInterceptor } from './interceptors/user-information.interceptor';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ClsModule.forRoot({
      global: true,
      interceptor: { mount: true },
      middleware: { mount: true },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService, cls: ClsService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'),
        database: configService.getOrThrow('DB_NAME'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        logNotifications: true,
        autoLoadEntities: true,
        synchronize: true,
        logging: ['error', 'info', 'log', 'query', 'warn'],
        logger: MyCustomLogger.getInstance(configService, cls),
      }),
      inject: [ConfigService, ClsService],
    }),
    EntitiesModule,
    UsersModule,
    AuthModule,
    ArticlesModule,
    SearchsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInformationInterceptor,
    },
  ],
})
export class AppModule {}
