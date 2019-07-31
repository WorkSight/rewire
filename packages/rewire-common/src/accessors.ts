function generateBody(path: string, setter: boolean) {
  const ps         = path.split('.');
  let   lets       = '';
  let   currentVar = 'obj';
  let   exp        = '';
  for (let i = 0; i < ps.length - 1; i++) {
    const p      = ps[i];
    const newVar = 'a' + i;
    lets += `${i > 0 ? ',' : ''}${newVar}`;
    exp  += setter ? `(${newVar} = (${currentVar}['${p}'] || (${currentVar}['${p}'] = {}))) && ` : `(${newVar} = ${currentVar}['${p}']) && `;
    currentVar = newVar;
  }
  exp += setter ? `(${currentVar}['${ps[ps.length - 1]}'] = value)` : `${currentVar}['${ps[ps.length - 1]}']`;
  return [lets, exp];
}

const getterCache = {};
export function createGetter(path: string) {
  const fn = getterCache[path];
  if (fn) return fn;

  const [lets, exp] = generateBody(path, false);
  let body = `{ if (!obj) return undefined;
  ${(lets.length > 0) ? `let ${lets};` : ''}
  return ${exp};
}`;
  return (getterCache[path] = new Function('obj', body));
}

const setterCache = {};
export function createSetter(path: string) {
  const fn = setterCache[path];
  if (fn) return fn;

  const [lets, exp] = generateBody(path, true);
  let body = `{ if (!obj || (value === undefined || value === null)) return;
  ${(lets.length > 0) ? `let ${lets};` : ''}
  ${exp};
}`;
  return (setterCache[path] = new Function('obj', 'value', body));
}

// let x = {a: {b: {c: {d: {e: 'ooga'}, booga: [{a: 'test'}, {b: {c: 'test'}}]}}}};
// console.time('start');
// for (let index = 0; index < 100_000; index++) {
//   const z = x.a.b.c.d.e;
// }
// console.timeEnd('start');

// console.time('start');
// for (let index = 0; index < 100_000; index++) {
//   let z = x['a']['b']['c']['d']['e'];
// }
// console.timeEnd('start');

// console.time('start');
// for (let index = 0; index < 100_000; index++) {
//   const z = x.a.b.c.d.e;
// }
// console.timeEnd('start');

// function getter(obj) {
//   if (!obj) return undefined;
//   let a1, a2, a3, a4;
//   return (a1 = obj['a']) && (a2 = a1['b']) && (a3 = a2['c']) && (a4 = a3['d']) && a4['e'];
// }

// console.log(getter(x));
// console.time('ooga');
// for (let index = 0; index < 100_000; index++) {
//   getter(x);
// }
// console.timeEnd('ooga');
// let x1 = createGetter('a.b.c.d.e');
// console.time('booga');
// for (let index = 0; index < 100_000; index++) {
//   x1(x);
// }
// console.timeEnd('booga');


// function setter(obj, value) {
//   if (!obj) return undefined;
//   let a1, a2, a3, a4;
//   return (a1 = (obj['a'] || (obj['a'] = {})) && (a2 = (a1['b'] = {}) && (a3 = a2['c']) && (a4 = a3['d']) && a4['e'];
// }


// console.log(x);

// let setter = createSetter('a.b.c.d.e');
// setter(x, 'yahoo');
// console.log(createGetter('a.b.c.d.e')(x));
// console.log(createGetter('a.b.c.booga.1.b.c')(x));

// console.time('createGetter');
// for (let index = 0; index < 1000; index++) {
//   createGetter('a.b.c.d');
// }
// console.timeEnd('createGetter');