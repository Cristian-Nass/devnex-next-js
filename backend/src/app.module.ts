import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`, `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    MailModule,
    PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
