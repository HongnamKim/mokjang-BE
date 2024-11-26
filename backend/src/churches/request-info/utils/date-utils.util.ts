export class DateUtils {
  static getStartOfDay(date: Date) {
    return date.setHours(0, 0, 0, 0);
  }

  static calculateExpiryDate(days: number) {
    return new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
  }

  static isNewDay(date1: Date, date2: Date) {
    return this.getStartOfDay(date1) > this.getStartOfDay(date2);
  }
}
