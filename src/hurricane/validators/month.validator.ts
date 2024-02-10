import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class IsMonthAbbreviation implements PipeTransform<string, string> {
  private readonly months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  /**
   * Transforms the input value into a valid month abbreviation.
   * @param {string} value - The value to be transformed.
   * @param {ArgumentMetadata} metadata - The metadata about the value.
   * @returns {string} The transformed month abbreviation.
   * @throws {BadRequestException} If the value is not a valid month abbreviation.
   */
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!this.months.includes(value)) {
      throw new BadRequestException(
        `${metadata.data} must be a valid month abbreviation (e.g., Jan, Feb, etc.)`,
      );
    }
    return value;
  }
}
