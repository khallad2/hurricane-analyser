import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HurricaneModule } from './hurricane/hurricane.module';
import { LoggerModule } from './logger/logger.module';
import { RequestLoggerMiddleware } from './hurricane/middlewares/request-logger.middleware';

@Module({
  imports: [HurricaneModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Register the middleware globally
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
