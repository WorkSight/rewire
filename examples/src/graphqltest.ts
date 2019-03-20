import gql                        from 'graphql-tag';
import { watch }                  from 'rewire-core';
import { client as createClient } from 'rewire-graphql';

const client = createClient('https://zr859vll97.lp.gql.zone/graphql');

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

const mutation = gql`
  mutation($text: String!) {
    addTodo(text: $text) {
      id
      text
    }
  }`;

const query2 = gql`
{
  search(options: {filter: {eq: {name: "sandy"}}}, size: 3) {
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

async function run() {
  let r2: any = client.query(query, {size: 2});
  r2          = await client.query(query, {size: 2});
  let r3: any = await client.query(query2, {size: 2});
  console.log(await r2);
  console.log();
  console.log(await [
    client.query(query, {size: 2}),
    client.query(query, {size: 2}),
    client.query(query2),
    client.mutation(mutation, {text: 'booga'})
  ]);
  // let r  = client.executeQuery({query, variables: {size: 2}});
  // let r = await client.executeMutation({query: mutation, variables: {text: 'todo'}});
  // let firstResult: any = result;
  console.log(r2);
  watch(() => r2.data.search.results[0].employee.name, () => console.log('changed'));
  // result = await client.executeQuery({query, variables: {size: 1}});
  // result = await client.executeQuery({query: query2});
  // result = await client.executeQuery({query: query2});
  setTimeout(() => {
    console.log(r2.data.search.results[1].employee === r3.data.search.results[0].employee);
    r3.data.search.results[1].employee.name = 'booger nose';
  }, 5000);
  // console.log(result);
}

// run();
