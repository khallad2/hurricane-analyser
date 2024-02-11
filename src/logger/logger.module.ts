import { Module } from '@nestjs/common';
import { AppLogger } from './app-logger';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
