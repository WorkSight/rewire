import React from 'react';
import {
  Route,
  Link,
  NavLink,
} from 'react-router-dom';
import {
  Sortable,
  SortableList,
  IItem,
  TransitionWrapper
}                        from 'rewire-ui';
import { observable }    from 'rewire-core';

import Paper      from '@material-ui/core/Paper';
import ListItem   from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

class TItem implements IItem {
  id:   string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

const sortableItems: TItem[] = observable([
  { id: '1-item', name: 'First Item' },
  { id: '2-item', name: 'Second Item' },
  { id: '3-item', name: 'Third Item' },
  { id: '4-item', name: 'Fourth Item' }
]);

export const TopicsView = React.memo(({ match }: any) => (
  <TransitionWrapper>
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Paper style={{width: '40%', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400}}>
      <Sortable>
        <SortableList listId='myList' items={sortableItems} itemRenderer={sortableItemRenderer} showDragHandle={true} disableTabbing={true} />
      </Sortable>
    </Paper>

    <Route path={`${match.url}/:topicId`} component={Topic}/>
    <Route exact path={match.url} render={() => (
      <h3>Please select a topic.</h3>
    )}/>
  </div>
  </TransitionWrapper>
));

const sortableItemRenderer = (item: TItem): JSX.Element => {
  return (
    <NavLink style={{textDecoration: 'none'}} to={`/topics/props-v-state`} activeClassName={'activeLink'}>
      <ListItem key={item.id}>
        <Typography>{item.name}</Typography>
      </ListItem>
    </NavLink>
  );
};

const Topic = ({ match }: any) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
);