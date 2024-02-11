import * as fs from 'fs';
import * as path from 'path';
import { AppLogger } from './app-logger';

describe('AppLogger', () => {
  const logsDir = path.join(process.cwd(), 'logs');
  const errorLogPath = path.join(logsDir, 'error.log');
  const combinedLogPath = path.join(logsDir, 'combined.log');
  let logger: AppLogger;

  beforeAll(async () => {
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    // Ensure error.log file exists or create it
    if (!fs.existsSync(errorLogPath)) {
      fs.writeFileSync(errorLogPath, ''); // Create an empty file
    }

    // Ensure combined.log file exists or create it
    if (!fs.existsSync(combinedLogPath)) {
      fs.writeFileSync(combinedLogPath, ''); // Create an empty file
    }
  });

  beforeEach(() => {
    logger = new AppLogger();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  describe('log', () => {
    it('should write message to combined log file', async () => {
      const message = 'Test log message';
      logger.log(message);
      const logContent = await fs.promises.readFile(combinedLogPath, 'utf8');
      expect(logContent).toContain(message);
    });
  });

  describe('fatal', () => {
    it('should write message to error log file', async () => {
      const message = 'Test fatal message';
      logger.fatal(message);
      const logContent = await fs.promises.readFile(errorLogPath, 'utf8');
      expect(logContent).toContain(message);
    });
  });

  describe('error', () => {
    it('should write message to error log file', async () => {
      const message = 'Test error message';
      logger.error(message);
      const logContent = await fs.promises.readFile(errorLogPath, 'utf8');
      expect(logContent).toContain(message);
    });
  });

  describe('warn', () => {
    it('should write message to combined log file', async () => {
      const message = 'Test warn message';
      logger.warn(message);
      const logContent = await fs.promises.readFile(combinedLogPath, 'utf8');
      expect(logContent).toContain(message);
    });
  });
});
