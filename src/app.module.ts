import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule, ClsService } from 'nestjs-cls';
import { MyCustomLogger } from './typeorm/logTypeOrmConfiguration';
import { EntitiesModule } from './entities/entities.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/role.guard';
import { ArticlesModule } from './articles/articles.module';
import { SearchsModule } from './searchs/searchs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({
      global: true,
      interceptor: { mount: true },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService, cls: ClsService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'),
        database: configService.getOrThrow('DB_NAME'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        autoLoadEntities: true,
        synchronize: true,
        logging: ['error', 'info', 'log', 'query', 'warn'],
        logger: new MyCustomLogger(configService, cls),
      }),
      inject: [ConfigService, ClsService],
    }),
    EntitiesModule,
    UsersModule,
    AuthModule,
    ArticlesModule,
    SearchsModule,
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
  ],
})
export class AppModule {}
