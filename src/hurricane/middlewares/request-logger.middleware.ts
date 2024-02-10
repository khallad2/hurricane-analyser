import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../../logger/AppLogger';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new AppLogger();

  /**
   * Logs incoming requests.
   * @param {Request} req - The incoming request.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next function to be called.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '-';
    // Log the incoming request
    this.logger.log(`[${method}] ${originalUrl} - ${userAgent}`);
    next();
  }
}
