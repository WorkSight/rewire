import gql                from 'graphql-tag';
import {client as create, uploadMiddleware} from 'rewire-graphql';

const client = create('http://localhost:3010/graphql', {mode: 'cors'});
// const client = create('http://api.worksight.services:3010/graphql');

const query = gql`
  query($size: Int!) {
    search(options: {filter: {eq: {name: "sandy"}}}, size: $size) {
      took
      count
      results {
        ... on OccupationCode {
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
  // client.bearer = '3a38887fece4e7d1e4b7c2b44fd5f9e8518cf9cde8c83a02';
  client.bearer = '49c28e3d3c4ea320ac409900303fc1458fc2031d40fd720c';
  client.use(uploadMiddleware);
  client.use((q, req, next) => {
    next();
  })
  // console.log(await client.query(employees));
  // const r = client.subscribe(subscriptionQuery);
  // r.observe((data: any) => {
  //   console.log(data);
  // });
  // let r2: any = await client.query(employees);
  // console.log(r2);
  // r2 = await client.query(query, {size: 2});
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