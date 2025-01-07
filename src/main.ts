import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmExceptionFilter } from './typeorm/typeorm-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  const configService = app.get(ConfigService);

  await app.listen(
    configService.get('NEST_PORT') || 3003,
    configService.getOrThrow('NEST_HOST'),
    () => {
      console.log(
        `\x1b[35mServer running on \x1b[0m\x1b[95mhttp://${configService.getOrThrow('NEST_HOST')}:${configService.get('NEST_PORT') || 3000}\x1b[0m`,
      );
    },
  );
}
bootstrap();
