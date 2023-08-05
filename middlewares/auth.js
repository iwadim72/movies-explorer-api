const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized');

const handleAuthError = (res, req, next) => {
  next(new UnauthorizedError('Необходима авторизация'));
};

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res, req, next);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, process.env.NODE_ENV !== 'production' ? 'super-strong' : process.env.JWT_SECRET);
  } catch (err) {
    return handleAuthError(res, req, next);
  }

  req.user = payload;

  return next();
};
