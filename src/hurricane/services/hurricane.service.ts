import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../logger/AppLogger';
import { IHurricane } from '../interfaces/IHurricane.interface';
import axios from 'axios';
import { IMonth } from '../interfaces/IMonth.interface';

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
      const headers: string[] | undefined = this.extractHeaders(lines);

      this.validateData(headers, data);

      headers.shift(); // Remove "Month" header

      lines.forEach((line: string) => {
        const values: string[] = line.trim().split(',');
        const monthHeader: string = this.extractMonthHeader(values);

        this.setAverageForMonth(monthHeader, values);

        headers.forEach((year: string, index: number) => {
          year = JSON.parse(year);
          let value: any = values[index];
          value = this.parseValue(year, value);
          this.hurricaneData[monthHeader][year] = value;
        });
      });

      return this.hurricaneData;
    } catch (error) {
      this.handleParseError(error);
    }
  }

  /**
   * Extract header from Data
   * @param lines
   * @private
   */
  private extractHeaders(lines: string[]): string[] | undefined {
    return lines.shift()?.trim().split(',');
  }

  /**
   * Validate data
   * @param headers
   * @param data
   * @private
   */
  private validateData(headers: string[] | undefined, data: string): void {
    if (!headers || data === '') {
      this.logger.error('Invalid data format');
      throw new Error('Invalid data format');
    }
  }

  /**
   * Extract month header
   * @param values
   * @private
   */
  private extractMonthHeader(values: string[]): string {
    const month = values.shift()?.trim();
    return JSON.parse(month!.toString());
  }

  /**
   * Set Average
   * @param monthHeader
   * @param values
   * @private
   */
  private setAverageForMonth(monthHeader: string, values: string[]): void {
    this.hurricaneData[monthHeader] = {
      Average: values['Average'] as never,
    };
  }

  /**
   * Parse year
   * @param year
   * @param value
   * @private
   */
  private parseValue(year: string, value: any): any {
    return year === 'Average' ? parseFloat(value).toFixed(2) : parseInt(value);
  }

  /**
   * Handle parse error
   * @param error
   * @private
   */
  private handleParseError(error: any): void {
    this.logger.error(`Failed to parse hurricanes data - ${error.message}`);
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
      const monthData: IMonth = hurricanesData[futureMonth];

      if (!monthData) {
        return null;
      }
      // use union type to ensure type safety with more than one type
      let avg: string | number = monthData['Average'];

      // if Avg in the data source to this month = 0.0
      // then set average to 0.01 to prevent Zero probability
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
      if (!data) {
        return null;
      }
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
      if (!hurricanesData) {
        return null;
      }
      return await this.calculatePossibilityForMonth(month, hurricanesData);
    } catch (error) {
      this.logger.error(`Error getting hurricanes data: ${error.message}`);
      return null;
    }
  }
}
