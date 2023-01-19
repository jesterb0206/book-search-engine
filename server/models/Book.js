const { Schema } = require('mongoose');

// This Is a Subdocument Schema, It Won’t Become Its Own Model but We’ll Use It as the Schema for the User’s `savedBooks` Array in User.js

const bookSchema = new Schema({
  authors: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  bookId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
});

module.exports = bookSchema;
