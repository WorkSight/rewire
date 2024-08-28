import isNullOrUndefined from './isNullOrUndefined';

export type DateType = UTC | Date | string | number;
export enum TimeSpan { years, months, days, weeks, hours, minutes, seconds, milliseconds }
export enum eDayOfWeek { Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday }

export function getTimezoneOffset(date: Date) {
  return (date.getTimezoneOffset() * 60000);
}

const _maxValue = Date.UTC(8888, 12 - 1, 31, 0, 0, 0, 0);
const _minValue = Date.UTC(1, 1 - 1, 1, 0, 0, 0, 0);

export class UTC {
  public static readonly MaxValue: UTC = utc(_maxValue);
  public static readonly MinValue: UTC = utc(_minValue);

  public utc: number;
  constructor(dt: DateType) {
    let value = UTC.toNumber(dt);
    if (Math.floor(Math.abs(value) / 1_000_000_000) === 1) value *= 1000;
    else if (Math.floor(Math.abs(value) / 1_000_000_000_000_000) === 1) value /= 1000;
    if (value < _minValue)      value = _minValue;
    else if (value > _maxValue) value = _maxValue;
    this.utc = value;
  }

  static ymd(year: number, month: number = 1, day: number = 1, hours: number = 0, minutes: number = 0, seconds: number = 0, ms: number = 0) {
    return new UTC(Date.UTC(year, month - 1, day, hours, minutes, seconds, ms));
  }

  roundToMinutes(): UTC {
    return new UTC(Math.trunc(Math.trunc(this.utc + 0.5 * UTC.MillisecondsPerMinute) / UTC.MillisecondsPerMinute) * UTC.MillisecondsPerMinute);
  }

  get isValid() {
    return !Number.isNaN(this.utc);
  }

  valueOf() {
    return this.utc;
  }

  clone() {
    return new UTC(this.utc);
  }

  equals(utc: UTC) {
    return this.utc === utc.utc;
  }

  static toNumber(dt: DateType) {
    if (typeof ((dt as any)?.utc) === 'number') {
      return (dt as any).utc;
    }

    if (dt instanceof Date) {
      return dt.getTime();
    }

    if (typeof(dt) === 'number') {
      return dt;
    }

    if (typeof(dt) === 'string') {
      let s = dt as string;
      if (!s || (s.length === 0)) return UTC.now().utc;
      if (s[s.length - 1].toLowerCase() !== 'z') {
        if (s.length <= 10) s += 'T00:00Z';
        else s += 'Z';
      }
      return Date.parse(s);
    }

    return UTC.now().utc;
  }

  get date(): number {
    return this.utc;
  }

  get day(): number {
    return new Date(this.utc).getUTCDate();
  }

  get month(): number {
    return new Date(this.utc).getUTCMonth() + 1;
  }

  get year(): number {
    return new Date(this.utc).getUTCFullYear();
  }

  get daysInMonth(): number {
    const date = new Date(this.utc);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  }

  startOfDay() {
    this.utc = new Date(this.utc).setUTCHours(0, 0, 0, 0);
    return this;
  }

  startOfMonth() {
    const date = new Date(this.utc);
    date.setUTCDate(1);
    this.utc = date.setUTCHours(0, 0, 0, 0);
    return this;
  }

  endOfDay() {
    this.utc = new Date(this.utc).setUTCHours(23, 59, 59, 999);
    return this;
  }

  endOfMonth() {
    const date = new Date(this.utc);
    this.utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).setUTCHours(23, 59, 59, 999);
    return this;
  }

  pad(num: number, size: number = 2) {
    return String(num).padStart(size, '0');
  }

  toDateString() {
    if ((this.utc === UTC.MaxValue.utc) || (this.utc === UTC.MinValue.utc)) return '';
    const d     = new Date(this.utc);
    const year  = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day   = d.getUTCDate();
    return `${year}-${this.pad(month)}-${this.pad(day)}`;
  }

  toTimestampString() {
    return `${this.toDateString()} ${this.toTimeString()}`;
  }

  toTimeString() {
    const d       = new Date(this.utc);
    const hours   = d.getUTCHours();
    const minutes = d.getUTCMinutes();
    const seconds = d.getUTCSeconds();
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  round(amount: number, decimals: number) {
    return +amount.toFixed(decimals);
  }

  get dayOfWeek() {
    return (this.toUTCDate().getDay()) as eDayOfWeek;
  }

  add(amount: number, ts: TimeSpan = TimeSpan.days, roundTo?: number) {
    let newAmount: number;
    switch (ts) {
      case TimeSpan.years: {
        const d   = new Date(this.utc);
        newAmount = d.setUTCFullYear(d.getUTCFullYear() + amount);
        break;
      }

      case TimeSpan.months: {
        const d2  = new Date(this.utc);
        newAmount = d2.setUTCFullYear(d2.getUTCFullYear(), (d2.getUTCMonth() + amount));
        break;
      }

      default:
        newAmount = this.utc + (amount * UTC.TimeSpanToMillis[ts]);
    }

    if (!isNullOrUndefined(roundTo)) {
      newAmount = this.round(newAmount / UTC.TimeSpanToMillis[ts], roundTo) * UTC.TimeSpanToMillis[ts];
    }

    return new UTC(newAmount);
  }

  subtract(dt: DateType, ts: TimeSpan = TimeSpan.days, roundTo?: number) {
    const right  = UTC.toNumber(dt);
    const left   = this.utc;
    let result = (left - right) / UTC.TimeSpanToMillis[ts];
    if (!isNullOrUndefined(roundTo)) {
      result = this.round(result, roundTo);
    }
    return result;
  }

  subtractDate(dt: DateType, ts: TimeSpan = TimeSpan.days) {
    return Math.trunc(this.subtract(dt, ts));
  }

  static today() {
    return UTC.now().startOfDay();
  }

  static now() {
    const date = new Date();
    return new UTC(date.getTime());
  }

  static nowtz(timeZone: string) {
    const options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hourCycle: 'h23',
      timeZone: timeZone ?? 'Canada/Pacific'
    } as Intl.DateTimeFormatOptions;
    const d = new Date(Date.parse(new Intl.DateTimeFormat('en-US', options).format(Date.now())));
    return new UTC(d.getTime() - getTimezoneOffset(d));
  }

  toDate() {
    return new Date(this.utc);
  }

  toUTCDate() {
    const date = new Date(this.utc);
    return new Date(this.utc + getTimezoneOffset(date));
  }

  toString(): string {
    return new Date(this.utc).toISOString();
  }

  toJSON(): any {
    return this.toString();
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

  static get ZoneOffset() { return new Date().getTimezoneOffset() * 60000; }
}

export default function utc(dt?: DateType) {
  return (dt && new UTC(dt)) || UTC.now();
}
