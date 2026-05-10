import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  Logger.log(
    `API listening at http://127.0.0.1:${port} (CORS → ${corsOrigins.join(', ')})`,
    'Bootstrap',
  );
}

bootstrap().catch(console.error);
