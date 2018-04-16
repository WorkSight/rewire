# Rewire Grid
> a lightweight reactive grid implementation built using [rewire-core](https://github.com/WorkSight/rewire/tree/master/packages/rewire-core).

Features
--------
* Fixed columns and rows
* Inline editing.
* Custom cell types and editors.
* Enhanced keyboard support.
* Sorting and grouping.
* Flexible proportional column sizing.
* Colum resizing.
* Virtual mode.
* Cell Merging, Column and Row.
* Styling is a simple SASS stylesheet that you can alter for your own look and feel.
* The goal is to keep the core grid component as extensible and lean as possible and build abstractions over top.

Typescript
----------
All rewire components are written with typescript and the source is always published into npm as part of the distribution. To get the most of out of rewire it is recommended that you reference the source files directly in your projects. This gives you the most flexibility when it come to intellisense, tree shaking, bundling and minification.

Installation
------------

Using [npm](https://www.npmjs.com/package/rewire-grid):

	$ npm install rewire-grid --save


Then, using a module bundler that supports either CommonJS or ES2015 modules, such as [fuse-box](https://fuse-box.org).

Getting Started
---------------
The grid like most of rewire components consists of a model and associated view components. They generally map one to one. So there will be a GridModel -> Grid, ColumnModel -> Column, etc...When working and building react-core components it is desirable to keep this model -> View separation. The philosophy of which the View is just reacting to model changes and are generally very lightweight. When you want to add capabilities to your application think model first and generally your models should not have any react or view dependencies. Enough sermonizing let's have a look. 

```js
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import createGrid    from 'rewire-grid/models/GridModel';
import createColumn  from 'rewire-grid/models/ColumnModel';
import Grid          from 'rewire-grid/components/Grid';

function createTestGrid(nRows: number, nColumns: number) {
  console.time('start tester');
  // make sure we have enough columns passed.
  if (nColumns < 10) throw new Error('add some more columns!');

  // create some random sized columns!
  let cols = [];
  for (let col = 0; col < nColumns; col++) {
    cols.push(createColumn('column' + col, 'Header# ' + col, 'text', Math.trunc(Math.random() * 250 + 50) + 'px'));
  }

  // Override and set some columns to be number!
  cols[5].setEditor({type: 'number', options: {decimals: 2, thousandSeparator: true}});
  cols[6].setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});

  // add some cell data!
  let rows = [];
  for (let row = 0; row < nRows; row++) {
    let r: any = {};
    for (let column = 0; column < nColumns; column++) {
      let v: any = `RC ${column}-${row % 5}`;
      if ((column >= 5) && (column <= 6)) v = Math.random() * 10000;
      r['column' + column] = v;
    }
    rows.push(r);
  }

  // Some fixed columns to the left
  cols[0].fixed = true;
  cols[0].width = '128px';
  cols[0].align = 'right';
  cols[1].fixed = true;
  cols[1].width = '65px';
  cols[1].align = 'right';

  // create the grid model and group by 'column2' and 'column3'
  let grid = createGrid(rows, cols, ['column2', 'column3']);

  // sort first by  column7 then by column6
  grid.addSort(cols[7], 'ascending')
      .addSort(cols[6], 'descending');

  console.timeEnd('start tester'); // how long did it take to create the reactive model?
  return grid;
}

let grid = createTestGrid(40, 14);

// then simply render the grid model. Any changes to the model will automatically be reflected in the grid.
ReactDOM.render(<div>
  <Grid grid={grid} />
</div>, document.getElementById('root'));

```
The rendered grid view: 

![grid sample](../../resources/grid-sample.png)

Documentation
-------------
coming soon...
