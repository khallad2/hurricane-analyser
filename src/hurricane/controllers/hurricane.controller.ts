import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HurricaneService } from '../services/hurricane.service';
import { IsMonthAbbreviation } from '../validators/month.validator';
import { AppLogger } from '../../logger/AppLogger';

/**
 * Controller responsible for handling hurricane-related endpoints.
 */
@Controller('api/hurricanes')
export class HurricaneController {
  constructor(
    private readonly hurricaneService: HurricaneService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Get all historical hurricane data from the data source.
   * @returns {Promise<Response>} A Promise containing the HTTP response.
   * @param response
   */
  @Get('all')
  async getAllHurricanes(@Res() response: Response): Promise<Response> {
    try {
      const hurricanesData = await this.hurricaneService.getHurricanes();
      if (!hurricanesData) {
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to fetch hurricanes data. Please try again.',
          data: {},
        });
      }
      const transformedData =
        this.hurricaneService.transformHurricanesData(hurricanesData);
      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Hurricanes data fetched successfully',
        data: transformedData,
      });
    } catch (error) {
      this.logger.error(`Error fetching hurricanes data: ${error.message}`);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch hurricanes data. Please try again.',
        data: {},
      });
    }
  }

  /**
   * Get the possibility of hurricane occurrence in a given month.
   * @param month - Month abbreviation to predict hurricane possibility.
   * @param response
   * @returns {Promise<Response>} A Promise containing the HTTP response.
   */
  @Get('expect/:month')
  async getHurricanePossibilityForMonth(
    @Param('month', IsMonthAbbreviation) month: string,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const possibility = await this.hurricaneService.hurricanePossibility(
        month,
      );
      if (!possibility) {
        return response.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: `Could not predict hurricanes for ${month}. Not enough data.`,
        });
      }
      return response.status(HttpStatus.OK).json({
        success: true,
        message: `Possibility of hurricanes in ${month} ~ ${possibility}%`,
        data: { possibility },
      });
    } catch (error) {
      this.logger.error(
        `Error predicting hurricanes for ${month}: ${error.message}`,
      );
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to predict hurricanes for ${month}. Please try again.`,
      });
    }
  }
}
