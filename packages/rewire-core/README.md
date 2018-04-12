# Rewire Core
> A simple library for developing react applications using reactive state and proxies. Utilizing the wonderful and extremely fast reactive library [s-js](https://github.com/adamhaile/S). s-js and surplus is so fast that it routinely ranks at the top in all UI benchmarks. We took the core s-js functionality wrapped it in proxy so it is a little easier to use and created a react component for synching javascript models with react components. Easily allowing you to separate your state from your react components.

Features
--------
* Wraps s-js in proxy clothing to make state management intuitive and simple.
* Separation of concerns! separate your state into a simple javascript object or arrays and refer to them from your react component.
* Easily support async state updates. using async await just update your javascript object and have your react components observe those changes automatically.
* Lightweight easy to integrate into an existing project or for creating a quick and dirty prototypes.
* Just use existing built-in react components or libraries like material-ui and give them reactive superpowers.
* Fast (Blazingly?) & Efficient! Properties and nested object proxies are created lazily and only the properties that change will cause re-renders. Lots of goodies out-of-the-box computed properties, watchers and utilities to make react updates as optimal as possible. In fact see rewire-grid as an example. 
* [rewire-grid](https://github.com/WorkSight/rewire/tree/master/packages/rewire-grid) (in beta) is a very lightweight grid implementation that utilizes react-core. It supports most features of large grid projects, Fixed Columns and Rows, Sorting, Virtual Mode, Grouping, inline editing. with a reduced footprint and pretty great performance. The project total project is maybe 10 files with most files having about a page of code.
* [rewire-graphql](https://github.com/WorkSight/rewire/tree/master/packages/rewire-graphql) (in beta) a reactive cache for graphql queries. Issue graphql queries and the results are returned as observable proxies. These proxies and graphql queries are cached so object identity is maintained. Any cache or mutations are immediately reflected in the UI. Inpsired by [urql](https://github.com/FormidableLabs/urql), however it doesn't require any special react components to connect your reactive queries to your components just use react-core Observe.
* [rewire-ui](https://github.com/WorkSight/rewire/tree/master/packages/rewire-ui) (in beta) a collection of observable [material-ui](https://github.com/mui-org/material-ui) components for use in your projects. A nice Auto-Complete component based on [downshift](https://github.com/paypal/downshift). Form component with a simple functional validation framework. Drag and drop using [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd). These components are used in our WorkSight.Next project and thought we would make them available as a starter or as an example for anyone else in there projects.

Typescript
----------
All rewire components are written with typescript and the source is always published into npm as part of the distribution. To get the most of out of rewire it is recommended that you reference the source files directly in your projects. This gives you the most flexibility when it come to intellisense, tree shaking, bundling and minification. The form component is a good example of utilizing typescript to add type safety and intellisense for a great editing experience.

Installation
------------

Using [npm](https://www.npmjs.com/package/rewire-core):

	$ npm install rewire-core --save


Then, using a module bundler that supports either CommonJS or ES2015 modules, such as [fuse-box](https://fuse-box.org):

```js
import * as React            from 'react';
import * as ReactDOM         from 'react-dom';
import Observe               from 'rewire-core/Observe';
import observable, { watch } from 'rewire-core/observable';

const employee = observable({name: 'Some Guy', email: 'someone@gmail.com'});
setTimeout(() => employee.name = 'dude', 5000); // update the name property asynchronously 
watch(() => employee.name, () => console.log(employee.name)); // watch any changes to name and log them to the console.

// use plain ole react components. Observe will take a dependency on all properties accessed during render and only re-render the input when those dependencies change. 
ReactDOM.render(<div>
  <Observe render={() => <input value={employee.name} onChange={(evt) => employee.name = evt.target.value} />} />
</div>, document.getElementById('root'));
```

Gettting Started
----------------
coming soon...

Documentation
-------------
coming soon...
