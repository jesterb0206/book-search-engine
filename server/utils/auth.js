const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },

  authMiddleware: function ({ req }) {
    // Allows the Token to Be Sent via req.body, req.query, or req.headers

    let token = req.body.token || req.query.token || req.headers.authorization;

    // Separate "Bearer" From "<tokenvalue>"

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // If No Token Is Present, Return the Request Object as Is

    if (!token) {
      return req;
    }

    try {
      // Decode and Attach the User’s Data to the Request Object

      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    // Return the Updated Request Object

    return req;
  },
};
