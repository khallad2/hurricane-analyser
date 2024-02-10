import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Custom logger for logging to console and files.
 */
export class AppLogger implements LoggerService {
  private readonly errorLogPath: string = path.join(
    process.cwd(),
    'logs/error.log',
  );
  private readonly combinedLogPath: string = path.join(
    process.cwd(),
    'logs/combined.log',
  );
  private readonly logsDir: string = path.join(process.cwd(), 'logs');

  constructor() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }
  }

  /**
   * Log a message to a file.
   * @param {string} filePath - The file path.
   * @param {string} message - The message to log.
   */
  private static async logToFile(
    filePath: string,
    message: string,
  ): Promise<void> {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;

    // Asynchronously append to the log file
    await fs.promises.appendFile(filePath, logEntry, 'utf8');
  }

  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]): void {
    AppLogger.logToFile(this.combinedLogPath, message);
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]): void {
    AppLogger.logToFile(this.errorLogPath, message);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]): void {
    AppLogger.logToFile(this.errorLogPath, message);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]): void {
    AppLogger.logToFile(this.combinedLogPath, message);
  }
}
