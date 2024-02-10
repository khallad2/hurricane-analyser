import { Test, TestingModule } from '@nestjs/testing';
import { HurricaneService } from './hurricane.service';
import { LoggerModule } from '../../logger/logger.module';
import { ConfigService } from '@nestjs/config';
import { IHurricane } from '../interfaces/IHurricane.interface';
import { hurricanesData, rowData } from '../../../test/test-mock-data';
import axios from 'axios';

// Mocking AxiosResponse
jest.mock('axios');

describe('HurricaneServiceService', () => {
  let service: HurricaneService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [HurricaneService, ConfigService],
    }).compile();

    service = module.get<HurricaneService>(HurricaneService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadDataFromUrl', () => {
    it('should load data from the configured URL successfully', async () => {
      const getSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: rowData });

      const result = await service.loadDataFromUrl();

      expect(getSpy).toHaveBeenCalled();
      expect(result).toBe(rowData);
    });

    it('should handle error when loading data from the URL', async () => {
      const errorMessage = 'Failed to fetch hurricanes data from the URL.';
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error(errorMessage));

      await expect(service.loadDataFromUrl()).rejects.toThrow(errorMessage);
    });
  });

  describe('parseData', () => {
    it('should parse the retrieved data into IHurricane format', async () => {
      const expectedResult: IHurricane = hurricanesData;

      const result = await service.parseData(rowData);

      expect(result).toMatchObject(expectedResult);
    });

    it('should handle error when parsing data', async () => {
      const errorMessage = 'Failed to parse hurricanes data.';
      jest.spyOn(service['logger'], 'error');

      await expect(service.parseData(null)).rejects.toThrow(errorMessage);
      await expect(service.parseData('')).rejects.toThrow(errorMessage);
      expect(service['logger'].error).toHaveBeenCalledWith(
        `Failed to parse hurricanes data - Invalid data format`,
      );
    });
  });

  describe('calculatePossibilityForMonth', () => {
    it('should calculate the possibility of hurricanes in a given month', async () => {
      const expectedResult = 9.52; // Expected value for Average = 0.5

      const result = await service.calculatePossibilityForMonth(
        'May',
        hurricanesData,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle error when calculating possibility for a month', async () => {
      const errorMessage = 'Failed to fetch hurricanes data. Please try again.';
      jest.spyOn(service['logger'], 'error');
      await expect(
        service.calculatePossibilityForMonth('Jan', hurricanesData),
      ).rejects.toThrow(errorMessage);
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Error matching hurricanes data: ' + errorMessage,
      );
    });
  });
});
