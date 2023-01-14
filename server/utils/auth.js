const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    // Allows the JSON Web Token to Be Sent via req.body, req.query, or req.headers

    let token = req.body.token || req.query.token || req.headers.authorization;

    // Splits the Token String Into an Array and Returns The Actual Token

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    // If the Token Can Be Verified, Add the Decoded User’s Data to the Request So It Can Be Accessed in the Resolver

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    // Returns the Request Object So It Can Be Passed to the Resolver as `Context`

    return req;
  },
  signToken: function ({ email, username, _id }) {
    const payload = { email, username, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
