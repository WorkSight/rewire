import utc, { DateType, TimeSpan, UTC }  from './utc';
import { mergeMap, combine as _combine } from './LQ';

export type IJSONRange        = {start: number, end: number};
export type IDateRangeCreator = (new <T extends DateRange>(start: DateType | DateRange, end?: DateType, creator?: IDateRangeCreator) => T) | undefined;

export function isJSONRange(obj: any): obj is IJSONRange {
  return obj.start && obj.end;
}

export function isDateRange(obj: any): obj is DateRange {
  return obj instanceof DateRange;
}

export default class DateRange implements Iterable<UTC> {
  public static readonly Empty = new DateRange(UTC.MaxValue, UTC.MinValue);
  private _start: UTC;
  private _end:   UTC;

  constructor(start?: DateType | DateRange | IJSONRange | string, end?: DateType | IDateRangeCreator, private creator?: IDateRangeCreator) {
    if (!start) {
      this._start = new UTC(UTC.MinValue.utc);
      this._end   = new UTC(UTC.MaxValue.utc);
      return;
    }

    if (start instanceof DateRange) {
      this._start = start._start;
      this._end   = start._end;
      if (end instanceof DateRange) {
        this.creator = end as IDateRangeCreator;
      }
      return;
    }

    if (typeof start === 'string') {
      const parts = start.replace(/"/g, '').split(',');
      if (parts.length === 2) {
        this._start = (new UTC((parts[0].substr(1).trim() + 'T00:00:00.000Z'))).startOfDay();
        this._end   = (new UTC((parts[1].substr(0, parts[1].length - 1).trim() + 'T00:00:00.000Z'))).startOfDay();
        return;
      }
    }

    if (isJSONRange(start)) {
      return new DateRange(start.start, start.end);
    }

    if (!end) {
      end = UTC.MaxValue;
    }

    this._start = new UTC(start as DateType).startOfDay();
    this._end   = new UTC(end as DateType).startOfDay();
  }

  create(start: DateType | DateRange, end?: DateType): DateRange {
    if (this.creator) {
      return new this.creator(start, end, this.creator);
    }

    return new DateRange(start, end);
  }

  valueOf() {
    return this._start.valueOf();
  }

  *[Symbol.iterator](): IterableIterator<UTC> {
    let current = this._start;
    while (current <= this._end) {
      yield current;
      current = current.add(1, TimeSpan.days);
    }
  }

  get start()  { return this._start; }
  get end()    { return this._end; }
  get length() { return this._end.subtract(this._start) + 1; }

  get isEmpty() {
    return (this._end.equals(UTC.MinValue) && this._start.equals(UTC.MaxValue));
  }

  get isValid() {
    return this.isEmpty || (this._start <= this._end);
  }

  *subtract(range2: DateRange): IterableIterator<DateRange> {
    if (!this.intersects(range2)) {
      yield this;
      return;
    }

    // |-------------------| current
    //         |----|        range
    if ((range2._start > this._start) && (range2._start <= this._end)) {
      yield this.create(this._start, range2._start.add(-1));
    }

    if ((range2._end < this._end) && (range2._end >= this._start)) {
      yield this.create(range2.end.add(1), this._end);
    }
  }

  static subtract(r1: Iterable<DateRange>, r2: DateRange | Iterable<DateRange>): Iterable<DateRange> {
    if (isDateRange(r2)) {
      r2 = [r2];
    }
    return mergeMap<DateRange, DateRange>(r1, r2, (p1, p2) => p1.subtract(p2));
  }

  combine(range: DateRange): DateRange | undefined {
    if (!range) {
      return undefined;
    }

    if (this._start.add(-1).equals(range._end)) {
      return this.create(range._start, this._end);
    }
    if (this._end.add(1).equals(range._start)) {
      return this.create(this._start, range._end);
    }
    return undefined;
  }

  static combine(r1: Iterable<DateRange>): Iterable<DateRange> {
    return _combine(r1, (c1, c2) => c1.combine(c2), [{field: 'start'}]);
  }

  endAsString() {
    return this._end.toDateString();
  }

  startAsString() {
    return this._start.toDateString();
  }

  toString() {
    if (this.isEmpty) return 'NULL';
    return `[${this._start.toDateString()}, ${this._end.toDateString()}]`;
  }

  toJSON() {
    return {start: this._start, end: this._end};
  }

  intersects(range: DateRange) {
    return ((this._start <= range._end) && (this._end >= range._start));
  }

  inRange(effective: DateType) {
    let x = utc(effective).startOfDay();
    return ((x >= this._start) && (x <= this._end));
  }

  equals(range: DateRange) {
    return ((this._start.equals(range._start)) || (this._end.equals(range._end)));
  }

  intesection(range: DateRange) {
    if (this.isEmpty) return DateRange.Empty;
    let r = new DateRange(this);

    if (range._start > r._start) r._start = range._start;
    if (range._end < r._end) r._end = range._end;
    return r.isValid ? r : DateRange.Empty;
  }

  contains(range: DateRange) {
    return range._end <= this._end && range._start >= this._start;
  }
}
