Date.prototype.getTimezoneOffset = function() {
  return 0;
};

export type DateType = Date | string | number;
export enum TimeSpan { Years, Months, Days, Weeks, Hours, Minutes, Seconds, Milliseconds }

export class UTC {
  private _dt: number;
  constructor(dt: DateType) {
    this._dt = UTC.toNumber(dt);
  }

  static toNumber(dt: DateType) {
    if (dt instanceof Date) {
      return dt.getTime();
    }

    if (typeof(dt) === 'number') {
      return dt;
    }

    return Date.parse(dt as string);
  }

  get date(): number {
    return this._dt;
  }

  startOfDay() {
    this._dt = new Date(this._dt).setUTCHours(0, 0, 0, 0);
    return this._dt;
  }

  pad(num: number, size: number = 2) {
    return String(num).padStart(size, '0');
  }

  toDateString() {
    let d     = new Date(this._dt);
    let year  = d.getUTCFullYear();
    let month = d.getUTCMonth() + 1;
    let day   = d.getUTCDate();
    return `${year}-${this.pad(month)}-${this.pad(day)}`;
  }

  toTimestampString() {
    return `${this.toDateString()} ${this.toTimeString()}`;
  }

  toTimeString() {
    let d       = new Date(this._dt);
    let hours   = d.getUTCHours();
    let minutes = d.getUTCMinutes();
    return `${this.pad(hours)}:${this.pad(minutes)}`;
  }

  round(amount: number, decimals: number) {
    return +amount.toFixed(decimals);
  }

  add(amount: number, ts: TimeSpan = TimeSpan.Days) {
    switch (ts) {
      case TimeSpan.Years:
        const d = new Date(this._dt);
        return d.setUTCFullYear(d.getUTCFullYear() + amount);

      case TimeSpan.Months:
        const d2 = new Date(this._dt);
        return d2.setUTCFullYear(d2.getUTCFullYear(), (d2.getUTCMonth() + amount));

      default:
        return this._dt + (amount * UTC.TimeSpanToMillis[ts]);
    }
  }

  subtract(dt: DateType, ts: TimeSpan = TimeSpan.Days, roundTo: number = 0) {
    let right  = UTC.toNumber(dt);
    let left   = this._dt;
    let result = (left - right) / UTC.TimeSpanToMillis[ts];
    if (roundTo > 0) {
      return this.round(result, roundTo);
    }
    return Math.trunc(result);
  }

  private static MillisecondsPerYear   = 365 * 24 * 60 * 60 * 1000;
  private static MillisecondsPerMonth  = 30.42 * 24 * 60 * 60 * 1000;
  private static MillisecondsPerWeek   = 7 * 24 * 60 * 60 * 1000;
  private static MillisecondsPerDay    = 24 * 60 * 60 * 1000;
  private static MillisecondsPerHour   = 60 * 60 * 1000;
  private static MillisecondsPerMinute = 60 * 1000;
  private static MillisecondsPerSecond = 1000;

  public static TimeSpanToMillis = {
    [TimeSpan.Years]       : UTC.MillisecondsPerYear,
    [TimeSpan.Months]      : UTC.MillisecondsPerMonth,
    [TimeSpan.Weeks]       : UTC.MillisecondsPerWeek,
    [TimeSpan.Days]        : UTC.MillisecondsPerDay,
    [TimeSpan.Hours]       : UTC.MillisecondsPerHour,
    [TimeSpan.Minutes]     : UTC.MillisecondsPerMinute,
    [TimeSpan.Seconds]     : UTC.MillisecondsPerSecond,
    [TimeSpan.Milliseconds]: 1
  };
}

export default function utc(dt?: DateType) {
  return new UTC(dt || Date.now());
}
