import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HurricaneController } from '../src/hurricane/controllers/hurricane.controller';
import { AppLogger } from '../src/logger/app-logger';
import { HurricaneService } from '../src/hurricane/services/hurricane.service';
import { hurricanesData } from './test-mock-data';
import { Response } from 'express';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let controller: HurricaneController;
  let service: HurricaneService;
  // Mock the response object
  const response: Partial<Response> = {
    status: jest.fn().mockReturnThis(), // mockReturnThis is optional but can improve readability
    json: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [HurricaneController],
      providers: [
        {
          provide: HurricaneService,
          useValue: {
            getHurricanes: jest.fn(),
            hurricanePossibility: jest.fn(),
          },
        },
        {
          provide: AppLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleFixture.get<HurricaneController>(HurricaneController);
    service = moduleFixture.get(HurricaneService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hurricane Analyser Backend');
  });

  describe('getAllHurricanes', () => {
    it('should fetch all hurricanes', async () => {
      jest.spyOn(service, 'getHurricanes').mockResolvedValue(hurricanesData);

      // Call the controller method
      await controller.fetchAllHurricanes(response as Response);

      // Verify that the status method was called with OK status
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);

      // Verify that the json method was called with the expected response object
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        message: 'Hurricanes data fetched successfully',
        data: hurricanesData,
      });
    });
  });

  describe('getHurricanePossibilityForMonth', () => {
    it('should return the possibility of hurricanes for a given month', async () => {
      const month = 'May';
      const possibility = 9.52;
      jest
        .spyOn(service, 'hurricanePossibility')
        .mockResolvedValue(possibility);
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
  });
});
