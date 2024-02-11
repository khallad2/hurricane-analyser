import { Test, TestingModule } from '@nestjs/testing';
import { HurricaneService } from './hurricane.service';
import { LoggerModule } from '../../logger/logger.module';
import { ConfigService } from '@nestjs/config';
import { IHurricane } from '../interfaces/IHurricane.interface';
import { hurricanesData, rowData } from '../../../test/test-mock-data';
import axios from 'axios';
import { Readable } from 'stream';

// Mocking AxiosResponse
jest.mock('axios');

describe('HurricaneService', () => {
  let service: HurricaneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [HurricaneService, ConfigService],
    }).compile();

    service = module.get<HurricaneService>(HurricaneService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHurricanes', () => {
    it('should retrieve all hurricane data successfully', async () => {
      // Mocking loadDataFromUrl
      jest
        .spyOn(service, 'loadDataFromUrl')
        .mockResolvedValue('Month,Average\nJan,0.5');

      // Mocking parseData
      jest.spyOn(service, 'parseData').mockResolvedValue({
        Jan: { Average: 0.5 },
      } as never);

      const hurricanesData = await service.getHurricanes();

      expect(hurricanesData).toEqual({
        Jan: { Average: 0.5 },
      });
    });

    it('should handle error while retrieving hurricane data', async () => {
      // Mocking loadDataFromUrl to throw an error
      jest
        .spyOn(service, 'loadDataFromUrl')
        .mockRejectedValue(new Error('Failed to fetch data'));

      // Expecting service.getHurricanes to throw an error
      await expect(service.getHurricanes()).rejects.toThrowError(
        'Failed to load hurricanes data from source. Please try again.',
      );
    });
  });

  describe('loadDataFromUrl', () => {
    it('should load data from the configured URL successfully', async () => {
      const getSpy = jest
        .spyOn(axios, 'get')
        .mockResolvedValueOnce({ data: rowData } as never);

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
      const stream = Readable.from([rowData]);
      const result = await service.parseData(stream);

      expect(result).toMatchObject(expectedResult);
    });

    // it('should handle error when parsing data', async () => {
    //   jest.spyOn(service['logger'], 'error');
    //   const stream = Readable.from('');
    //   await expect(service.parseData(stream)).rejects.toThrowError(
    //     'invalid data format',
    //   );
    // });
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

    it('should handle empty months when calculating possibility for a month', async () => {
      const expectedResult = null; // Expected value for Average = 0.5

      const result = await service.calculatePossibilityForMonth(
        'Jan',
        hurricanesData,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('hurricanePossibility', () => {
    it('should calculate the possibility of hurricanes in a given month', async () => {
      // Mocking getHurricanes method
      jest.spyOn(service, 'getHurricanes').mockResolvedValue(hurricanesData);

      // Mocking calculatePossibilityForMonth method
      jest.spyOn(service, 'calculatePossibilityForMonth').mockResolvedValue(10); // Set any expected value here

      const result = await service.hurricanePossibility('May');

      expect(result).toEqual(10); // Adjust the expectation based on the mocked value
    });

    it('should handle null hurricanes data', async () => {
      // Mocking getHurricanes method to return null
      jest.spyOn(service, 'getHurricanes').mockResolvedValue(null);

      const result = await service.hurricanePossibility('May');

      expect(result).toBeNull();
    });

    it('should handle error when getting hurricanes data', async () => {
      // Mocking getHurricanes method to throw an error
      jest
        .spyOn(service, 'getHurricanes')
        .mockRejectedValue(new Error('Failed to fetch data'));

      const result = await service.hurricanePossibility('May');

      expect(result).toBeNull();
    });
  });
});
