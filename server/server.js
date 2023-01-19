const express = require('express');

// Import ApolloServer

const {ApolloServer} = require('apollo-server-express');
const {authMiddleware} = require('./utils/auth');

// Import Our typeDefs and Resolvers

const {typeDefs, resolvers} = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;

// Create a New Apollo Server and Pass in Our Schema Data

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const path = require('path');
// Create a New Instance of an Apollo Server With the GraphQL Schema

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();

  // Integrate Our Apollo Server With the Express Application as Middleware

  server.applyMiddleware({app});

  // Serve up Static Assets

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);

      // Log Where We Can Go to Test Our GraphQL API

      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the Async Function to Start the Server

startApolloServer(typeDefs, resolvers);
