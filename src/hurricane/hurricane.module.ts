import { Module } from '@nestjs/common';
import { HurricaneService } from './services/hurricane.service';
import { HurricaneController } from './controllers/hurricane.controller';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [HurricaneController],
  providers: [HurricaneService],
})
export class HurricaneModule {}
