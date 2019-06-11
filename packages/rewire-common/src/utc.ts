export type DateType = UTC | Date | string | number;
export enum TimeSpan { years, months, days, weeks, hours, minutes, seconds, milliseconds }

const _zoneOffset = (new Date()).getTimezoneOffset() * 60000;
const _maxValue   = Date.UTC(9999, 12, 31, 0, 0, 0, 0);
const _minValue   = Date.UTC(1, 1, 1, 0, 0, 0, 0);

export class UTC {
  public static readonly MaxValue: UTC = utc(_maxValue);
  public static readonly MinValue: UTC = utc(_minValue);

  public  utc: number;
  constructor(dt: DateType) {
    let value = UTC.toNumber(dt);
    if (value < _minValue)      value = _minValue;
    else if (value > _maxValue) value = _maxValue;
    this.utc = value;
  }

  static ymd(year: number, month: number = 1, day: number = 1, hours: number = 0, minutes: number = 0, seconds: number = 0, ms: number = 0) {
    return new UTC(Date.UTC(year, month - 1, day, hours, minutes, seconds,  ms));
  }

  valueOf() {
    return this.utc;
  }

  equals(utc: UTC) {
    return this.utc === utc.utc;
  }

  static toNumber(dt: DateType) {
    if (dt instanceof UTC) {
      return dt.utc;
    }

    if (dt instanceof Date) {
      return dt.getTime();
    }

    if (typeof(dt) === 'number') {
      return dt;
    }

    let s = dt as string;
    if (!s || (s.length === 0)) return UTC.now().utc;
    if (s[s.length - 1].toLowerCase() !== 'z') s += 'Z';
    return Date.parse(s);
  }

  get date(): number {
    return this.utc;
  }

  startOfDay() {
    this.utc = new Date(this.utc).setUTCHours(0, 0, 0, 0);
    return this;
  }

  pad(num: number, size: number = 2) {
    return String(num).padStart(size, '0');
  }

  toDateString() {
    if ((this.utc === UTC.MaxValue.utc) || (this.utc === UTC.MinValue.utc)) return '';
    let d     = new Date(this.utc);
    let year  = d.getUTCFullYear();
    let month = d.getUTCMonth() + 1;
    let day   = d.getUTCDate();
    return `${year}-${this.pad(month)}-${this.pad(day)}`;
  }

  toTimestampString() {
    return `${this.toDateString()} ${this.toTimeString()}`;
  }

  toTimeString() {
    let d       = new Date(this.utc);
    let hours   = d.getUTCHours();
    let minutes = d.getUTCMinutes();
    return `${this.pad(hours)}:${this.pad(minutes)}`;
  }

  round(amount: number, decimals: number) {
    return +amount.toFixed(decimals);
  }

  add(amount: number, ts: TimeSpan = TimeSpan.days) {
    switch (ts) {
      case TimeSpan.years:
        const d = new Date(this.utc);
        return new UTC(d.setUTCFullYear(d.getUTCFullYear() + amount));

      case TimeSpan.months:
        const d2 = new Date(this.utc);
        return new UTC(d2.setUTCFullYear(d2.getUTCFullYear(), (d2.getUTCMonth() + amount)));

      default:
        return new UTC(this.utc + (amount * UTC.TimeSpanToMillis[ts]));
    }
  }

  static now() {
    return new UTC(new Date().getTime() - _zoneOffset);
  }

  toLocalDate() {
    return new Date(this.utc + _zoneOffset);
  }

  toString(): string {
    return new Date(this.utc).toISOString();
  }

  toJSON(): any {
    return this.toString();
  }

  subtract(dt: DateType, ts: TimeSpan = TimeSpan.days, roundTo: number = 0) {
    let right  = UTC.toNumber(dt);
    let left   = this.utc;
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
    [TimeSpan.years]:        UTC.MillisecondsPerYear,
    [TimeSpan.months]:       UTC.MillisecondsPerMonth,
    [TimeSpan.weeks]:        UTC.MillisecondsPerWeek,
    [TimeSpan.days]:         UTC.MillisecondsPerDay,
    [TimeSpan.hours]:        UTC.MillisecondsPerHour,
    [TimeSpan.minutes]:      UTC.MillisecondsPerMinute,
    [TimeSpan.seconds]:      UTC.MillisecondsPerSecond,
    [TimeSpan.milliseconds]: 1
  };

  static get ZoneOffset() { return _zoneOffset; }
}

export default function utc(dt?: DateType) {
  return (dt && new UTC(dt)) || UTC.now();
}
