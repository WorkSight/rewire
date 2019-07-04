import S, {DataSignal}                               from 's-js';
import {isNullOrUndefined, isNullOrUndefinedOrEmpty} from 'rewire-common';

export type EQType = (v1: any, v2: any) => boolean;

const proxyProperty   = '___isProxy___';
const versionProperty = '___version___';

export {DataSignal};

export const observe: O = S;
export const root       = S.root;
export const freeze     = S.freeze;
export const property   = S.data;
export const sample     = S.sample;
export const value      = S.value;

export function is_proxy(value: ObjectType) {
  return (!isNullOrUndefined(value) && !!value[proxyProperty]);
}

function can_observe(value: ObjectType) {
  return (!isNullOrUndefined(value) && !value[proxyProperty] && (Array.isArray(value) || ((typeof value) === 'object')));
}

export function version(value: ObjectType) {
  return (!isNullOrUndefined(value) && value[versionProperty]);
}

function wrap(fn: any) {
  let f: any = function(this: any) {
    let result: any = undefined;
    let args = arguments;
    freeze(() => {
      result = fn.apply(this, args);
    });
    return result;
  };
  return f;
}

declare global {
  interface Array<T> {
    set(...args: T[]): void;
    set(args: T[]): void;
  }

  export interface ObjectType {
    [key: string]: any;
  }
}

if (!Array.prototype.set) {
  Array.prototype.set = function<T>(args: T[]) {
    if (this === null) return;
    if (Array.isArray(args)) this.splice(0, this.length, ...args);
    else this.splice(0, this.length, ...Array.from(arguments));
  };
}

const arrayPrototype = Object.create(Array.prototype);
['copyWithin', 'fill', 'set', 'pop', 'push', 'reverse', 'shift', 'slice', 'sort', 'splice', 'unshift'].forEach(m => arrayPrototype[m] = wrap(arrayPrototype[m]));

function observable_array(value: ObjectType, eq: EQType, parent?: () => void) {
  Object.setPrototypeOf(value, arrayPrototype);
  let version = S.data(0);
  function incrementVersion() {
    if (parent) parent();
  }

  const arrayHandler = {
    get(target: ObjectType, property: string, receiver: Object) {
      if (property === proxyProperty) {
        return true; // add a isProxy flag dynamically
      }

      const vsn  = version();
      if (property === versionProperty) {
        return vsn; // add a version dynamically
      }
      let v = target[property];
      if (can_observe(v)) {
        v = observable(v, incrementVersion);
        target[property] = v;
      }

      return v;
    },

    set(target: ObjectType, property: string, v: any, receiver: Object) {
      let val = target[property];
      if (eq(val, v)) {
        return true;
      }
      target[property] = observable(v, parent);
      version(version() + 1);
      incrementVersion();
      return true;
    }
  };

  return new Proxy(value as Object, arrayHandler);
}

const _invalidProperties = {
  '__proto__': true
};

const _objectProto = Object.getPrototypeOf(new Object());

function createHandler(eq: EQType, parent?: () => void) {
  let dependencyCache: ObjectType = {};
  let version = S.data(0);

  function incrementVersion() {
    version(S.sample(version) + 1);
    if (parent) parent();
  }

  return {
    get(target: ObjectType, property: string, receiver: Object) {
      if (property === proxyProperty) { // dynamically add a is_proxy property
        return true;
      }
      if (property === versionProperty) {  // dynamically add a version property
        return version();
      }
      const value = target[property];
      if ((property in _invalidProperties) || (typeof(property) !== 'string')) {
        return value;
      }

      if (typeof(value) === 'function') { // a function or a non-observable property
        return value;
      }

      if (!target.hasOwnProperty(property)) {
        // for getters
        let proto = Object.getPrototypeOf(target);
        while (proto !== _objectProto) {
          let propDesc = Object.getOwnPropertyDescriptor(proto, property);
          if (propDesc && propDesc.get && typeof propDesc.get === 'function') {
            return value;
          }
          proto = Object.getPrototypeOf(proto);
        }
      }

      let v = dependencyCache[property];
      if (v) return v();

      v = S.data(property.startsWith('__') ? value : observable(value, incrementVersion));
      dependencyCache[property] = v;
      return v();
    },

    set(target: ObjectType, property: string, value: any, receiver: Object) {
      if (!target.hasOwnProperty(property)) {
        // for getters
        let proto = Object.getPrototypeOf(target);
        while (proto !== _objectProto) {
          let propDesc = Object.getOwnPropertyDescriptor(proto, property);
          if (propDesc && propDesc.set && typeof propDesc.set === 'function') {
            propDesc.set.call(receiver, value);
            return true;
          }
          proto = Object.getPrototypeOf(proto);
        }
      }

      let v = dependencyCache[property];
      if (!v) {
        const oldValue = target[property];
        const newValue = property.startsWith('__') ? value : observable(value, incrementVersion); // don't make properties that start with __ observable!!
        v = S.data(newValue);
        target[property] = newValue;
        dependencyCache[property] = v;
        v();
        if (!eq(value, oldValue)) {
          incrementVersion();
          return true;
        }

        return true;
      }

      if (eq(v(), value)) {
        return true;
      }
      const newValue   = property.startsWith('__') ? value : observable(value, incrementVersion); // don't make properties that start with __ observable!!
      target[property] = newValue;
      v(newValue);
      incrementVersion();
      return true;
    }
  };
}

export function defaultEquals(v1: any, v2: any) {
  if (v1 === v2) return true;
  if (v1 && !isNullOrUndefinedOrEmpty(v1.id) && v2 && !isNullOrUndefinedOrEmpty(v2.id)) {
    if (v1.id === v2.id)          return true;
    // if (v1.valueOf && v2.valueOf) return v1.valueOf() === v2.valueOf();
  }

  const undefinedOrNullOrEmpty1 = isNullOrUndefinedOrEmpty(v1);
  const undefinedOrNullOrEmpty2 = isNullOrUndefinedOrEmpty(v2);
  if (undefinedOrNullOrEmpty1 && undefinedOrNullOrEmpty2) return true;
  if (Array.isArray(v1) && Array.isArray(v2)) {
    if (v1.length !== v2.length) return false;
    for (let i = 0; i < v1.length; i++) {
      if (!defaultEquals(v1[i], v2[i])) return false;
    }
    return true;
  }
  return false;
}

export default function observable<T extends ObjectType>(obj: T, parent?: () => void, eq: EQType = defaultEquals): T {
  if (is_proxy(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return observable_array(obj, eq, parent) as T;
  }

  if ((obj === null) || ((typeof obj) !== 'object')) {
    return obj;
  }

  return new Proxy(obj, createHandler(eq, parent)) as T;
}

export interface O {
  <T>(fn: () => T): () => T;
  <T>(fn: (v: T) => T, seed: T): () => T;
}

export function watch<T = any>(fn: (prevResult?: T) => T, action: (result?: T) => T | undefined | void | Promise<void>, seed?: T, doAction: boolean = false) {
  S.on(fn, action, seed, !doAction);
}

export function replace(obs: any, ...obj: any[]) {
  freeze(() => {
    Object.keys(obs).forEach((prop) => {
      delete obs[prop];
    });

    if (obj) {
      Object.assign(obs, ...obj);
    }
  });
}

/**
 * The computed method creates a computed property. The function takes a dependency on a signal or a watched function and will run the action returning a computed result.
 * The action result is cached and will only be recalculated when the dependency changes so getting the value of the computed property is fast.
 * @export
 * @template T the return type
 * @param {() => void} fn another signal or dependency function
 * @param {() => T} action the computed property function
 * @param {T} [seed] initial value of the property
 * @param {boolean} [doAction=false] run the action right on declaration
 * @returns {() => T} a function that when invoked returns the current value of the property
 */
export function computed<T = any>(fn: () => void, action: () => T, seed?: T, doAction: boolean = false): () => T {
  return S.on<T>(fn, action, seed as any, !doAction) as () => T;
}
