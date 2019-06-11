import gql                                  from 'graphql-tag';
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

const te = gql`
  query es {
    employeeSchedule(effective: "[2017-01-01,2017-01-30]", filter: {employeeIds: ["79bc245e-d007-4755-b617-5047cd7c06de", "32fd0806-1c83-4809-a320-429c2eb92ec5", "3bf11682-3afe-40cc-a1d4-370d9b460c10", "9f43b0e2-02c0-4a95-ac56-020c423d5657", "ce758be6-873b-48c9-85b0-9225f9273d89", "7bc36573-8841-4066-8753-306cfbf2e9a2", "e2a209f4-ae0d-405a-a157-b4fa887d67b9", "a2a8aa3a-bc18-49d4-a83d-5e7cf37606c5", "7a05f099-c4af-4e5e-ba75-5564fea3804f", "043e5ddb-b263-4616-bbce-860448ce7e99", "b3ec75a4-690d-4726-894b-ec613c3a5587", "43478dc0-0a95-44a8-b632-d36803173eb5", "e33d18d8-83bc-4cc5-ab95-9c72741fec37"]}, first: 20) {
      data {
        id
        assignedEmployee: employee {
          id
          name
        }
        assignedOccupation: occupation {
          name
        }
        schedule {
          shiftType: template {
            name
          }
          earnedDate
          details {
            accountCode
            scheduledOccupation: occupation {
              name
            }
            effective
            reason {
              name
            }
          }
        }
      }
    }
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
  // client.bearer = '0ab38f1096494eb96aa206a7053370b9e171743058f8ce70';
  client.bearer = '7d2bc12c97f090d9e12a295d71fc0979b69737669c1a47b8';
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
  let r5 = await client.query(te);
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
