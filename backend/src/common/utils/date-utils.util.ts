export class DateUtils {
  static getStartOfDay(date: Date) {
    return date.setHours(0, 0, 0, 0);
  }

  static calculateExpiryDate(days: number) {
    return new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
  }

  static isNewDay(now: Date, lastRequest: Date) {
    if (!lastRequest) {
      return true;
    }
    return this.getStartOfDay(now) > this.getStartOfDay(lastRequest);
  }
}
