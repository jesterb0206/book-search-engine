const express = require('express');
const path = require('path');

// Implement the Apollo Server

const { ApolloServer } = require('apollo-server-express');

// Import the typeDefs and resolvers

const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

// MongoDB Connection

const db = require('./config/connection');

// Express Server

const app = express();
const PORT = process.env.PORT || 3001;

// Apollo Server

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// Apply the Apollo Server to the Express App

server.applyMiddleware({ app });

// Middleware Parsing

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const _dirname = path.dirname('');
const buildPath = path.join(_dirname, '../client/build');

app.use(express.static(buildPath));

// If in Production, Serve Client/Build as Static Assets

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Get All

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
