const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-request');
const ConflictError = require('../errors/conflictError');

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then(() => res.send({
      data: {
        name, email,
      },
    }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      } else if (err.code === 11000) {
        next(new ConflictError('Данный email уже зарегистрирован'));
      } else { next(err); }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, process.env.NODE_ENV !== 'production' ? 'super-strong' : process.env.JWT_SECRET, { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.searchUserById = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователь с указанным _id не найден.');
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.CastError) {
        next(new BadRequest('Передан некорректный _id пользовтателя'));
      } else {
        next(err);
      }
    });
};

function updateUserInfo(req, res, next, data) {
  User.findByIdAndUpdate(req.user._id, data, { runValidators: true, context: 'query', new: true })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else { throw new NotFoundError('Пользователь с указанным _id не найден.'); }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequest('Переданы некорректные данные при обновлении пользовтателя'));
      } else {
        next(err);
      }
    });
}

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;

  updateUserInfo(req, res, next, { name, email });
};
