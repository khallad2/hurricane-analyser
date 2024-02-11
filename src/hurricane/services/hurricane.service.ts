import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../logger/AppLogger';
import { IHurricane } from '../interfaces/IHurricane.interface';
import axios from 'axios';
import { IMonth } from '../interfaces/IMonth.interface';
import { ITransformedData } from '../interfaces/transformed-response.interface';
import { Readable } from 'stream';

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
   * Applying Streaming to handle large data sets
   * @returns {IHurricane} The parsed hurricane data.
   * @param stream
   */
  async parseData(stream: Readable): Promise<IHurricane> {
    return new Promise<IHurricane>((resolve, reject) => {
      const headers: string[] = [];

      // Listen for the 'data' event to process each chunk of data
      stream.on('data', (chunk: Buffer) => {
        const lines: string[] = chunk.toString().trim().split('\n');

        // validate lines and headers
        if (!this.validateData(headers, lines)) {
          this.logger.error('invalid data format');
          throw new Error('invalid data format');
        }

        lines.forEach((line: string) => {
          const values: string[] = line.trim().split(',');

          // Extract month header
          // let currentMonth: string = values.shift()!.trim();
          let currentMonth: string = values?.shift()?.trim() ?? '';

          // Remove extra double quotes Then trim to
          // remove leading and trailing spaces
          currentMonth = currentMonth.replace(/"/g, '').trim();

          // Set hurricane data for the month
          this.setHurricaneDataForMonth(currentMonth, values);

          // Parse and set values for each year
          headers.forEach((year: string, index: number) => {
            year = year.replace(/"/g, '').trim(); // Remove extra double quotes
            const value: any = this.parseValue(year, values[index]);
            this.hurricaneData[currentMonth][year] = value;
          });
        });
      });

      // Listen for the 'end' event to indicate the end of data processing
      stream.on('end', () => {
        resolve(this.hurricaneData);
      });

      // Listen for the 'error' event to handle any errors that occur during data processing
      stream.on('error', (error: Error) => {
        this.handleParseError(error);
        reject(error);
      });
    });
  }

  /**
   * Validate data
   * @param headers
   * @param data
   * @private
   */
  private validateData(headers: string[] | undefined, data: string[]): boolean {
    if (data.length === 0) {
      return false;
    }
    const headerLine = data.shift();
    headers.push(...headerLine.trim().split(','));
    headers.shift(); // Remove "Month" header
    return true;
  }

  /**
   * Set hurricane Data for a given month
   * @param currentMonth
   * @param values
   * @private
   */
  private setHurricaneDataForMonth(
    currentMonth: string,
    values: string[],
  ): void {
    this.hurricaneData[currentMonth] = {
      Average: values['Average'] as never,
    };
  }

  /**
   * Parse Value
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
  private handleParseError(error: Error): void {
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
      let average: string | number = monthData['Average'];
      // if average in the data source to this month = 0.0
      // then set average to 0.01 to prevent Zero probability
      average = average === '0.00' ? 0.01 : parseFloat(monthData['Average']);
      // Calculate the probability of observing zero hurricanes
      const probabilityOfZero = Math.exp(-average);
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
      const stream = Readable.from([data]);
      return await this.parseData(stream);
    } catch (error) {
      this.logger.error(`Error getting hurricanes data: ${error.message}`);
      throw new Error(
        'Failed to load hurricanes data from source. Please try again.',
      );
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

  /**
   * Transforms the hurricanes data into the desired structure.
   * @param hurricanesData - The hurricanes data to transform.
   * @returns {ITransformedData} The transformed hurricanes' data.
   */
  transformHurricanesData(hurricanesData: IHurricane): ITransformedData {
    const transformedData: ITransformedData = {
      years: {},
      months: {},
    };
    try {
      // Extract years and months data from the input hurricanesData
      for (const month in hurricanesData) {
        if (hurricanesData.hasOwnProperty(month)) {
          const data = hurricanesData[month];
          if (typeof data === 'object' && data !== null) {
            for (const year in data) {
              if (data.hasOwnProperty(year)) {
                const value = data[year];
                if (typeof value === 'number') {
                  // Populate years object
                  if (!transformedData.years[year]) {
                    transformedData.years[year] = 0;
                  }
                  transformedData.years[year] += value;
                  // Populate months object
                  if (!transformedData.months[month]) {
                    transformedData.months[month] = 0;
                  }
                  transformedData.months[month] += value;
                }
              }
            }
          }
        }
      }
      return transformedData;
    } catch (error) {
      this.logger.error(`Error transforming hurricanes data: ${error.message}`);
      throw new Error('Failed to transform hurricanes data.');
    }
  }
}
