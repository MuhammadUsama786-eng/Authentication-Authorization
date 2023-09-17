const jwt = require('jsonwebtoken');

function authJwt(req, res, next) {
const token = req.header('Authorization');

if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}


module.exports = authJwt;