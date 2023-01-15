const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    user: async (parent, { username }) => {
      return User.findOne({ _id: username });
    },

    // By Adding Context to Our Query, We Can Retrieve the Logged in User Without Specifically Searching for Them

    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError(
          'A user with this email address was not found!'
        );
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    // Add a Third Argument to the Resolver to Access Data in Our `Context`

    addSkill: async (parent, { bookData }, context) => {
      // If Context Has a `User` Property, That Means the User Executing This Mutation Has a Valid JSON Web Token and Is Logged In

      if (context.user) {
        await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: bookData },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }

      // If a User Attempts to Execute This Mutation and Isn’t Logged In, Throw an Error

      throw new AuthenticationError('You need to be logged in!');
    },

    // Make It So a Logged in User Can Only Remove a Book From Their Own Profile

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: bookData } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
