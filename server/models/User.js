const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// Import Schema From Book.js

const bookSchema = require('./Book');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },

    // Set savedBooks to Be an Array of Data That Adheres to the bookSchema

    savedBooks: [bookSchema],
  },

  // Set This to Use Virtual Below

  {
    toJSON: {
      virtuals: true,
    },
  }
);

// Hash User Password

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// Custom Method to Compare and Validate Passwords for Logging In

userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// When We Query a User, We’ll Also Get Another Field Called `bookCount` With the Number of Saved Books We Have

userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

const User = model('User', userSchema);

module.exports = User;
