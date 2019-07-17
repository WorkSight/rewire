import { observable, DataSignal, property, sample, freeze, root } from 'rewire-core';
import * as deepEqual                                 from 'fast-deep-equal';

export interface IRowData {
  id: string;
  data?: any;
}

export interface IChangeTrackerContext {
  length: number;
  getRow      (index: number): IRowData | undefined;
  setRow      (index: number, value: IRowData): void;
  onHasChanges(changes: boolean): void;
  isComplete  (value: IRowData): boolean;
}

export class ArrayChangeTrackerContext implements IChangeTrackerContext {
  constructor(private _rows: IRowData[], public isComplete: (value: any) => boolean = () => true) {}

  get length() {
    return this._rows.length;
  }

  set length(value: number) {
    this._rows.length = value;
  }

  onHasChanges(value: boolean) {}

  getRow(index: number) {
    if ((index < 0) || (index >= this._rows.length)) return undefined;
    return this._rows[index];
  }

  setRow(index: number, value: IRowData): void {
    this._rows[index] = value;
  }
}

function clone(source: any, depth: number = 1) {
  if (!source || (depth === 0)) return source;
  const type = (typeof source);
  if (type !== 'object') return source;

  if (Array.isArray(source)) {
    const v: any[] = [];
    for (let index = 0; index < source.length; index++) {
      v[index] = clone(source[index], 1);
    }
    return v;
  }

  const destination = {};
  for (const key in source) {
    const value = source[key];
    if ((value === undefined) || (value === null)) {
      destination[key] = value;
      continue;
    }

    // supports cloning!!
    if (value.clone) {
      destination[key] = value.clone();
      continue;
    }

    const type = (typeof value);
    if (type === 'object') {
      destination[key] = clone(value, depth - 1);
      continue;
    }

    // scalars!!
    destination[key] = value;
  }
  return destination;
}

interface IOriginalData {
  data: {[id: string]: any};
  size: number;
}

export class ChangeTracker {
  private _hasChanges     : DataSignal<boolean>;
  private _original?      : IOriginalData;
  private _working?       : IRowData[];
  private _recalculating? : Promise<boolean>;
  private _dispose        : () => void;
  private _interval       : NodeJS.Timeout;
  constructor(private _context: IChangeTrackerContext) {
    root((dispose) => {
      this._dispose = dispose;
      this._hasChanges = property(false);
    });
  }

  public dispose() {
    this.stop();
    this._dispose && this._dispose();
    delete this._dispose;
  }

  private workingData(row: IRowData) {
    return row.data || row;
  }

  public set(rows?: IRowData[]) {
    sample(() => {
      this.setHasChanges(false);
      this._working = rows;
      const original: any = {size: 0, data: {}};
      if (!this._working) return;
      for (let index = 0; index < this._context.length; index++) {
        const row = this._context.getRow(index);
        if (!row) continue;
        const id  = row.id;
        if (!id) throw new Error(`your data must have id's to use change tracking`);
        if (!this._context.isComplete(row)) continue; // skip incomplete rows
        original.size++;
        original.data[id] = {index, data: clone(this.workingData(row), 2)};
      }
      this._original = original;
    });
  }

  public commit() {
    this.set(this._working);
  }

  public revert() {
    freeze(() => {
      if (!this._working || !this._original) return;
      this.setHasChanges(false);
      this._working!.length = this._original.size;
      for (const value of Object.values(this._original.data) as any[]) {
        const original: any = this._context.getRow(value.index);
        console.warn(original);
        const theClone: any = clone(value.data, 2);
        this._context.setRow(value.index, theClone);
        console.log(theClone, this._context.getRow(value.index));
      }
    });
  }

  private rowIsEqual(working: IRowData) {
    if (!this._original) return;
    const original = this._original.data[working.id];
    if (original === working) return true;
    if (!original) return false;
    return deepEqual(this.workingData(working), original.data);
  }

  private rowById(id: any): IRowData | undefined {
    if (!this._original || !this._working) return undefined;
    const row = this._context.getRow(this._working.findIndex(r => r.id === id));
    if (row && this._context.isComplete(row)) return row;
    return undefined;
  }

  private _equals() {
    if (!this._original || !this._working) return true;
    let oidx = 0;
    for (let widx = 0; widx < this._working.length; widx++) {
      const working  = this._context.getRow(widx);
      if (!working) return false;
      if (!this._context.isComplete(working)) continue;
      oidx++;
      if (!this.rowIsEqual(working)) return false;
    }
    if (oidx !== this._original.size) return false;
    return true;
  }

  public setIsCompleteRowFn(completeFn: (value: any) => boolean) {
    this._context.isComplete = completeFn;
  }

  public get hasChanges() {
    return this._hasChanges();
  }

  private setHasChanges(value: boolean) {
    const v = sample(() => this._hasChanges());
    if (v !== value) {
      this._hasChanges(value);
      this._context.onHasChanges(value);
    }
  }

  public start(ms: number) {
    this.stop();
    this._interval = setInterval(() => this.recalculate(), ms);
  }

  public stop() {
    if (!this._interval) return;
    clearInterval(this._interval);
    delete this._interval;
  }

  public rowByIdHasChanges(id: string) {
    return this.rowHasChanges(this.rowById(id));
  }
  public rowHasChanges(row?: IRowData) {
    return (row) ? !this.rowIsEqual(row) : true;
  }

  public valueByIdHasChanges(id: string, field: string) {
    return this.valueHasChanges(this.rowById(id), field);
  }
  public valueHasChanges(row: IRowData | undefined, field: string) {
    if (!row || !this._original) return true;
    const original = this._original.data[row.id];
    if (!original) return true;
    return !deepEqual(this.workingData(row)[field], original.data[field]);
  }

  public async recalculate() {
    if (!this._original || !this._working) return Promise.resolve(this._hasChanges());
    if (this._recalculating) return this._recalculating;
    return this._recalculating = new Promise<boolean>((resolve, reject) => {
      requestAnimationFrame(() => {
        const hasChanges = !this._equals();
        this.setHasChanges(hasChanges);
        resolve(hasChanges);
        this._recalculating = undefined;
      });
    });
  }
}

/*
testing comment this out after every change to the tracker to make sure tests pass!!
*/
/*
function sample2() {
  let rows: any[] = observable([]);
  for (let index = 0; index < 1; index++) {
    const row = {id: String(index)};
    for (let c = 4; c < 5; c++) {
      row[`column_${c}`] = `row ${index} col ${c}`;
      row['nested'] = {ooga: 'ooga', booga: 'booga'};
    }
    rows.push(row);
  }
  return rows;
}

function test(text: string, expected: boolean, actual: boolean) {
  if (expected !== actual) console.error(`${text} failed`);
  else console.info(`${text} passed`);
}

async function run() {
  const rows = sample2();
  const ct = new ChangeTracker(new ArrayChangeTrackerContext(rows));
  ct.set(rows);
  ct.recalculate();
  ct.recalculate();
  ct.recalculate();
  test('after set should be false', false, await ct.recalculate());

  rows.push({ooga: 'ooga'});
  test('after row change show be true', true, await ct.recalculate());

  rows.pop();
  test('after popping row should be false', false, await ct.recalculate());
  ct.recalculate();

  rows.push({ooga: 'ooga'});
  test('after repushing should be true', true, await ct.recalculate());

  ct.revert();
  test('after rejecting changes should be false', false, await ct.recalculate());

  rows[0]['column_4'] = 'yikes';
  test('after changing value should be true', true, await ct.recalculate());

  ct.revert();
  test('after rejecting changes should be false', false, await ct.recalculate());

  rows.splice(0, 1);
  test('after removing row should be true', true, await ct.recalculate());

  ct.revert();
  test('after rejecting changes should be false', false, await ct.recalculate());

  const oldValue = rows[0]['column_4'];
  rows[0]['column_4'] = 'ooga';
  test('changing a value should be true', true, await ct.recalculate());

  rows[0]['column_4'] = oldValue;
  test('restoring the old value should be false', false, await ct.recalculate());

  rows[0]['column_4'] = 'ooga';
  ct.commit();
  test('after committing changes should be false', false, await ct.recalculate());

  const r = rows[0];
  r['column_4'] = 'booga';
  test('setting a value in a row should have changes', true, ct.rowByIdHasChanges(r.id));
  test('setting a value in a row should have changes 2', true, ct.rowHasChanges(r));
  test('also the value should have changes', true, ct.valueByIdHasChanges(r.id, 'column_4'));
  test('also the value should have changes 2', true, ct.valueHasChanges(r, 'column_4'));
  // test('a different column same row should be false', false, ct.valueByIdHasChanges(r.id, 'column_5'));
  // test('a different row should not have changes', false, ct.rowByIdHasChanges('10'));
  // test('a different column same row should not have changes 2', false, ct.valueHasChanges(rows[10], 'column_5'));
  // test('a different row should not have changes 2', false, ct.rowHasChanges(rows[10]));

  ct.commit();
  ct.start(250);
  test('no changes', false, ct.hasChanges);

  r['column_4'] = 'blahh!!';
  setTimeout(() => {
    test('should have changes', true, ct.hasChanges);
    ct.dispose();
  }, 750);
}
setTimeout(run, 2000);
*/