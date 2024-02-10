/**
 * Interface representing hurricane data.
 */
export interface IHurricane {
  /**
   * Represents data for each year.
   * The key is the year and the value is an object containing data for each month.
   */
  [month: string]: {
    /**
     * Represents data for each month within the year.
     * The key is the month abbreviation (e.g., Jan, Feb) and the value is the number of hurricanes.
     */
    [year: string]: number;
    Average: number & string;
  };
}
