const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Trigger {
    id: String!
    title: String
    active: Boolean
  }
  type Query {
    trigger(id: String!): Trigger
  }
`;

// Provide a resolver function example for Trigger type.
const getTrigger = function(triggerId) {
  const authBase64 = Buffer.from(
    process.env.olx_pl_user + ":" + process.env.olx_pl_pass
  ).toString("base64");

  var requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authBase64}`
    }
  };

  return fetch(
    `https://olxpl.zendesk.com/api/v2/triggers/${triggerId}.json`,
    requestOptions
  )
    .then(response => response.json())
    .then(result => {
      const { id, title, active } = result.trigger;
      return {
        id,
        title,
        active
      };
    })
    .catch(error => console.log("error", error));
};

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    trigger: (root, args, context) => getTrigger(args.id)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
