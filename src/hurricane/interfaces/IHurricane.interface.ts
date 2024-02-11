/**
 * Interface representing hurricane data.
 */
export interface IHurricane {
  /**
   * Represents data for each month.
   * The key is the year and the value is an object containing data for each month.
   */
  [month: string]: {
    /**
     * Represents data for each year at the container month.
     * The key is the month - abbreviation (e.g., Jan, Feb)
     * the value is the number of hurricanes.
     */
    [year: string]: number;
    Average?: number & string;
  };
}
