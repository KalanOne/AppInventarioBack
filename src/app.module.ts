import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { MyCustomLogger } from './typeorm/logTypeOrmConfiguration';
import { EntitiesModule } from './entities/entities.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      interceptor: { mount: true },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, //SE AGREGA + PARA CONVERTIRLO ANUMERICO
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true, //cargar automáticamente entidades
      synchronize: true, //EN PRODUCCION CAMBIAR EL VALOR A FALSE - sincroniza automáticamente las entidades
      logging: ['error', 'info', 'log', 'query', 'warn'], //EN PRODUCCION CAMBIAR EL VALOR A FALSE - muestra las consultas SQL
      logger: new MyCustomLogger(),
    }),
    EntitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
