/**
 * Interface representing hurricane data.
 */
export interface IMonth {
  /**
   * Represents data for each month.
   * The key is the month name and the value is an object containing data for each year.
   */
  [p: string]: number;

  // use intersection type to make sure that object can handle both types
  Average?: number & string;
}
