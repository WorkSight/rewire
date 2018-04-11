# Rewire Core
> A simple library for developing react applications using reactive state and proxies. Utilizing the wonderful and extremely fast reactive library  [s-js](https://github.com/adamhaile/S)

Features
---------------
* **Wraps s-js in proxy clothing to make state management intuitive
* **Lightweight easy to integrate into an existing project or for creating a quick and dirty prototype.
* **Easy to wrap or use existing react component libraries.
* **rewire-graphql a reactive cache for graphql queries.

Installation
------------

Using [npm](https://www.npmjs.com/package/rewire-core):

	$ npm install rewire-core --save


Then, using a module bundler that supports either CommonJS or ES2015 modules, such as [webpack](https://github.com/webpack/webpack):

```js
import observable from 'rewire-core/observable';
import Observe from 'rewire-core/Observe';

let e = observable({name: 'Some Guy', email: 'someone@gmail.com'});
setTimeout(() => e.name = 'dude', 5000); // update state automatically sinks watched components. 
...
/// some react code later observing state changes 
    <div>
      <Observe render={() => <input value={e.name} onChange={(evt) => e.name = evt.target.value} />} />
    </div>
...
```
