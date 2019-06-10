import gql                from 'graphql-tag';
import {client as create, uploadMiddleware} from 'rewire-graphql';

// const client = create('http://localhost:3010/graphql', {mode: 'cors'});
const client = create('http://api.worksight.services:3010/graphql');

const query = gql`
  query($type: EntityType!, $search: String, $filter: FieldFilter, $count: Int) {
    search(type: $type, search: $search, filter: $filter, count: $count) {
      id
      name
      code
      display
    }
  }
`;

const query2 = gql`
  query($ids: [ID!]!) {
    employeesByIds(ids: $ids) {
      id
      name
      code
      phone {
        home
        mobile
        work
        fax
        workFax
      }
      email
    }
  }
`;

const query3 = gql`
  query($filter: EntityFilter, $sort: EntitySort, $first: Int, $after: Cursor) {
    generators(filter: $filter, sort: $sort, first: $first, after: $after) {
      took
      totalCount
      cursor
      data {
        id
        name
        cycle {
          id
          name
        }
      }
    }
  }
`;

const query4 = gql`
  query($filter: EmployeeFilter, $sort: EmployeeSort, $first: Int, $after: Cursor) {
    employees(filter: $filter, sort: $sort, first: $first, after: $after) {
      took
      totalCount
      cursor
      data {
        id
        name
        code
        phone {
          home
          mobile
          work
          fax
          workFax
        }
        email
      }
    }
  }
`;

export const subscriptionQuery = gql`
subscription s {
  timecardChanges(groupIds: "cc3246fa-85ef-4348-b85c-209ecc8e5d37", effective: "[2012,2018]") {
    operation
    timecard
  }
}`;

const mutation = gql`
  mutation($text: String!) {
    addTodo(text: $text) {
      id
      text
    }
  }`;

const employees = gql`
  query q {
    employees {
      data {
        name
        code
      }
    }
  }
`;

const ping = gql`
  mutation ping {
    ping
  }
`;


const upload = gql`
  mutation($file: Upload!) {
    uploadFile(file: $file) {
      id
    }
  }
`;

export async function uploadFile(file: File) {
  console.log(await client.mutation(upload, {file}));
}

async function run() {
  client.bearer = '0ab38f1096494eb96aa206a7053370b9e171743058f8ce70';
  client.use(uploadMiddleware);
  client.use((q, req, next) => {
    next();
  });
  // console.log(await client.query(employees));
  // const r = client.subscribe(subscriptionQuery);
  // r.observe((data: any) => {
  //   console.log(data);
  // });
  // let r2: any = await client.query(employees);
  // console.log(r2);
  // let r1 = await client.query(query, {type: 'employees', filter: {field: 'name', eq: 'dsafsfsffs'}});
  // let r2 = await client.query(query2, {ids: ['a42afb4a-a253-48c5-a980-d65d85d4e223']});
  // let r3 = await client.query(query3, {filter: {id: ['476e3575-cee5-4126-a484-012b7ef5796b']}});
  // let r4 = await client.query(query3);
  let r5 = await client.query(query4);
  // console.log(r1);
  // console.log(r2);
  // console.log(r3);
  // console.log(r4);
  console.log(r5);
  // let r3: any = await client.query(query2, {size: 2});
  // console.log(await r2);
  // console.log();
  // console.log(await [
  //   client.query(query, {size: 2}),
  //   client.query(query, {size: 2}),
  //   client.query(query2),
  //   client.mutation(mutation, {text: 'booga'})
  // ]);
  // // let r  = client.executeQuery({query, variables: {size: 2}});
  // let r = await client.executeMutation({query: mutation, variables: {text: 'todo'}}, {});
  // // let firstResult: any = result;
  // console.log(r2);
  // watch(() => r2.data.search.results[0].employee.name, () => console.log('changed'));
  // // result = await client.executeQuery({query, variables: {size: 1}});
  // // result = await client.executeQuery({query: query2});
  // // result = await client.executeQuery({query: query2});
  // setTimeout(() => {
  //   console.log(r2.data.search.results[1].employee === r3.data.search.results[0].employee);
  //   r3.data.search.results[1].employee.name = 'booger nose';
  // }, 5000);
  // // console.log(result);
}

// run();
run();