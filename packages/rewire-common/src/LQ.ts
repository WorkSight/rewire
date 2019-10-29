import isNullOrUndefined from './isNullOrUndefined';

export type Predicate<T> = (current: T) => boolean;
export function and<T>(fn1: Predicate<T>, fn2: Predicate<T>) { return (current: T) => fn1(current) && fn2(current); }
export function or<T>(fn1: Predicate<T>, fn2: Predicate<T>) { return (current: T) => fn1(current) || fn2(current); }

export type CompareFn<T> = (o1: T, o2: T) => number;
export function defaultCompare<T>(o1: T, o2: T) { if (o1 === o2) return 0; return (o1 < o2) ? -1 : 1; }
export function dateCompare(d1: Date, d2: Date) {
  return defaultCompare(d1.getTime(), d2.getTime());
}

function *map<T, R>(iterator: Iterable<T>, fn: (f: T) => R) {
  for (let c of iterator) {
    yield fn(c);
  }
}

function *mutate<T>(iterator: Iterable<T>, fn: (f: T) => void) {
  for (let c of iterator) {
    fn(c);
    yield c;
  }
}

function *distinct<T, R>(iterator: Iterable<T>, fn?: (f: T) => R) {
  const s = new Set<T>();
  for (let c of iterator) {
    let v: any = fn ? fn(c) : c;
    if (s.has(v)) continue;
    s.add(v);
    yield v;
  }
}

function *flatMap<T, R>(iterator: Iterable<T>, fn: (f: T) => Iterable<R>): Iterable<R> {
  for (let c of iterator) {
    for (let d of fn(c)) {
      yield d;
    }
  }
}

function *flatten<T>(iterator: Iterable<T>): Iterable<T> {
  for (let c of iterator) {
    if (c[Symbol.iterator]) {
      yield *flatten(c as any);
    } else {
      yield  c;
    }
  }
}

function *filter<T>(iterator: Iterable<T>, fn: (current: T) => boolean) {
  for (let c of iterator) {
    if (fn(c)) {
      yield c;
    }
  }
}

function *object<T>(obj: T) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof (value) === 'function') continue;
    yield {key, value};
  }
}

function contains<T>(iterator: Iterable<T>, fn: (current: T) => boolean) {
  for (let c of iterator) {
    if (fn(c)) {
      return true;
    }
  }
  return false;
}

function *concat<T>(iterator1: Iterable<T>, iterator2: Iterable<T>) {
  yield *iterator1;
  yield *iterator2;
}

function *merge<T>(iterator1: Iterable<T>, iterator2: Iterable<T>) {
  let i1 = iterator1[Symbol.iterator]();
  let i2 = iterator2[Symbol.iterator]();

  let v1 = i1.next();
  let v2 = i2.next();
  while (!v1.done && !v2.done) {
    if (!v1.done) yield v1.value;
    if (!v1.done) {
      yield v1.value;
      v1 = i1.next();
    }
    if (!v2.done) {
      yield v2.value;
      v2 = i2.next();
    }
  }
}

export function reduce<T, U>(iterator: Iterable<T>, fn: (prev: U, current: T) => U, initial: U): U {
  let prev = initial;
  for (let current of iterator) {
    prev = fn(prev, current);
  }
  return prev;
}

type IGroup<T> = {
  [key: string]: T[];
};

type IGrouping<T> = IGroup<T> & {LQ(): ILQ<{key: string, value: T[]}>};
const __groupByResult = {LQ() { return new LQ2(object(this)); }};

function groupBy<T>(iterator: Iterable<T>, by: keyof T): IGrouping<T> {
  let result: any = Object.create(__groupByResult);
  return reduce<T, any>(iterator, function(prev: any, curr: T) {
    (prev[curr[by]] = (prev[curr[by]] || [])).push(curr);
    return prev;
  }, result);
}

export function *combine<T>(r1: Iterable<T>, fn: (p1: T, p2: T) => T | undefined, order: ISortField<T>[]): Iterable<T> {
  let iter    = orderBy(r1, order);
  let current = iter.next().value;
  while (current) {
    let next = iter.next().value;
    let c    = fn(current, next as T);
    if (!c) {
      yield current;
      current = next;
    } else {
      current = c;
    }
  }

  if (current) {
    yield current;
  }
}

interface ISortField<T> {
  field?: keyof T;
  order?: eSortOrder;
}

export enum eSortOrder {'ascending', 'descending'}
function compare(v1: any, v2: any, order?: eSortOrder) {
  if (v1 === v2) return 0;
  const direction = (order === eSortOrder.descending) ? 1 : -1;
  if (isNullOrUndefined(v1)) return direction * -1;
  if (isNullOrUndefined(v2)) return direction;
  return v1 < v2 ? direction : v1 > v2 ? (direction * -1) : 0;
}

export function *orderBy<T>(iterator: Iterable<T>, fields?: ISortField<T>[]) {
  const arr = Array.from(iterator);
  arr.sort((a: any, b: any) => {
    if (!fields) return compare(a, b, eSortOrder.ascending);

    for (const field of fields) {
      if (field.field) {
        return compare(a, b, field.order);
      }

      const r = compare(a[field.field!], b[field.field!], field.order);
      if (r !== 0) return r;
    }
    return 0;
  });

  yield* arr;
}

function *take<T>(iterator: Iterable<T>, n: number) {
  for (let c of iterator) {
    if (n <= 0) break;
    yield c;
    n--;
  }
}

function *skip<T>(iterator: Iterable<T>, n: number) {
  for (let c of iterator) {
    if (n <= 0) { yield c; continue; }
    n--;
  }
}

function *intersects<T>(iterator: Iterable<T>, range2: Iterable<T>, compare: CompareFn<T> = defaultCompare) {
  let i1 = iterator[Symbol.iterator]();
  let v1 = i1.next();
  for (let v2 of range2) {
    while (!v1.done) {
      let c = compare(v1.value, v2);
      if (c === 0) {
        yield v2;
      }
      v1 = i1.next();
    }
  }
}

export function *empty<T>(): Iterable<T> {}

export function mergeMap<T, R>(iterator: Iterable<T>, iterator2: Iterable<R>, fn: (p1: T, p2: R) => Iterable<T>): Iterable<T> {
  let i = iterator;
  for (let v2 of iterator2) {
    i = flatMap(i, (v1) => fn(v1, v2));
  }
  return i;
}

export interface ILQ<T> {
  flatten():                               LQ2<T>;
  iterator:                                Iterable<T>;
  map<R>(fn: (f: T) => R):                 ILQ<R>;
  flatMap<R>(fn: (f: T) => Iterable<R>):   ILQ<R>;
  filter(fn: (current: T) => boolean):     ILQ<T>;
  contains(fn: (current: T) => boolean):   boolean;
  distinct<R = T>(fn?: (current: T) => R): ILQ<R>;
  concat(range2: Iterable<T>):             ILQ<T>;
  take(n: number):                         ILQ<T>;
  skip(n: number):                         ILQ<T>;
  mutate(fn: (f: T) => void):              ILQ<T>;
  first():                                 T | undefined;
  last():                                  T | undefined;
  min():                                   T | undefined;
  max():                                   T | undefined;
  merge(range2: Iterable<T>):              ILQ<T>;
  orderBy(fields?:                         ISortField<T>[]): ILQ<T>;
  intersects(range2:                       Iterable<T>, compare?: CompareFn<T>): ILQ<T>;
  toArray():                               T[];
  value():                                 T[];
  groupBy(by: keyof T):                    IGrouping<T>;
  mergeMap<R>(range2: Iterable<R>, fn: (p1: T, p2: R) => Iterable<T>): ILQ<T>;
  reduce<U>(fn: (prev: U, current: T) => U, initial: U): U;
}

class LQ2<T> implements ILQ<T> {
  constructor(public iterator: Iterable<T>) {}

  map<R>(fn: (f: T) => R): ILQ<R> {
    return new LQ2(map(this.iterator, fn));
  }

  mutate(fn: (f: T) => void): ILQ<T> {
    return new LQ2(mutate(this.iterator, fn));
  }

  groupBy(by: keyof T): IGrouping<T> {
    return groupBy(this.iterator, by);
  }

  flatMap<R>(fn: (f: T) => Iterable<R>) {
    return new LQ2(flatMap<T, R>(this.iterator, fn));
  }

  flatten(): LQ2<T> {
    return new LQ2(flatten<T>(this.iterator));
  }

  mergeMap<R>(range2: Iterable<R>, fn: (p1: T, p2: R) => Iterable<T>) {
    return new LQ2(mergeMap<T, R>(this.iterator, range2, fn));
  }

  filter(fn: (current: T) => boolean) {
    return new LQ2(filter(this.iterator, fn));
  }

  contains(fn: (current: T) => boolean) {
    return contains(this.iterator, fn);
  }

  distinct<R = T>(fn?: (current: T) => R) {
    return new LQ2(distinct(this.iterator, fn));
  }

  concat(range2: Iterable<T>) {
    return new LQ2(concat(this.iterator, range2));
  }

  take(n: number) {
    return new LQ2(take(this.iterator, n));
  }

  skip(n: number) {
    return new LQ2(skip(this.iterator, n));
  }

  first(): T | undefined {
    return take(this.iterator, 1).next().value as T;
  }

  last() {
    let l: T | undefined = undefined;
    for (l of this.iterator) {}
    return l;
  }

  min() {
    return reduce<T, T | undefined>(this.iterator, (prev: T | undefined, current: T) => (isNullOrUndefined(prev) || current < prev!) ? current : prev, undefined);
  }

  max() {
    return reduce<T, T | undefined>(this.iterator, (prev: T | undefined, current: T) => (isNullOrUndefined(prev) || current > prev!) ? current : prev, undefined);
  }

  reduce<U>(fn: (prev: U, current: T) => U, initial: U): U {
    return reduce(this.iterator, fn, initial);
  }

  merge(range2: Iterable<T>) {
    return new LQ2(merge(this.iterator, range2));
  }

  orderBy(fields?: ISortField<T>[]) {
    return new LQ2(orderBy(this.iterator, fields));
  }

  intersects(range2: Iterable<T>, compare: CompareFn<T> = defaultCompare) {
    return new LQ2(intersects(this.iterator, range2, compare));
  }

  toArray() { return  [...this.iterator]; }
  value()   { return [...this.iterator]; }
}

export default <T>(iterator: Iterable<T>): ILQ<T> => new LQ2(iterator);

// function LQ<T>(iterator: Iterable<T>): ILQ<T> {
//   return {
//     iterator,

//     map<R>(fn: (f: T) => R) {
//       return LQ(map(iterator, fn));
//     },

//     groupBy(by: (item: T) => string): ILQ<IGrouping<T>> {
//       return LQ(groupBy(iterator, by));
//     },

//     flatMap<R>(fn: (f: T) => Iterable<R>) {
//       return LQ(flatMap<T, R>(iterator, fn));
//     },

//     flatten() {
//       return LQ(flatten<T>(iterator));
//     },

//     mergeMap<R>(range2: Iterable<R>, fn: (p1: T, p2: R) => Iterable<T>) {
//       return LQ(mergeMap<T, R>(iterator, range2, fn));
//     },

//     filter(fn: (current: T) => boolean) {
//       return LQ(filter(iterator, fn));
//     },

//     contains(fn: (current: T) => boolean) {
//       return contains(iterator, fn);
//     },

//     distinct<R = T>(fn?: (current: T) => R) {
//       return LQ(distinct(iterator, fn));
//     },

//     concat(range2: Iterable<T>) {
//       return LQ(concat(iterator, range2));
//     },

//     take(n: number) {
//       return LQ(take(iterator, n));
//     },

//     skip(n: number) {
//       return LQ(skip(iterator, n));
//     },

//     first(): T | undefined {
//       return take(iterator, 1).next().value;
//     },

//     last() {
//       let l: T | undefined = undefined;
//       for (l of iterator) {}
//       return l;
//     },

//     min() {
//       return reduce<T, T | undefined>(iterator, (prev: T | undefined, current: T) => (isNullOrUndefined(prev) || current < prev!) ? current : prev, undefined);
//     },

//     max() {
//       return reduce<T, T | undefined>(iterator, (prev: T | undefined, current: T) => ((isNullOrUndefined(prev) || current > prev!) ? current : prev, undefined);
//     },

//     reduce<T, U>(iterator: Iterable<T>, fn: (prev: U, current: T) => U, initial: U): U {
//       return reduce(iterator, fn, initial);
//     },

//     merge(range2: Iterable<T>) {
//       return LQ(merge(iterator, range2));
//     },

//     orderBy(fields?: ISortField[]) {
//       return LQ(orderBy(iterator, fields));
//     },

//     intersects(range2: Iterable<T>, compare: CompareFn<T> = defaultCompare) {
//       return LQ(intersects(iterator, range2, compare));
//     },

//     toArray: () => [...iterator],
//     value:   () => [...iterator]
//   };
// }

export function fromEnumerable<T>(obj: Iterable<T>) {
  return new LQ2<T>(obj);
}

export function fromObject<T>(obj: T) {
  return new LQ2(object(obj));
}
