# Rewire GraphQL
> a reactive observable cache for graphql built using [rewire-core](https://github.com/WorkSight/rewire/tree/master/packages/rewire-core).

Features
--------
* Execute GraphQL queries and create observable models from the results.
* Those models are cached so that a re-fetch of the query is instantaneous.
* identity is preserved between references in the model enabling your UI to stay completely in sync.
* If you are using react-core already there is no-need for yet another custom react HOC just pass your query results to your react components and use Observe in react-core to keep them in sync.
* You can pass queries as strings or use GQL templates.

Typescript
----------
All rewire components are written with typescript and the source is always published into npm as part of the distribution. To get the most of out of rewire it is recommended that you reference the source files directly in your projects. This gives you the most flexibility when it come to intellisense, tree shaking, bundling and minification.

Installation
------------

Using [npm](https://www.npmjs.com/package/rewire-graphql):

	$ npm install rewire-graphql --save


Then, using a module bundler that supports either CommonJS or ES2015 modules, such as [fuse-box](https://fuse-box.org).

Getting Started
---------------
```js
import gql        from 'graphql-tag';
import { watch }  from 'rewire-core';
import { client } from 'rewire-graphql';

const client = client('https://someurlhere.lp.gql.zone/graphql');

const query = gql`
  query($size: Int!) {
    search(options: {filter: {eq: {name: "sandy"}}}, size: $size) {
      took
      count
      results {
        ... on Occupation {
          _type
          id
          employee {
            id
            name
          }
          name
          code
        }
      }
    }
  }
`;

let results = await client.query(query, {size: 20});
console.log(results);

// set a watcher on the employee name!
watch(() => results.data.search.results[0].employee.name, () => console.log('changed'));
let results2 = await client.query(query, {size: 21}); // different parameters to force a cache update

setTimeout(() => {
  // the results of the two queries should point to the same employee reference
  console.log(results.data.search.results[1].employee === results2.data.search.results[0].employee);

  // updating the employee either from a query update or by within a react component will dispatch those changes to any watchers.
  results2.data.search.results[1].employee.name = 'change the name';
}, 5000);

```
Documentation
-------------
coming soon...
