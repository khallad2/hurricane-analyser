import { RequestLoggerMiddleware } from './request-logger.middleware';
import { Request, Response } from 'express';

describe('RequestLoggerMiddleware', () => {
  let middleware: RequestLoggerMiddleware;

  beforeEach(() => {
    middleware = new RequestLoggerMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log incoming requests', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/test',
      get: jest.fn().mockReturnValue('Test User Agent'),
    } as unknown as Request; // Type cast to Request

    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    // You can add more specific assertions based on your logger implementation
    // For example, you can check if the logger method was called with the correct arguments
  });
});
