import { Test, TestingModule } from '@nestjs/testing';
import { HurricaneController } from './hurricane.controller';
import { HurricaneService } from '../services/hurricane.service';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { LoggerModule } from '../../logger/logger.module';
import { transformedData } from '../../../test/test-mock-data';

describe('HurricaneController', () => {
  let controller: HurricaneController;
  let hurricaneService: HurricaneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      controllers: [HurricaneController],
      providers: [
        {
          provide: HurricaneService,
          useValue: {
            getHurricanes: jest.fn(),
            transformHurricanesData: jest.fn(),
            hurricanePossibility: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HurricaneController>(HurricaneController);
    hurricaneService = module.get<HurricaneService>(HurricaneService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllHurricanes', () => {
    it('should return all hurricanes data', async () => {
      jest
        .spyOn(hurricaneService, 'getHurricanes')
        .mockResolvedValue(transformedData as never);

      // Mock the response object
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(), // mockReturnThis is optional but can improve readability
        json: jest.fn(),
      };

      // Call the controller method
      await controller.fetchAllHurricanes(response as Response);
      const expected = hurricaneService.transformHurricanesData(
        response.json() as any,
      );

      // Verify that the status method was called with OK status
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);

      // Verify that the json method was called with the expected response object
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: 'Hurricanes data fetched successfully',
        data: expected,
      });
    });

    it('should handle error when fetching hurricanes data', async () => {
      const error = new Error('Failed to fetch data');
      jest.spyOn(hurricaneService, 'getHurricanes').mockRejectedValue(error);
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await controller.fetchAllHurricanes(response as Response);
      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch hurricanes data. Please try again.',
        data: {},
      });
    });
  });

  describe('getHurricanePossibilityForMonth', () => {
    it('should return the possibility of hurricanes for a given month', async () => {
      const month = 'Jan';
      const possibility = 50;
      jest
        .spyOn(hurricaneService, 'hurricanePossibility')
        .mockResolvedValue(possibility);
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await controller.getHurricanePossibilityForMonth(
        month,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: `Possibility of hurricanes in ${month} ~ ${possibility}%`,
        data: { possibility },
      });
    });

    it('should handle error when predicting hurricanes for a month', async () => {
      const month = 'Jan';
      const error = new Error('Failed to predict');
      jest
        .spyOn(hurricaneService, 'hurricanePossibility')
        .mockRejectedValue(error);
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await controller.getHurricanePossibilityForMonth(
        month,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: `Failed to predict hurricanes for ${month}. Please try again.`,
      });
    });

    it('should handle case when not enough data to predict for a month', async () => {
      const month = 'Jan';
      jest
        .spyOn(hurricaneService, 'hurricanePossibility')
        .mockResolvedValue(null);
      const response: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await controller.getHurricanePossibilityForMonth(
        month,
        response as Response,
      );
      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: `Could not predict hurricanes for ${month}. Not enough data.`,
      });
    });
  });
});
