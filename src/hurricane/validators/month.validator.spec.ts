import { BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common/interfaces';
import { IsMonthAbbreviation } from './month.validator';

describe('IsMonthAbbreviation', () => {
  let pipe: IsMonthAbbreviation;

  beforeEach(() => {
    pipe = new IsMonthAbbreviation();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should transform valid month abbreviation', () => {
    const month = 'Jan';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: String,
      data: 'Month',
    };
    expect(pipe.transform(month, metadata)).toEqual(month);
  });

  it('should throw BadRequestException for invalid month abbreviation', () => {
    const invalidMonth = 'InvalidMonth';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: String,
      data: 'Month',
    };
    expect(() => pipe.transform(invalidMonth, metadata)).toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException with correct message for invalid month abbreviation', () => {
    const invalidMonth = 'InvalidMonth';
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: String,
      data: 'Month',
    };
    expect(() => pipe.transform(invalidMonth, metadata)).toThrowError(
      `${metadata.data} must be a valid month abbreviation (e.g., Jan, Feb, etc.)`,
    );
  });

  it('should throw BadRequestException if value is not provided', () => {
    const metadata: ArgumentMetadata = {
      type: 'param',
      metatype: String,
      data: 'Month',
    };
    expect(() => pipe.transform(undefined, metadata)).toThrow(
      BadRequestException,
    );
  });
});
