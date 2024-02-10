import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../logger/AppLogger';
import { IHurricane } from '../interfaces/IHurricane.interface';
import axios from 'axios';

/**
 * Service responsible for managing hurricane-related operations.
 */
@Injectable()
export class HurricaneService {
  private hurricaneData: IHurricane = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Loads data from the configured URL.
   * @returns {Promise<string>} A Promise containing the fetched data.
   */
  async loadDataFromUrl(): Promise<string> {
    try {
      const url: string =
        this.configService.get<string>('SHEET_URL') ||
        'https://people.sc.fsu.edu/~jburkardt/data/csv/hurricanes.csv';
      const response: AxiosResponse<string> = await axios.get(url);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching data: ${error.message}`);
      throw new Error('Failed to fetch hurricanes data from the URL.');
    }
  }

  /**
   * Parses the retrieved data into IHurricane format.
   * @param {string} data - The data retrieved from the URL.
   * @returns {IHurricane} The parsed hurricane data.
   */
  async parseData(data: string): Promise<IHurricane> {
    try {
      const lines: string[] = data.trim().split('\n');
      const headers: string[] | undefined = lines.shift()?.trim().split(',');

      // handle empty data
      if (!headers || data === '') {
        this.logger.error('Invalid data format');
        throw new Error('Invalid data format');
      }

      // Remove "Month" header
      headers.shift();

      lines.forEach((line: string) => {
        // get each month values
        const values: string[] = line.trim().split(',');

        // get month name
        const month = values.shift()?.trim();

        // convert month name to json key
        const monthHeader: string = JSON.parse(month.toString());

        // setting average for each month
        this.hurricaneData[monthHeader] = {
          Average: values['Average'] as never,
        };

        headers.forEach((year: string, index: number) => {
          year = JSON.parse(year);
          let value: any = values[index];

          // if year === Average then parse value to float because it's not an occurrence number for year
          year === 'Average'
            ? (value = parseFloat(value).toFixed(2))
            : (value = parseInt(value));

          // if year !== Average then value is an occurrence number
          this.hurricaneData[monthHeader][year] = value;
        });
      });
      return this.hurricaneData;
    } catch (error) {
      this.logger.error(`Failed to parse hurricanes data - ${error.message}`);
      throw new Error('Failed to parse hurricanes data.');
    }
  }

  /**
   * Using the Poisson distribution formula
   * Calculates the possibility of hurricanes in a given month.
   * Assuming that Average attribute is correct and taken into consideration
   * @param {string} futureMonth - The month for which to calculate the possibility.
   * @param {IHurricane} hurricanesData - The hurricane data.
   * @returns {Promise<number | null>} A Promise containing the calculated possibility.
   */
  async calculatePossibilityForMonth(
    futureMonth: string,
    hurricanesData: IHurricane,
  ): Promise<number | null> {
    try {
      const monthData: { [p: string]: number; Average: number & string } =
        hurricanesData[futureMonth];
      if (!monthData) {
        throw new Error('Failed to fetch hurricanes data. Please try again.');
      }
      type avgType = string | number;
      let avg: avgType = monthData['Average'];
      // handle if Avg in the data source to this month = 0.0;
      avg = avg === '0.00' ? 0.01 : parseFloat(monthData['Average']);
      // Calculate the probability of observing zero hurricanes
      const probabilityOfZero = Math.exp(-avg);
      // Calculate the probability of at least one hurricane
      const probabilityOfAtLeastOne: number = 1 - probabilityOfZero;
      // return a percentage
      return parseFloat((probabilityOfAtLeastOne * 100).toFixed(2));
    } catch (error) {
      this.logger.error(`Error matching hurricanes data: ${error.message}`);
      throw new Error('Failed to fetch hurricanes data. Please try again.');
    }
  }

  /**
   * Retrieves all hurricane data.
   * @returns {Promise<IHurricane>} A Promise containing the hurricane data.
   */
  async getHurricanes(): Promise<IHurricane> {
    try {
      const data: string = await this.loadDataFromUrl();
      return this.parseData(data);
    } catch (error) {
      this.logger.error(`Error getting hurricanes data: ${error.message}`);
      throw new Error('Failed to fetch hurricanes data. Please try again.');
    }
  }

  /**
   * Calculates the possibility of hurricanes in a given month.
   * @param {string} month - The month for which to calculate the possibility.
   * @returns {Promise<number | null>} A Promise containing the calculated possibility.
   */
  async hurricanePossibility(month: string): Promise<number | null> {
    try {
      const hurricanesData: IHurricane = await this.getHurricanes();
      return await this.calculatePossibilityForMonth(month, hurricanesData);
    } catch (error) {
      this.logger.error(`Error getting hurricanes data: ${error.message}`);
      return null;
    }
  }
}
