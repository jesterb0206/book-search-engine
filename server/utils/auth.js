const jwt = require('jsonwebtoken');

// Sets Token Secret and Expiration Date

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // A Function for the Authenticated Routes

  authMiddleware: function ({ req }) {
    // Allows the JSON Web Token to Be Sent via req.body, req.query, or req.headers

    let token = req.query.token || req.headers.authorization || req.body.token;

    // Splits the Token String Into an Array and Returns The Actual Token

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    // If the Token Can Be Verified, Add the Decoded User’s Data to the Request So It Can Be Accessed in the Resolver

    // Verify the Token and Get the User Data From It

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    // Returns the Request Object So It Can Be Passed to the Resolver as `Context`

    return req;
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
