import { MiddlewareConsumer, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { PrismaService } from './prisma.service'
import { LoggerMiddleware, logger } from './config/logger.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(logger, LoggerMiddleware)
      .forRoutes('*');
  }
}
