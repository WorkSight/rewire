import { expect } from 'chai';
import observable, {observe, version, replace} from '../src/observable';

describe('observable object tests', () => {
  it('change tracking 1', () => {
    let y = observable({
      test: 34,
      test2: {ooga: 'booga'},
      test3: {ooga: {test4: 45}}
    });

    let v = version(y);
    y.test = 35;
    expect(version(y)).to.equal(v + 1);
    y.test2.ooga = 'goop';
    expect(version(y)).to.equal(v + 2);
    expect(version(y.test3.ooga)).to.equal(0);
    y.test3.ooga.test4 = 45;
    expect(version(y.test3.ooga)).to.equal(0);
    expect(version(y)).to.equal(v + 2);
    y.test3.ooga.test4 = 46;
    expect(version(y.test3.ooga)).to.equal(1);
    expect(version(y)).to.equal(v + 3);
  });

  it('change tracking 2', () => {
    let y = observable({
      test: 34,
      test2: {ooga: 'booga'},
      test3: {ooga: [1, 3]}
    });

    let v = version(y);
    y.test = 35;
    expect(version(y)).to.equal(v + 1);
    y.test2.ooga = 'goop';
    expect(version(y)).to.equal(v + 2);
    y.test3.ooga.push(46);
    expect(version(y)).to.equal(v + 3);
  });

  it('change tracking 3', () => {
    let y = observable({
      test: 34,
      test2: {ooga: 'booga'},
      test3: {ooga: [1, 3]}
    });

    let changed = observe((value) => version(y) !== value, version(y));
    expect(changed()).to.be.false;
    let v = version(y);
    y.test = 35;
    expect(changed()).to.be.true;
    expect(version(y)).to.equal(v + 1);
    y.test2.ooga = 'goop';
    expect(version(y)).to.equal(v + 2);
    y.test3.ooga.push(46);
    expect(version(y)).to.equal(v + 3);
    expect(changed()).to.be.true;
  });

  it('change tracking 4', () => {
    let y = observable({
      test: 34,
      test2: {ooga: 'booga'},
      test3: {ooga: [1, {hello: 'there'}]}
    });

    let v = version(y);
    y.test = 35;
    expect(version(y)).to.equal(v + 1);
    y.test2.ooga = 'goop';
    expect(version(y)).to.equal(v + 2);
    y.test3.ooga.push(46);
    expect(version(y)).to.equal(v + 3);
    (y.test3.ooga[1] as any).hello = 'blah';
    expect(version(y)).to.equal(v + 4);
    replace(y, JSON.parse((JSON.stringify(y))));
    expect(version(y)).to.equal(v + 5);
    (y.test3.ooga[1] as any).hello = 'blah2';
    expect(version(y)).to.equal(v + 6);
    console.log(v);
  });

});

describe('observable object tests', () => {
  it('basic', () => {
    let y = observable({test: 34});

    expect(y.test).to.equal(34);
    y.test = 24;
    expect(y.test).to.equal(24);
  });

  it('create two observables should return same proxy', () => {
    let y = observable({test: 34});
    let x = observable(y);
    expect(x).equals(y);
  });

  it('replace nested proxy', () => {
    let y: any = observable({test: {ooga: 'booga'}});
    let z      = 0;
    observe(() => { console.log(y.test); z++; });
    y.test = {booga: 'goop'};
    expect(z).equals(2);
  });

  it('create two observables should return same proxy 2', () => {
    let y: any = observable({test: 34});
    console.log('' + y);
  });

  it('computation', () => {
    let y = observable({test: 34});
    let o = observe(() => y.test + y.test);
    expect(y.test).to.equal(34);
    expect(o()).to.equal(68);
    y.test = 24;
    expect(o()).to.equal(48);
    expect(y.test).to.equal(24);
  });

  it('nested array computation', () => {
    let y = observable({test: 34, test2: [4, 6]});
    let z = 0;
    let o = observe(() => {
      z++;
      return y.test2.length;
    });
    expect(o()).to.equal(2);
    y.test = 24;
    expect(o()).to.equal(2);
    y.test = 34;
    expect(o()).to.equal(2);
    y.test = 34;
    y.test = 28;
    expect(y.test).equal(28);
    expect(o()).to.equal(2);
    y.test2.push(8);
    expect(z).to.equal(2);
    expect(o()).to.equal(3);
  });

  it('nested array assigning same value has no effect', () => {
    let y = observable({test: 34, test2: [4, 6]});
    let z = 0;
    let o = observe(() => {
      z++;
      return y.test2.length;
    });
    expect(o()).to.equal(2);
    console.log(z);
    y.test2 = y.test2;
    y.test2 = y.test2; // ? z
    y.test2 = y.test2; // ? z
    expect(z).equals(1);
  });

  it('nested array assigning overwriting value', () => {
    let y = observable({test: 34, test2: [4, 6]});
    let z = 0;
    let o = observe(() => {
      z++;
      return y.test2.length; // ? y.test2.length
    });
    expect(o()).to.equal(2);
    y.test2 = y.test2; // ? z
    y.test2 = y.test2; // ? z
    expect(z).equals(1);
    y.test2 = [8, 5, 7, 9];
    expect(o()).equals(4);
    y.test2.push(10);
    expect(o()).equals(5);
    expect(z).to.equal(3);
  });

  it('nested object computation', () => {
    let y = observable({test: 34, test2: {booga: 'hello'}});
    let z = 0;
    let o = observe(() => {
      z++;
      return y.test2.booga;
    });
    expect(o()).to.equal('hello');
    y.test = 24;
    expect(o()).to.equal('hello');
    y.test = 34;
    expect(o()).to.equal('hello');
    y.test = 34;
    y.test = 28;
    expect(y.test).equal(28);
    expect(o()).to.equal('hello');
    y.test2.booga = 'goodbye';
    expect(z).to.equal(2);
    expect(o()).to.equal('goodbye');
  });
});

describe('observable array tests', () => {
  it('computation push', () => {
    let y = observable([54, 4]);
    let o = observe(() => {
      return y.length;
    });
    expect(o()).to.equal(2);
    y.push(8);
    y.push(9);
    expect(o()).to.equal(4); // ? y
  });

  it('computation splice -> append', () => {
    let y = observable([0, 1]);
    let o = observe(() => {
      return y.length;
    });
    expect(o()).to.equal(2);
    y.splice(0, 1, 2, 3);
    expect(o()).to.equal(3);
    expect(y).to.deep.equals([2, 3, 1]);
  });

  it('computation splice -> replace', () => {
    let y = observable([0, 1]);
    let o = observe(() => {
      return y.length;
    });
    expect(o()).to.equal(2);
    y.splice(2, 0, 2, 3);
    expect(o()).to.equal(4);
    expect(y).to.deep.equals([0, 1, 2, 3]);
  });

  it('computation set -> replace', () => {
    let y = observable([0, 1]);
    let o = observe(() => {
      return y.length;
    });
    expect(o()).to.equal(2);
    let v = version(y);
    expect(v).to.equal(0);
    y.set([0, 1, 2, 3]);
    expect(version(y)).to.equal(1);
    expect(o()).to.equal(4);
    y.set(0, 1, 2, 3, 4);
    expect(version(y)).to.equal(2);
    expect(o()).to.equal(5);
    y.set(0, 1, 2, 3, 4);
    expect(version(y)).to.equal(2);
    expect(o()).to.equal(5);
    expect(y).to.deep.equals([0, 1, 2, 3, 4]);
  });

  it('computation splice -> delete', () => {
    let y = observable([0, 1]);
    let o = observe(() => {
      return y.length;
    });
    expect(o()).to.equal(2);
    y.splice(1, 1);
    expect(o()).to.equal(1);
    expect(y).to.deep.equals([0]);
  });

  it('create two proxy with same array', () => {
    let y = observable([54, 4]);
    let z = observable(y);
    expect(y).equals(z);
  });

  it('create two proxy with same array 2', () => {
    let y = observable([54, 4]);
    y.toString();
  });

  it('create an array that has a nested object', () => {
    let y = observable<any>([54, 4, {test: 'booga'}]);
    let o = observe(() => {
      return y[2].test; // ?
    });
    expect(o()).to.equal('booga');
    y.push(3);
    expect(o()).to.equal('booga');
    y[2].test = 'ooga';
    expect(o()).to.equal('ooga');
  });

  it('computation pop, push, shift, unshift', () => {
    let y = observable([54, 4]);
    let o = observe(() => {
      return y.length;
    });
    expect(o()).to.equal(2);
    y.push(8);

    expect(o()).to.equal(3); // ? y
    y.pop();
    expect(o()).to.equal(2); // ? y
    y.shift();
    expect(o()).to.equal(1); // ? y
    y.unshift(99);
    expect(o()).to.equal(2); // ? y
  });
});
