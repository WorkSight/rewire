import utc, { DateType, UTC, TimeSpan }  from './utc';
import { mergeMap, combine as _combine } from './LQ';
import { isJSONRange, IJSONRange }       from './DateRange';

export type ITimestampRangeCreator = (new <T extends TimestampRange>(start: DateType | TimestampRange, end?: DateType, creator?: ITimestampRangeCreator) => T) | undefined;

export default class TimestampRange {
  public static readonly Empty         = new TimestampRange(UTC.MaxValue, UTC.MinValue);
  // private static millisecondsInOneDay = 24 * 60 * 60 * 1000;
  private _start: UTC;
  private _end: UTC;

  constructor(start: DateType | TimestampRange | IJSONRange | string, end?: DateType | ITimestampRangeCreator, private creator?: ITimestampRangeCreator) {
    if (!start) {
      this._start = new UTC(UTC.MinValue);
      this._end   = new UTC(UTC.MaxValue);
      return;
    }

    if (start instanceof TimestampRange) {
      this._start = start._start;
      this._end   = start._end;
      if (end instanceof TimestampRange) {
        this.creator = end as ITimestampRangeCreator;
      }
      return;
    }

    if (isJSONRange(start)) {
      return new TimestampRange(start.start, start.end);
    }

    if (typeof start === 'string') {
      if (start === 'empty' || start === 'NULL') {
        this._start = TimestampRange.Empty._start;
        this._end   = TimestampRange.Empty._end;
        return;
      }
      const partsInput = start.replace(/"/g, '').split(',');
      if (partsInput.length === 2) {
        this._start = (new UTC(partsInput[0].substr(1).trim() + 'Z'));
        this._end   = (new UTC(partsInput[1].substr(0, partsInput[1].length - 1).trim() + 'Z'));
        if (!this._start.isValid) this._start = UTC.MinValue;
        if (!this._end.isValid)   this._end   = UTC.MaxValue;
        return;
      }
    }

    if (!end) {
      end = UTC.MaxValue;
    }

    this._start = utc(start);
    this._end   = utc(end as DateType);
  }

  create(start: DateType | TimestampRange, end?: DateType): TimestampRange {
    if (this.creator) {
      return new this.creator(start, end, this.creator);
    }

    return new TimestampRange(start, end);
  }

  valueOf() {
    return this._start.valueOf();
  }

  clone() {
    return new TimestampRange(this);
  }

  get start() { return this._start; }
  get end() { return this._end; }

  *subtract(range: TimestampRange) {
    if (!this.intersects(range)) {
      yield this;
      return;
    }

    // |-------------------| current
    //         |----|        range
    if (range._start > this._start) {
      yield this.create(this._start, range._start);
    }

    if (range._end < this._end) {
      yield this.create(range.end, this._end);
    }
  }

  toJSON() {
    return {start: this._start, end: this._end};
  }

  toUnits() {
    return this._end.subtract(this._start, TimeSpan.hours, 4);
  }

  static subtract(r1: Iterable<TimestampRange>, r2: TimestampRange | Iterable<TimestampRange>): Iterable<TimestampRange> {
    if (r2 instanceof TimestampRange) {
      r2 = [r2];
    }
    return mergeMap(r1, r2, (p1, p2) => p1.subtract(p2));
  }

  combine(range: TimestampRange): TimestampRange | undefined {
    if (!range) {
      return undefined;
    }

    if (this._start.equals(range._end)) {
      return this.create(range._start, this._end);
    }
    if (this._end.equals(range._start)) {
      return this.create(this._start, range._end);
    }
    return undefined;
  }

  static combine(r1: Iterable<TimestampRange>): Iterable<TimestampRange> {
    return _combine(r1, (p1, p2) => p1.combine(p2), [{field: 'start'}]);
  }

  endAsString() {
    return this._end.toTimestampString();
  }

  startAsString() {
    return this._start.toTimestampString();
  }

  endAsTimeString() {
    return this._end.toTimeString();
  }

  startAsTimeString() {
    return this._start.toTimeString();
  }

  toString() {
    if (this.isEmpty) return 'NULL';
    return `[${this._start.toTimestampString()}, ${this._end.toTimestampString()})`;
  }

  toTimeString() {
    if (this.isEmpty) return 'NULL';
    return `[${this._start.toTimeString()}, ${this._end.toTimeString()})`;
  }

  get isEmpty() {
    return (this._end.equals(UTC.MinValue) && this._start.equals(UTC.MaxValue));
  }

  get isValid() {
    return this.isEmpty || (this._start <= this._end);
  }

  intersects(range: TimestampRange) {
    return Math.max(this._start.date, range._start.date) < Math.min(this._end.date, range._end.date);
  }

  inRange(effective: DateType) {
    let x = utc(effective);
    return ((x >= this._start) && (x < this._end));
  }

  equals(range: TimestampRange) {
    return (this._start.equals(range._start) && this._end.equals(range._end));
  }

  intersection(range: TimestampRange) {
    if (!range || this.isEmpty) return TimestampRange.Empty;
    let r = new TimestampRange(this);

    if (range._start > r._start) r._start = range._start;
    if (range._end < r._end) r._end = range._end;
    return r.isValid && (r._start.utc !== r._end.utc) ? r : TimestampRange.Empty;
  }

  contains(range: TimestampRange) {
    return range._end <= this._end && range._start >= this._start;
  }
}
