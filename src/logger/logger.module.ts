import { Module } from '@nestjs/common';
import { AppLogger } from './AppLogger';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
